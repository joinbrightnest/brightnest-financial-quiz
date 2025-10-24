import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyAdminAuth } from "@/lib/admin-auth-server";

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin authentication required" },
      { status: 401 }
    );
  }
  
  try {
    const { id: affiliateId } = await params;

    console.log(`🗑️ Deleting affiliate: ${affiliateId}`);

    // Get affiliate data before deletion for logging
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
      include: {
        clicks: true,
        conversions: true,
        auditLogs: true,
      },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    console.log(`Found affiliate: ${affiliate.name} (${affiliate.email})`);
    console.log(`Related data: ${affiliate.clicks.length} clicks, ${affiliate.conversions.length} conversions, ${affiliate.auditLogs.length} audit logs`);

    // Create audit log before deletion
    try {
      await prisma.affiliateAuditLog.create({
        data: {
          affiliateId: null, // Set to null to avoid foreign key constraint
          action: "deleted",
          details: {
            reason: "Admin deletion",
            affiliateId: affiliateId,
            affiliateName: affiliate.name,
            affiliateEmail: affiliate.email,
            deletedData: {
              clicks: affiliate.clicks.length,
              conversions: affiliate.conversions.length,
              auditLogs: affiliate.auditLogs.length,
            },
            timestamp: new Date().toISOString(),
          },
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });
    } catch (auditError) {
      console.warn("Failed to create audit log for deletion:", auditError);
      // Continue with deletion even if audit log fails
    }

    // Mark affiliate as inactive and unapproved instead of deleting to avoid foreign key constraints
    await prisma.affiliate.update({
      where: { id: affiliateId },
      data: {
        isActive: false,
        isApproved: false,
      },
    });

    console.log(`✅ Successfully deleted affiliate: ${affiliate.name} (${affiliate.email})`);

    return NextResponse.json({
      success: true,
      message: "Affiliate deactivated successfully (marked as inactive)",
      deletedAffiliate: {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        referralCode: affiliate.referralCode,
      },
      deletedData: {
        clicks: affiliate.clicks.length,
        conversions: affiliate.conversions.length,
        auditLogs: affiliate.auditLogs.length,
      },
    });

  } catch (error) {
    console.error("❌ Error deleting affiliate:", error);
    return NextResponse.json(
      { 
        error: "Failed to delete affiliate",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
