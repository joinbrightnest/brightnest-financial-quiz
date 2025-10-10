import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    console.log('Starting progress bar colors migration...');

    // Add the new columns if they don't exist
    await prisma.$executeRaw`
      ALTER TABLE loading_screens 
      ADD COLUMN IF NOT EXISTS "progressBarFillColor" TEXT DEFAULT '#fb513d';
    `;

    await prisma.$executeRaw`
      ALTER TABLE loading_screens 
      ADD COLUMN IF NOT EXISTS "progressBarBgColor" TEXT DEFAULT '#e4dece';
    `;

    await prisma.$executeRaw`
      ALTER TABLE loading_screens 
      ADD COLUMN IF NOT EXISTS "progressBarTextColor" TEXT DEFAULT '#191717';
    `;

    console.log('Progress bar colors migration completed successfully!');
    
    return NextResponse.json({ 
      success: true, 
      message: "Progress bar colors migration completed successfully"
    });
  } catch (error) {
    console.error("Error migrating progress bar colors:", error);
    return NextResponse.json(
      { error: `Failed to migrate progress bar colors: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
