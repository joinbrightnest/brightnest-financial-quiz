import { notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import SharedHomePage from "../../components/SharedHomePage";

const prisma = new PrismaClient();

// In-memory cache to prevent duplicate requests within 30 seconds
const requestCache = new Map<string, number>();
const CACHE_DURATION = 30 * 1000; // 30 seconds

// Clean up expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of requestCache.entries()) {
    if (now - timestamp > CACHE_DURATION) {
      requestCache.delete(key);
    }
  }
}, CACHE_DURATION);

interface AffiliatePageProps {
  params: Promise<{ affiliateCode: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function validateAndTrackAffiliate(affiliateCode: string, searchParams: { [key: string]: string | string[] | undefined }, request: Request) {
  try {
    const utm_source = typeof searchParams.utm_source === 'string' ? searchParams.utm_source : undefined;
    const utm_medium = typeof searchParams.utm_medium === 'string' ? searchParams.utm_medium : undefined;
    const utm_campaign = typeof searchParams.utm_campaign === 'string' ? searchParams.utm_campaign : undefined;

    // Generate a unique request ID for debugging
    const requestId = Math.random().toString(36).substring(2, 15);
    
    console.log("🎯 Server-side affiliate validation:", {
      requestId,
      affiliateCode,
      utm_source,
      utm_medium,
      utm_campaign,
      timestamp: new Date().toISOString()
    });

    // Find affiliate by referral code
    let affiliate = null;
    try {
      affiliate = await prisma.affiliate.findUnique({
        where: { referralCode: affiliateCode },
      });
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return false;
    }

    if (affiliate) {
      // Check if this affiliate has a custom tracking link
      // If they do, the referral code link should not work
      if ((affiliate as any).customTrackingLink) {
        console.log("❌ Referral code link permanently disabled - affiliate has custom tracking link:", {
          referralCode: affiliateCode,
          customTrackingLink: (affiliate as any).customTrackingLink
        });
        return false;
      }

      console.log("✅ Valid affiliate found:", {
        requestId,
        id: affiliate.id,
        name: affiliate.name,
        referralCode: affiliate.referralCode,
        isApproved: affiliate.isApproved,
        isActive: affiliate.isActive
      });

      // Get client IP and user agent for tracking
      const ipAddress = request.headers.get("x-forwarded-for") || 
                       request.headers.get("x-real-ip") || 
                       "unknown";
      const userAgent = request.headers.get("user-agent") || "unknown";
      
      // Ignore bots, crawlers, and deployment checks
      const botPatterns = /bot|crawler|spider|prerender|vercel|headless|lighthouse/i;
      if (botPatterns.test(userAgent)) {
        console.log("🤖 Bot/crawler detected, skipping affiliate click tracking");
        return true; // Valid affiliate, but skip tracking
      }
      
      // Create a more robust fingerprint for duplicate detection
      const fingerprint = `${affiliate.id}-${ipAddress}-${userAgent}`;
      console.log("🔍 Request fingerprint:", {
        requestId,
        fingerprint: fingerprint.substring(0, 50) + "...",
        ipAddress,
        userAgent: userAgent.substring(0, 50) + "..."
      });

      // Check in-memory cache first (fastest duplicate detection)
      const now = Date.now();
      const cachedTime = requestCache.get(fingerprint);
      if (cachedTime && (now - cachedTime) < CACHE_DURATION) {
        console.log("🚫 Duplicate request blocked by cache:", {
          requestId,
          affiliate: affiliate.referralCode,
          timeSinceLastRequest: now - cachedTime
        });
        return true; // Valid affiliate, but skip tracking
      }

      // Check if we already tracked this browser recently (within 5 minutes) to avoid duplicate clicks
      // Use a more robust duplicate detection with IP + user agent + reasonable time window
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const existingClick = await prisma.affiliateClick.findFirst({
        where: {
          affiliateId: affiliate.id,
          ipAddress: ipAddress,
          userAgent: userAgent,
          createdAt: {
            gte: fiveMinutesAgo
          }
        }
      });

      if (existingClick) {
        console.log("🔄 Duplicate click detected for same browser, skipping:", {
          requestId,
          affiliate: affiliate.referralCode,
          userAgent: userAgent.substring(0, 50) + "...",
          existingClickTime: existingClick.createdAt
        });
        // Return true even if we're skipping - the affiliate is still valid
        return true;
      }

      {
        // Record the click and update total clicks in a single transaction to prevent race conditions
        try {
          await prisma.$transaction(async (tx) => {
            // Double-check for duplicates within the transaction
            const duplicateCheck = await tx.affiliateClick.findFirst({
              where: {
                affiliateId: affiliate.id,
                ipAddress: ipAddress,
                userAgent: userAgent,
                createdAt: {
                  gte: twoMinutesAgo
                }
              }
            });

            if (!duplicateCheck) {
              // Record the click
              await tx.affiliateClick.create({
                data: {
                  affiliateId: affiliate.id,
                  referralCode: affiliate.referralCode,
                  ipAddress,
                  userAgent,
                  utmSource: utm_source,
                  utmMedium: utm_medium,
                  utmCampaign: utm_campaign,
                },
              });

              // Update affiliate's total clicks
              await tx.affiliate.update({
                where: { id: affiliate.id },
                data: {
                  totalClicks: {
                    increment: 1,
                  },
                },
              });

              // Update cache to prevent future duplicates
              requestCache.set(fingerprint, now);
              
              console.log("✅ Affiliate click recorded and total updated successfully for:", {
                requestId,
                affiliate: affiliate.referralCode
              });
            } else {
              console.log("🔄 Duplicate click detected within transaction, skipping:", {
                requestId,
                affiliate: affiliate.referralCode
              });
            }
          });
        } catch (transactionError) {
          console.error("Error in affiliate click transaction:", transactionError);
          // Continue anyway - still set cookie
        }
      }

      return true;
    } else {
      console.log("❌ Affiliate not found for code:", affiliateCode);
      return false;
    }
  } catch (error) {
    console.error("❌ Error validating affiliate:", error);
    return false;
  }
}

export default async function AffiliatePage({ params, searchParams }: AffiliatePageProps) {
  const { affiliateCode } = await params;
  const resolvedSearchParams = await searchParams;

  // We need to get the request object to access headers for tracking
  // In Next.js App Router, we can use headers() from next/headers
  const { headers } = await import('next/headers');
  const headersList = await headers();
  
  // Create a mock request object with the headers we need
  const mockRequest = {
    headers: {
      get: (name: string) => {
        if (name === 'x-forwarded-for') return headersList.get('x-forwarded-for');
        if (name === 'x-real-ip') return headersList.get('x-real-ip');
        if (name === 'user-agent') return headersList.get('user-agent');
        return null;
      }
    }
  } as Request;

  // Validate affiliate server-side
  const isValidAffiliate = await validateAndTrackAffiliate(affiliateCode, resolvedSearchParams, mockRequest);

  // If not a valid affiliate, show 404
  if (!isValidAffiliate) {
    notFound();
  }

  // Use the shared homepage component with affiliate code for valid affiliates
  return <SharedHomePage affiliateCode={affiliateCode} />;
}
