import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const steps: string[] = [];

    // Step 1: Drop old loading_pages table if it exists
    try {
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "loading_pages" CASCADE;`);
      steps.push('✅ Dropped old loading_pages table');
    } catch (error) {
      steps.push('⚠️ Old table might not exist (this is ok)');
    }

    // Step 2: Drop loading_screens table if it exists (for clean slate)
    try {
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "loading_screens" CASCADE;`);
      steps.push('✅ Dropped existing loading_screens table');
    } catch (error) {
      steps.push('⚠️ loading_screens table did not exist');
    }

    // Step 3: Create new loading_screens table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "loading_screens" (
          "id" TEXT NOT NULL,
          "quizType" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "subtitle" TEXT,
          "personalizedText" TEXT,
          "duration" INTEGER NOT NULL DEFAULT 3000,
          "iconType" TEXT NOT NULL DEFAULT 'puzzle-4',
          "animationStyle" TEXT NOT NULL DEFAULT 'complete-rotate',
          "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
          "textColor" TEXT NOT NULL DEFAULT '#000000',
          "iconColor" TEXT NOT NULL DEFAULT '#3b82f6',
          "progressBarColor" TEXT NOT NULL DEFAULT '#ef4444',
          "showProgressBar" BOOLEAN NOT NULL DEFAULT true,
          "progressText" TEXT,
          "triggerQuestionId" TEXT,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "loading_screens_pkey" PRIMARY KEY ("id")
      );
    `);
    steps.push('✅ Created loading_screens table');

    // Step 4: Add foreign key constraint
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "loading_screens" 
        ADD CONSTRAINT "loading_screens_triggerQuestionId_fkey" 
        FOREIGN KEY ("triggerQuestionId") 
        REFERENCES "quiz_questions"("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
      `);
      steps.push('✅ Added foreign key constraint');
    } catch (fkError: any) {
      steps.push(`⚠️ Foreign key constraint: ${fkError?.message || 'Failed'}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Migration completed successfully!',
      steps: steps
    });
  } catch (error: any) {
    console.error('Error running migration:', error);
    
    return NextResponse.json({ 
      error: 'Failed to run migration',
      details: error?.message,
      stack: error?.stack
    }, { status: 500 });
  }
}

