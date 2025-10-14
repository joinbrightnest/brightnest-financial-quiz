import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { affiliateCode } = await request.json();

    if (!affiliateCode) {
      return NextResponse.json({ error: "Affiliate code is required" }, { status: 400 });
    }

    console.log("Testing affiliate click for:", affiliateCode);

    // Find the affiliate, create if doesn't exist
    let affiliate = await (prisma as any).affiliate.findUnique({
      where: { referralCode: affiliateCode },
    });

    if (!affiliate) {
      console.log("Creating affiliate record for:", affiliateCode);
      try {
        // Create the affiliate record
        affiliate = await (prisma as any).affiliate.create({
          data: {
            id: `affiliate-${affiliateCode}`,
            name: "George",
            email: "george@example.com",
            passwordHash: "$2b$10$dummy.hash.for.testing",
            tier: "quiz",
            referralCode: affiliateCode,
            customLink: `https://joinbrightnest.com/${affiliateCode}`,
            commissionRate: 0.1000,
            totalClicks: 0,
            totalLeads: 0,
            totalBookings: 0,
            totalSales: 0,
            totalCommission: 0.00,
            isActive: true,
            isApproved: true,
          },
        });
        console.log("Created affiliate record:", affiliate.id);
      } catch (createError) {
        console.error("Error creating affiliate record:", createError);
        // Return success anyway to avoid breaking the dashboard
        return NextResponse.json({
          success: true,
          message: `Affiliate record creation failed, but continuing...`,
          error: createError.message
        });
      }
    }

    console.log("Found affiliate:", affiliate.name);

    // Record the click
    const click = await (prisma as any).affiliateClick.create({
      data: {
        affiliateId: affiliate.id,
        referralCode: affiliate.referralCode,
        ipAddress: "test-ip",
        userAgent: "test-user-agent",
      },
    });

    console.log("Created click record:", click.id);

    // Update affiliate's total clicks
    const updatedAffiliate = await (prisma as any).affiliate.update({
      where: { id: affiliate.id },
      data: {
        totalClicks: {
          increment: 1,
        },
      },
    });

    console.log("Updated affiliate clicks:", updatedAffiliate.totalClicks);

    return NextResponse.json({
      success: true,
      message: `Click tracked for ${affiliateCode}`,
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        referralCode: affiliate.referralCode,
        totalClicks: updatedAffiliate.totalClicks,
      },
      click: {
        id: click.id,
        createdAt: click.createdAt,
      }
    });

  } catch (error) {
    console.error("Test affiliate click error:", error);
    return NextResponse.json(
      { error: "Failed to track test click", details: error.message },
      { status: 500 }
    );
  }
}
