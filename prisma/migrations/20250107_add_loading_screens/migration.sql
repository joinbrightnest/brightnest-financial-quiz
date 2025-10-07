-- CreateTable
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

-- AddForeignKey
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_questions') THEN
        ALTER TABLE "loading_screens" ADD CONSTRAINT "loading_screens_triggerQuestionId_fkey" 
        FOREIGN KEY ("triggerQuestionId") REFERENCES "quiz_questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

