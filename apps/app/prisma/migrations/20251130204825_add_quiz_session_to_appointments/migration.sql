-- Add quiz_session_id column to appointments table
ALTER TABLE "appointments" ADD COLUMN "quiz_session_id" TEXT;

-- Create index on quiz_session_id for performance
CREATE INDEX "appointments_quiz_session_id_idx" ON "appointments"("quiz_session_id");

-- Create index on customer_email for performance (used in fallback matching)
CREATE INDEX "appointments_customer_email_idx" ON "appointments"("customer_email");

-- Add foreign key constraint to link appointments to quiz_sessions
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_quiz_session_id_fkey" 
  FOREIGN KEY ("quiz_session_id") REFERENCES "quiz_sessions"("id") 
  ON DELETE SET NULL ON UPDATE NO ACTION;
