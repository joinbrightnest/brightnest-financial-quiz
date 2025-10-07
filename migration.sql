-- ================================================================
-- LOADING SCREENS MIGRATION
-- This script will:
-- 1. Drop the old loading_pages table
-- 2. Create the new loading_screens table with correct schema
-- ================================================================

-- Step 1: Drop old table if exists
DROP TABLE IF EXISTS "loading_pages" CASCADE;

-- Step 2: Drop loading_screens if it exists (for clean slate)
DROP TABLE IF EXISTS "loading_screens" CASCADE;

-- Step 3: Create new loading_screens table
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

-- Step 4: Add foreign key constraint to quiz_questions table
ALTER TABLE "loading_screens" 
ADD CONSTRAINT "loading_screens_triggerQuestionId_fkey" 
FOREIGN KEY ("triggerQuestionId") 
REFERENCES "quiz_questions"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Step 5: Create index for better query performance
CREATE INDEX "loading_screens_quizType_idx" ON "loading_screens"("quizType");
CREATE INDEX "loading_screens_triggerQuestionId_idx" ON "loading_screens"("triggerQuestionId");

-- ================================================================
-- MIGRATION COMPLETE!
-- ================================================================
-- You can now use the Loading Screens feature with:
-- - Full workbench interface
-- - Animated emojis and puzzle pieces
-- - Progress bars with customization
-- - Color customization
-- - Real-time preview
-- ================================================================

