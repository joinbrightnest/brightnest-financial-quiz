import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log("Fixing George's affiliate link...");
    
    // Find George by referral code
    const george = await prisma.affiliate.findUnique({
      where: { referralCode: "georgecq33" }
    });
    
    if (!george) {
      return NextResponse.json({ error: "George not found" }, { status: 404 });
    }
    
    console.log("George found:", george.name);
    console.log("Current link:", george.customLink);
    
    // Update George's link
    const updatedGeorge = await prisma.affiliate.update({
      where: { id: george.id },
      data: {
        customLink: "https://joinbrightnest.com/georgecq33"
      }
    });
    
    console.log("Updated link:", updatedGeorge.customLink);
    
    return NextResponse.json({
      success: true,
      message: "George's link updated successfully",
      oldLink: george.customLink,
      newLink: updatedGeorge.customLink
    });
    
  } catch (error) {
    console.error("Error updating George's link:", error);
    return NextResponse.json(
      { error: "Failed to update link", details: error.message },
      { status: 500 }
    );
  }
}
