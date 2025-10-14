import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log("Testing affiliate data...");
    
    // Find George's affiliate record
    const george = await prisma.affiliate.findUnique({
      where: { referralCode: "georgecq33" }
    });
    
    if (!george) {
      return NextResponse.json({ error: "George not found" }, { status: 404 });
    }
    
    // Get George's clicks
    const clicks = await prisma.affiliateClick.findMany({
      where: { affiliateId: george.id },
      orderBy: { createdAt: "desc" },
      take: 5
    });
    
    // Get George's conversions
    const conversions = await prisma.affiliateConversion.findMany({
      where: { affiliateId: george.id },
      orderBy: { createdAt: "desc" },
      take: 5
    });
    
    return NextResponse.json({
      affiliate: {
        id: george.id,
        name: george.name,
        referralCode: george.referralCode,
        totalClicks: george.totalClicks,
        totalLeads: george.totalLeads,
        isActive: george.isActive,
        isApproved: george.isApproved
      },
      clicks: clicks.map(click => ({
        id: click.id,
        createdAt: click.createdAt,
        ipAddress: click.ipAddress
      })),
      conversions: conversions.map(conv => ({
        id: conv.id,
        conversionType: conv.conversionType,
        status: conv.status,
        createdAt: conv.createdAt
      })),
      totalClicks: clicks.length,
      totalConversions: conversions.length
    });
    
  } catch (error) {
    console.error("Error testing affiliate data:", error);
    return NextResponse.json(
      { error: "Failed to test affiliate data", details: error.message },
      { status: 500 }
    );
  }
}
