import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { affiliateId, approved, customTrackingLink } = await request.json();

    if (!affiliateId) {
      return NextResponse.json(
        { error: "Affiliate ID is required" },
        { status: 400 }
      );
    }

    // Custom tracking link is optional - if not provided, keep the auto-generated one

    // Get current affiliate data
    const currentAffiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
    });

    if (!currentAffiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    let updateData: any = {
      isApproved: approved,
      isActive: approved,
    };

    if (approved && customTrackingLink) {
      // Clean the tracking link (remove leading slash if present)
      const cleanTrackingLink = customTrackingLink.trim().replace(/^\/+/, '');
      
      // Generate new referral code based on the custom tracking link
      const newReferralCode = cleanTrackingLink;
      
      // Create the full custom link
      const fullCustomLink = `https://joinbrightnest.com/${cleanTrackingLink}`;
      
      updateData = {
        ...updateData,
        referralCode: newReferralCode,
        customLink: fullCustomLink,
        customTrackingLink: `/${cleanTrackingLink}`,
      };
    }

    // Update affiliate approval status and optionally override tracking link
    if (approved && customTrackingLink) {
      // Clean the tracking link (remove leading slash if present)
      const cleanTrackingLink = customTrackingLink.trim().replace(/^\/+/, '');
      
      // Generate new referral code based on the custom tracking link
      const newReferralCode = cleanTrackingLink;
      
      // Create the full custom link
      const fullCustomLink = `https://joinbrightnest.com/${cleanTrackingLink}`;
      
      // Update with custom tracking link
      await prisma.affiliate.update({
        where: { id: affiliateId },
        data: {
          isApproved: approved,
          referralCode: newReferralCode,
          customLink: fullCustomLink,
          customTrackingLink: `/${cleanTrackingLink}`,
        },
      });
    } else {
      // Just update approval status, keep auto-generated referral code
      await prisma.affiliate.update({
        where: { id: affiliateId },
        data: {
          isApproved: approved,
        },
      });
    }

    // Get the updated affiliate data
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Failed to update affiliate" },
        { status: 500 }
      );
    }

    // Create audit log
    await prisma.affiliateAuditLog.create({
      data: {
        affiliateId: affiliate.id,
        action: approved ? "account_approved" : "account_rejected",
        details: { 
          approved,
          oldReferralCode: currentAffiliate.referralCode,
          newReferralCode: approved && customTrackingLink ? customTrackingLink.trim().replace(/^\/+/, '') : null,
          customTrackingLink: approved && customTrackingLink ? `/${customTrackingLink.trim().replace(/^\/+/, '')}` : null,
        },
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Affiliate ${approved ? 'approved' : 'rejected'} successfully`,
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        tier: affiliate.tier,
        referralCode: affiliate.referralCode,
        customLink: affiliate.customLink,
        customTrackingLink: (affiliate as any).customTrackingLink,
        isApproved: affiliate.isApproved,
      },
    });
  } catch (error) {
    console.error("Affiliate approval error:", error);
    return NextResponse.json(
      { error: "Failed to update affiliate status" },
      { status: 500 }
    );
  }
}
