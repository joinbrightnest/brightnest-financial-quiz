import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Test if affiliate tables exist and can be accessed
    console.log("Testing affiliate system...");
    
    // Try to count affiliates
    const affiliateCount = await prisma.affiliate.count();
    console.log("Total affiliates:", affiliateCount);
    
    // Try to find George's affiliate
    const george = await prisma.affiliate.findUnique({
      where: { referralCode: "georgecq33" }
    });
    console.log("George found:", george ? "Yes" : "No");
    
    if (george) {
      console.log("George's data:", {
        id: george.id,
        name: george.name,
        referralCode: george.referralCode,
        isApproved: george.isApproved,
        isActive: george.isActive,
        totalClicks: george.totalClicks
      });
      
      // Try to count clicks for George
      const clickCount = await prisma.affiliateClick.count({
        where: { affiliateId: george.id }
      });
      console.log("George's click count:", clickCount);
    }
    
    // Try to create a test click
    if (george) {
      try {
        const testClick = await prisma.affiliateClick.create({
          data: {
            affiliateId: george.id,
            referralCode: george.referralCode,
            ipAddress: "test-ip",
            userAgent: "test-user-agent",
            utmSource: "test",
            utmMedium: "test",
            utmCampaign: "test",
          },
        });
        console.log("Test click created:", testClick.id);
        
        // Update George's total clicks
        await prisma.affiliate.update({
          where: { id: george.id },
          data: {
            totalClicks: {
              increment: 1,
            },
          },
        });
        console.log("George's total clicks updated");
        
      } catch (clickError) {
        console.error("Error creating test click:", clickError);
      }
    }
    
    return NextResponse.json({
      success: true,
      affiliateCount,
      georgeFound: !!george,
      georgeData: george ? {
        id: george.id,
        name: george.name,
        referralCode: george.referralCode,
        isApproved: george.isApproved,
        isActive: george.isActive,
        totalClicks: george.totalClicks
      } : null
    });
    
  } catch (error) {
    console.error("Test affiliate error:", error);
    return NextResponse.json(
      { error: "Test failed", details: error.message },
      { status: 500 }
    );
  }
}
