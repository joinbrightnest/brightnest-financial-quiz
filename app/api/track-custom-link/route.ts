import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { customLink, utm_source, utm_medium, utm_campaign } = await request.json();

    console.log("🎯 Custom tracking link visit:", {
      customLink,
      utm_source,
      utm_medium,
      utm_campaign
    });

    if (!customLink) {
      return NextResponse.json(
        { error: "Custom link is required" },
        { status: 400 }
      );
    }

    // Find the affiliate by custom tracking link
    const affiliate = await prisma.affiliate.findFirst({
      where: {
        customTrackingLink: customLink,
      },
    });

    // Also check if this is a referral code that should be disabled
    if (!affiliate) {
      const referralAffiliate = await prisma.affiliate.findFirst({
        where: {
          referralCode: customLink.replace('/', ''), // Remove leading slash
        },
      });
      
      if (referralAffiliate && (referralAffiliate as any).customTrackingLink) {
        console.log("❌ Referral code link permanently disabled - affiliate has custom tracking link:", {
          referralCode: customLink,
          customTrackingLink: (referralAffiliate as any).customTrackingLink
        });
        return NextResponse.json(
          { error: "This referral code link has been permanently removed. Please use the current tracking link." },
          { status: 410 } // 410 Gone - resource no longer available
        );
      }
    }

    if (!affiliate) {
      console.log("❌ No affiliate found for custom link:", customLink);
      return NextResponse.json(
        { error: "Affiliate not found for this custom link" },
        { status: 404 }
      );
    }

    console.log("✅ Found affiliate for custom link:", {
      affiliateId: affiliate.id,
      name: affiliate.name,
      referralCode: affiliate.referralCode,
      customTrackingLink: affiliate.customTrackingLink
    });

    // Get client IP and User Agent
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
        console.log("✅ Custom link click recorded successfully for affiliate:", affiliate.referralCode);
      } catch (clickError) {
        console.error("Error recording custom link click:", clickError);
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
      message: "Custom link tracked successfully",
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

    console.log("✅ Affiliate cookie set for custom link:", affiliate.referralCode);

    return response;

  } catch (error) {
    console.error("❌ Error tracking custom link:", error);
    return NextResponse.json(
      { 
        error: "Failed to track custom link", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
