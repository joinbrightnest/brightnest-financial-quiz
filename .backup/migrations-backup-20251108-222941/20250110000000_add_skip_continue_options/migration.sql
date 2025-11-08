-- AddSkipContinueOptions
ALTER TABLE "quiz_questions" ADD COLUMN "skipButton" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "quiz_questions" ADD COLUMN "continueButton" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "quiz_questions" ADD COLUMN "continueButtonColor" TEXT NOT NULL DEFAULT '#09727c';
