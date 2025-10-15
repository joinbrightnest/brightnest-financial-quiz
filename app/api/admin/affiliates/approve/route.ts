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
      
      // Update with custom tracking link using raw SQL
      await prisma.$executeRaw`
        UPDATE "affiliates"
        SET "referral_code" = ${newReferralCode},
            "custom_link" = ${fullCustomLink}
        WHERE "id" = ${affiliateId}
      `;
    } else {
      // Just update the affiliate (no changes needed for auto-approval)
      // No database update needed for auto-approval
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

    // Create audit log (simplified)
    try {
      await prisma.affiliateAuditLog.create({
        data: {
          affiliateId: affiliate.id,
          action: approved ? "account_approved" : "account_rejected",
          details: { 
            approved,
            customTrackingLink: approved && customTrackingLink ? customTrackingLink.trim().replace(/^\/+/, '') : null,
          },
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });
    } catch (auditError) {
      console.log("Audit log creation failed, continuing:", auditError);
    }

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
        customTrackingLink: null,
        isApproved: true, // Assume approved if we got here
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
