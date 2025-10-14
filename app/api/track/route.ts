import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get("ref");
    const utm_source = searchParams.get("utm_source");
    const utm_medium = searchParams.get("utm_medium");
    const utm_campaign = searchParams.get("utm_campaign");

    if (!ref) {
      // No referral code, redirect to main site
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Find affiliate by referral code
    const affiliate = await prisma.affiliate.findUnique({
      where: { referralCode: ref },
    });

    if (!affiliate || !affiliate.isActive) {
      // Invalid or inactive affiliate, redirect to main site
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Log the tracking attempt
    console.log("Tracking click for affiliate:", {
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
    const referrer = request.headers.get("referer") || "unknown";

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
      // Continue anyway - don't let click recording failure break the redirect
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
      // Continue anyway
    }

    // Set affiliate tracking cookie (30 days)
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set("affiliate_ref", ref, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Tracking error:", error);
    // On error, just redirect to main site
    return NextResponse.redirect(new URL("/", request.url));
  }
}
