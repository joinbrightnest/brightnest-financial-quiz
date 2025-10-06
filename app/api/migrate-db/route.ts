import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    console.log('Starting database migration...');

    // Add the quizType column to the quiz_questions table
    await prisma.$executeRaw`
      ALTER TABLE quiz_questions 
      ADD COLUMN IF NOT EXISTS "quizType" TEXT DEFAULT 'financial-profile';
    `;

    // Add the quizType column to the quiz_sessions table
    await prisma.$executeRaw`
      ALTER TABLE quiz_sessions 
      ADD COLUMN IF NOT EXISTS "quizType" TEXT DEFAULT 'financial-profile';
    `;

    // Update existing questions to have the default quizType
    await prisma.$executeRaw`
      UPDATE quiz_questions 
      SET "quizType" = 'financial-profile' 
      WHERE "quizType" IS NULL;
    `;

    // Update existing sessions to have the default quizType
    await prisma.$executeRaw`
      UPDATE quiz_sessions 
      SET "quizType" = 'financial-profile' 
      WHERE "quizType" IS NULL;
    `;

    console.log('Database migration completed successfully!');
    
    return NextResponse.json({ 
      success: true, 
      message: "Database migration completed successfully" 
    });
  } catch (error) {
    console.error("Error migrating database:", error);
    return NextResponse.json(
      { error: `Failed to migrate database: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
