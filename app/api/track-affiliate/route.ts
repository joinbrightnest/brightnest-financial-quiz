import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { ref, utm_source, utm_medium, utm_campaign } = await request.json();

    if (!ref) {
      return NextResponse.json({ success: false, error: "No referral code" });
    }

    console.log("Tracking affiliate click:", { ref, utm_source, utm_medium, utm_campaign });

    // Find affiliate by referral code
    const affiliate = await prisma.affiliate.findUnique({
      where: { referralCode: ref },
    });

    if (!affiliate || !affiliate.isActive) {
      console.log("Affiliate not found or inactive:", ref);
      return NextResponse.json({ success: false, error: "Invalid affiliate" });
    }

    console.log("Found affiliate:", {
      id: affiliate.id,
      name: affiliate.name,
      referralCode: affiliate.referralCode,
      isApproved: affiliate.isApproved,
      isActive: affiliate.isActive
    });

    // Get client IP and user agent
    const ipAddress = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

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
      console.log("Click recorded successfully for affiliate:", affiliate.referralCode);
    } catch (clickError) {
      console.error("Error recording click:", clickError);
      return NextResponse.json({ success: false, error: "Failed to record click" });
    }

    // Update affiliate's total clicks
    try {
      await prisma.affiliate.update({
        where: { id: affiliate.id },
        data: {
          totalClicks: {
            increment: 1,
          },
        },
      });
      console.log("Affiliate total clicks updated successfully");
    } catch (updateError) {
      console.error("Error updating affiliate clicks:", updateError);
      // Continue anyway - click was recorded
    }

    // Set affiliate tracking cookie (30 days)
    const response = NextResponse.json({ success: true });
    response.cookies.set("affiliate_ref", ref, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json(
      { success: false, error: "Tracking failed" },
      { status: 500 }
    );
  }
}
