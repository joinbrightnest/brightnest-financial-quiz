import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Update all affiliate links to use the correct base URL
    const affiliates = await prisma.affiliate.findMany();
    
    const updatePromises = affiliates.map(affiliate => 
      prisma.affiliate.update({
        where: { id: affiliate.id },
        data: {
          customLink: `https://joinbrightnest.com/${affiliate.referralCode}`,
        },
      })
    );
    
    await Promise.all(updatePromises);
    
    return NextResponse.json({
      success: true,
      message: `Updated ${affiliates.length} affiliate links`,
      updatedLinks: affiliates.map(aff => ({
        id: aff.id,
        name: aff.name,
        referralCode: aff.referralCode,
        newLink: `https://joinbrightnest.com/${aff.referralCode}`,
      })),
    });
  } catch (error) {
    console.error("Error updating affiliate links:", error);
    return NextResponse.json(
      { error: "Failed to update affiliate links" },
      { status: 500 }
    );
  }
}
