import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Checking database schema...");
    
    // Try to get the raw table structure
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'appointments' 
      ORDER BY ordinal_position;
    `;

    console.log("📊 Appointments table columns:", result);

    return NextResponse.json({
      success: true,
      columns: result
    });

  } catch (error) {
    console.error("❌ Error checking schema:", error);
    return NextResponse.json(
      { 
        error: "Failed to check schema", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
