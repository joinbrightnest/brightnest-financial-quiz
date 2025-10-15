import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const affiliateCode = searchParams.get('code');
    const utm_source = searchParams.get('utm_source');
    const utm_medium = searchParams.get('utm_medium');
    const utm_campaign = searchParams.get('utm_campaign');

    if (!affiliateCode) {
      return NextResponse.json(
        { success: false, error: "Affiliate code is required" },
        { status: 400 }
      );
    }

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
      // If database is down, we can't verify affiliate, so treat as not found
      return NextResponse.json(
        { success: false, error: "Database error, affiliate verification failed" },
        { status: 500 }
      );
    }

    if (affiliate) {
      // Check if this affiliate has a custom tracking link
      // If they do, the referral code link should not work
      if ((affiliate as any).customTrackingLink) {
        console.log("❌ Referral code link permanently disabled - affiliate has custom tracking link:", {
          referralCode: affiliateCode,
          customTrackingLink: (affiliate as any).customTrackingLink
        });
        return NextResponse.json(
          { error: "This referral code link has been permanently removed. Please use the current tracking link." },
          { status: 410 } // 410 Gone - resource no longer available
        );
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

      // Create response with affiliate cookie
      const response = NextResponse.json({
        success: true,
        message: "Affiliate validated and tracked successfully",
        affiliate: {
          id: affiliate.id,
          referralCode: affiliate.referralCode,
          name: affiliate.name,
        },
      });

      // Set affiliate cookie for the quiz system
      response.cookies.set("affiliate_ref", affiliate.referralCode, {
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        sameSite: "lax",
      });

      console.log("✅ Affiliate cookie set for:", affiliate.referralCode);
      return response;
    } else {
      console.log("❌ Affiliate not found for code:", affiliateCode);
      return NextResponse.json(
        { success: false, error: "Affiliate not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("❌ Error validating affiliate:", error);
    return NextResponse.json(
      { success: false, error: "Failed to validate affiliate" },
      { status: 500 }
    );
  }
}
