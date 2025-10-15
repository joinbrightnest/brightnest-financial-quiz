import { notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import SharedHomePage from "../../components/SharedHomePage";

const prisma = new PrismaClient();

interface AffiliatePageProps {
  params: Promise<{ affiliateCode: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function validateAndTrackAffiliate(affiliateCode: string, searchParams: { [key: string]: string | string[] | undefined }, request: Request) {
  try {
    const utm_source = typeof searchParams.utm_source === 'string' ? searchParams.utm_source : undefined;
    const utm_medium = typeof searchParams.utm_medium === 'string' ? searchParams.utm_medium : undefined;
    const utm_campaign = typeof searchParams.utm_campaign === 'string' ? searchParams.utm_campaign : undefined;

    console.log("🎯 Server-side affiliate validation:", {
      affiliateCode,
      utm_source,
      utm_medium,
      utm_campaign
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

      // Check if we already tracked this browser recently (within 1 hour) to avoid duplicate clicks
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const existingClick = await prisma.affiliateClick.findFirst({
        where: {
          affiliateId: affiliate.id,
          userAgent: userAgent,
          createdAt: {
            gte: oneHourAgo
          }
        }
      });

      if (existingClick) {
        console.log("🔄 Duplicate click detected for same browser, skipping:", {
          affiliate: affiliate.referralCode,
          userAgent: userAgent.substring(0, 50) + "...",
          existingClickTime: existingClick.createdAt
        });
      } else {
        // Record the click with error handling
        try {
          await prisma.affiliateClick.create({
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
          console.log("✅ Affiliate click recorded successfully for:", affiliate.referralCode);
        } catch (clickError) {
          console.error("Error recording affiliate click:", clickError);
          // Continue anyway - still set cookie
        }
      }

      // Update affiliate's total clicks only if we recorded a unique click
      if (!existingClick) {
        try {
          await prisma.affiliate.update({
            where: { id: affiliate.id },
            data: {
              totalClicks: {
                increment: 1,
              },
            },
          });
          console.log("✅ Affiliate total clicks updated successfully");
        } catch (updateError) {
          console.error("Error updating affiliate clicks:", updateError);
          // Continue anyway - click was recorded
        }
      } else {
        console.log("🔄 Skipping total clicks update - duplicate click");
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
  const headersList = headers();
  
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
