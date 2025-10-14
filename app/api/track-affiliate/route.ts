import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log("Track affiliate API called");
    const { ref, utm_source, utm_medium, utm_campaign } = await request.json();
    console.log("Request data:", { ref, utm_source, utm_medium, utm_campaign });

    if (!ref) {
      console.log("No referral code provided");
      return NextResponse.json({ success: false, error: "No referral code" });
    }

    console.log("Tracking affiliate click:", { ref, utm_source, utm_medium, utm_campaign });

    // Try to find affiliate by referral code, but don't fail if database is not available
    let affiliate = null;
    try {
      affiliate = await prisma.affiliate.findUnique({
        where: { referralCode: ref },
      });
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      // Continue without database - still set cookie for tracking
    }

    if (affiliate) {
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
          console.log("✅ Unique browser click recorded successfully for affiliate:", affiliate.referralCode);
        } catch (clickError) {
          console.error("Error recording click:", clickError);
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
    } else {
      console.log("Affiliate not found or database unavailable, but still setting cookie for:", ref);
    }

    // Always set affiliate tracking cookie (30 days) - this is the most important part
    const response = NextResponse.json({ success: true });
    response.cookies.set("affiliate_ref", ref, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    console.log("✅ Affiliate cookie set successfully for:", ref);
    return response;
  } catch (error) {
    console.error("Tracking error:", error);
    
    // Even if there's an error, try to set the cookie
    try {
      const { ref } = await request.json();
      if (ref) {
        const response = NextResponse.json({ success: true });
        response.cookies.set("affiliate_ref", ref, {
          maxAge: 30 * 24 * 60 * 60, // 30 days
          httpOnly: false, // Allow client-side access
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
        console.log("✅ Affiliate cookie set as fallback for:", ref);
        return response;
      }
    } catch (fallbackError) {
      console.error("Fallback cookie setting failed:", fallbackError);
    }
    
    return NextResponse.json(
      { success: false, error: "Tracking failed" },
      { status: 500 }
    );
  }
}
