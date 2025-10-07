import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Run the migration SQL directly
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "loading_screens" (
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
          "updatedAt" TIMESTAMP(3) NOT NULL,

          CONSTRAINT "loading_screens_pkey" PRIMARY KEY ("id")
      );
    `);

    // Try to add foreign key constraint
    try {
      await prisma.$executeRawUnsafe(`
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'loading_screens_triggerQuestionId_fkey'
            ) THEN
                ALTER TABLE "loading_screens" ADD CONSTRAINT "loading_screens_triggerQuestionId_fkey" 
                FOREIGN KEY ("triggerQuestionId") REFERENCES "quiz_questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
            END IF;
        END $$;
      `);
    } catch (fkError) {
      console.log('Foreign key constraint already exists or failed:', fkError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Loading screens table created successfully' 
    });
  } catch (error: any) {
    console.error('Error running migration:', error);
    
    // If table already exists, that's fine
    if (error?.message?.includes('already exists')) {
      return NextResponse.json({ 
        success: true, 
        message: 'Table already exists' 
      });
    }
    
    return NextResponse.json({ 
      error: 'Failed to run migration',
      details: error?.message 
    }, { status: 500 });
  }
}

