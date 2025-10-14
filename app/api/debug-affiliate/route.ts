import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log("Debugging affiliate data...");
    
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
      take: 10
    });
    
    // Get George's conversions
    const conversions = await prisma.affiliateConversion.findMany({
      where: { affiliateId: george.id },
      orderBy: { createdAt: "desc" },
      take: 10
    });
    
    // Get quiz sessions with George's affiliate code
    const quizSessions = await prisma.quizSession.findMany({
      where: { affiliateCode: "georgecq33" },
      orderBy: { createdAt: "desc" },
      take: 10
    });
    
    return NextResponse.json({
      affiliate: {
        id: george.id,
        name: george.name,
        referralCode: george.referralCode,
        totalClicks: george.totalClicks,
        totalLeads: george.totalLeads,
        isActive: george.isActive,
        isApproved: george.isApproved,
        createdAt: george.createdAt
      },
      clicks: clicks.map(click => ({
        id: click.id,
        createdAt: click.createdAt,
        ipAddress: click.ipAddress,
        userAgent: click.userAgent
      })),
      conversions: conversions.map(conv => ({
        id: conv.id,
        conversionType: conv.conversionType,
        status: conv.status,
        createdAt: conv.createdAt,
        value: conv.value
      })),
      quizSessions: quizSessions.map(session => ({
        id: session.id,
        quizType: session.quizType,
        status: session.status,
        affiliateCode: session.affiliateCode,
        createdAt: session.createdAt,
        completedAt: session.completedAt
      })),
      summary: {
        totalClicksInDB: clicks.length,
        totalConversionsInDB: conversions.length,
        totalQuizSessions: quizSessions.length,
        completedQuizSessions: quizSessions.filter(s => s.status === "completed").length
      }
    });
    
  } catch (error) {
    console.error("Error debugging affiliate data:", error);
    return NextResponse.json(
      { error: "Failed to debug affiliate data", details: error.message },
      { status: 500 }
    );
  }
}
