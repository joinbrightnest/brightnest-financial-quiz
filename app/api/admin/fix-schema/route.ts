import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    console.log('Starting schema fix...');

    // Add the new columns if they don't exist
    await prisma.$executeRaw`
      ALTER TABLE quiz_questions 
      ADD COLUMN IF NOT EXISTS "textUnderAnswers" TEXT;
    `;

    await prisma.$executeRaw`
      ALTER TABLE quiz_questions 
      ADD COLUMN IF NOT EXISTS "textUnderButton" TEXT;
    `;

    console.log('Schema fix completed successfully!');
    
    return NextResponse.json({ 
      success: true, 
      message: "Schema fix completed successfully"
    });
  } catch (error) {
    console.error("Error fixing schema:", error);
    return NextResponse.json(
      { error: `Failed to fix schema: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
