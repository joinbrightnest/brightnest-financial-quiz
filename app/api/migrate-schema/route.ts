import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    console.log('Starting schema migration...');

    // Add the new columns if they don't exist
    await prisma.$executeRaw`
      ALTER TABLE quiz_questions 
      ADD COLUMN IF NOT EXISTS "textUnderAnswers" TEXT;
    `;

    await prisma.$executeRaw`
      ALTER TABLE quiz_questions 
      ADD COLUMN IF NOT EXISTS "textUnderButton" TEXT;
    `;

    console.log('Schema migration completed successfully!');
    
    return NextResponse.json({ 
      success: true, 
      message: "Schema migration completed successfully"
    });
  } catch (error) {
    console.error("Error migrating schema:", error);
    return NextResponse.json(
      { error: `Failed to migrate schema: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
