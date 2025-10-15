import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { customTrackingLink } = await request.json();
    const { id: affiliateId } = await params;

    console.log("Updating affiliate tracking link:", {
      affiliateId,
      customTrackingLink
    });

    // Validate the custom tracking link format
    if (customTrackingLink && customTrackingLink.trim()) {
      const link = customTrackingLink.trim();
      
      // Basic validation - should be a valid URL or a simple path
      if (!link.startsWith('http://') && !link.startsWith('https://') && !link.startsWith('/')) {
        return NextResponse.json(
          { error: "Custom tracking link must be a valid URL or start with /" },
          { status: 400 }
        );
      }
    }

    // Update the affiliate's custom tracking link
    const updatedAffiliate = await prisma.affiliate.update({
      where: { id: affiliateId },
      data: {
        customTrackingLink: customTrackingLink?.trim() || null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        referralCode: true,
        customLink: true,
        customTrackingLink: true,
        updatedAt: true,
      },
    });

    console.log("Affiliate tracking link updated successfully:", updatedAffiliate);

    // Log the change for audit purposes
    await prisma.affiliateAuditLog.create({
      data: {
        affiliateId: affiliateId,
        action: "tracking_link_updated",
        details: {
          oldTrackingLink: null, // We don't store the old value, but we could
          newTrackingLink: customTrackingLink?.trim() || null,
          updatedBy: "admin", // You could add admin user tracking here
        },
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Affiliate tracking link updated successfully",
      affiliate: updatedAffiliate,
    });

  } catch (error) {
    console.error("Error updating affiliate tracking link:", error);
    return NextResponse.json(
      { 
        error: "Failed to update affiliate tracking link", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
