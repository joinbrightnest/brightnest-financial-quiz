import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/admin-auth-server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin authentication required" },
      { status: 401 }
    );
  }
  
  try {
    const { affiliateId, approved, customTrackingLink } = await request.json();

    if (!affiliateId) {
      return NextResponse.json(
        { error: "Affiliate ID is required" },
        { status: 400 }
      );
    }

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

    if (approved) {
      // APPROVE: Update affiliate with custom tracking link or keep auto-generated
      let updateData: any = {
        isApproved: true,  // Mark as approved so they can log in
      };
      
      if (customTrackingLink && customTrackingLink.trim()) {
        // Use custom tracking link
        const cleanTrackingLink = customTrackingLink.trim().replace(/^\/+/, '');
        updateData = {
          ...updateData,
          referralCode: cleanTrackingLink,
          customLink: `https://joinbrightnest.com/${cleanTrackingLink}`,
        };
      }
      // If no custom link provided, keep the auto-generated one

      // Update the affiliate using raw SQL to handle missing fields
      if (customTrackingLink && customTrackingLink.trim()) {
        const cleanTrackingLink = customTrackingLink.trim().replace(/^\/+/, '');
        await prisma.$executeRaw`
          UPDATE "affiliates"
          SET "referral_code" = ${cleanTrackingLink},
              "custom_link" = ${`https://joinbrightnest.com/${cleanTrackingLink}`},
              "is_approved" = true
          WHERE "id" = ${affiliateId}
        `;
      } else {
        await prisma.$executeRaw`
          UPDATE "affiliates"
          SET "is_approved" = true
          WHERE "id" = ${affiliateId}
        `;
      }

      // Get the updated affiliate
      const updatedAffiliate = await prisma.affiliate.findUnique({
        where: { id: affiliateId },
      });

      if (!updatedAffiliate) {
        return NextResponse.json(
          { error: "Affiliate not found after update" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Affiliate approved successfully",
        affiliate: {
          id: updatedAffiliate.id,
          name: updatedAffiliate.name,
          email: updatedAffiliate.email,
          tier: updatedAffiliate.tier,
          referralCode: updatedAffiliate.referralCode,
          customLink: updatedAffiliate.customLink,
        },
      });
    } else {
      // REJECT: Mark affiliate as inactive instead of deleting
      console.log(`Rejecting affiliate: ${currentAffiliate.name} (${currentAffiliate.email})`);
      
      // Mark as inactive and unapproved instead of deleting
      await prisma.affiliate.update({
        where: { id: affiliateId },
        data: {
          isActive: false,
          isApproved: false,
        },
      });

      console.log(`Successfully rejected affiliate: ${affiliateId}`);

      return NextResponse.json({
        success: true,
        message: "Affiliate rejected and deactivated",
        affiliate: null,
      });
    }
  } catch (error) {
    console.error("Affiliate approval error:", error);
    return NextResponse.json(
      { error: "Failed to process affiliate request" },
      { status: 500 }
    );
  }
}
