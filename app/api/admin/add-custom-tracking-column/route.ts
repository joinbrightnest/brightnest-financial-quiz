import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Add the custom_tracking_link column to the affiliates table
    await prisma.$executeRaw`
      ALTER TABLE "affiliates" 
      ADD COLUMN IF NOT EXISTS "custom_tracking_link" TEXT;
    `;
    
    console.log('✅ Custom tracking link column added successfully');
    
    return NextResponse.json({
      success: true,
      message: "Custom tracking link column added successfully"
    });
  } catch (error) {
    console.error('❌ Error adding custom tracking link column:', error);
    return NextResponse.json(
      { 
        error: "Failed to add custom tracking link column", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
