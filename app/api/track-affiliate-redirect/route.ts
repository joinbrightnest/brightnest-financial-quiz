import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const affiliateCode = searchParams.get('affiliate');
    const utm_source = searchParams.get('utm_source');
    const utm_medium = searchParams.get('utm_medium');
    const utm_campaign = searchParams.get('utm_campaign');

    if (!affiliateCode) {
      return NextResponse.json({ success: false, error: "Affiliate code is required" });
    }

    console.log("🎯 Tracking affiliate redirect:", {
      affiliateCode,
      utm_source,
      utm_medium,
      utm_campaign
    });

    // Find affiliate by referral code
    const affiliate = await prisma.affiliate.findUnique({
      where: { referralCode: affiliateCode },
    });

    if (!affiliate) {
      console.log("❌ Affiliate not found for redirect:", affiliateCode);
      return NextResponse.json({ success: false, error: "Affiliate not found" });
    }

    // Check if this affiliate has a custom tracking link
    if ((affiliate as any).customTrackingLink) {
      console.log("❌ Referral code link permanently disabled - affiliate has custom tracking link:", {
        referralCode: affiliateCode,
        customTrackingLink: (affiliate as any).customTrackingLink
      });
      return NextResponse.json({ success: false, error: "Referral code disabled" });
    }

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
      console.log("🔄 Duplicate redirect click detected for same browser, skipping:", {
        affiliate: affiliate.referralCode,
        userAgent: userAgent.substring(0, 50) + "...",
        existingClickTime: existingClick.createdAt
      });
      return NextResponse.json({ success: true, message: "Duplicate click skipped" });
    }

    // Record the click
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

    // Update affiliate's total clicks
    await prisma.affiliate.update({
      where: { id: affiliate.id },
      data: {
        totalClicks: {
          increment: 1,
        },
      },
    });

    console.log("✅ Affiliate redirect click recorded successfully for:", affiliate.referralCode);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error tracking affiliate redirect:", error);
    return NextResponse.json({ success: false, error: "Internal server error" });
  }
}
