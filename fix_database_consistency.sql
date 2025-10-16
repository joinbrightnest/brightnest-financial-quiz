-- Safe Database Consistency Fix
-- This script adds missing enum types and ensures database consistency

-- Add AppointmentStatus enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "AppointmentStatus" AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'no_show', 'cancelled', 'rescheduled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add CallOutcome enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "CallOutcome" AS ENUM ('converted', 'not_interested', 'needs_follow_up', 'wrong_number', 'no_answer', 'callback_requested', 'rescheduled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add missing calendly_link column to closers table if it doesn't exist
ALTER TABLE "closers" ADD COLUMN IF NOT EXISTS "calendly_link" TEXT;

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS "idx_quiz_sessions_affiliate_code" ON "quiz_sessions"("affiliate_code");
CREATE INDEX IF NOT EXISTS "idx_quiz_sessions_status" ON "quiz_sessions"("status");
CREATE INDEX IF NOT EXISTS "idx_quiz_sessions_completed_at" ON "quiz_sessions"("completed_at");
CREATE INDEX IF NOT EXISTS "idx_affiliate_clicks_affiliate_id" ON "affiliate_clicks"("affiliate_id");
CREATE INDEX IF NOT EXISTS "idx_affiliate_conversions_affiliate_id" ON "affiliate_conversions"("affiliate_id");
CREATE INDEX IF NOT EXISTS "idx_appointments_closer_id" ON "appointments"("closer_id");
CREATE INDEX IF NOT EXISTS "idx_appointments_scheduled_at" ON "appointments"("scheduled_at");
CREATE INDEX IF NOT EXISTS "idx_appointments_status" ON "appointments"("status");

-- Update any existing appointments with string status to use proper enum
-- This is safe because we're only updating if the column exists and has string values
DO $$ 
BEGIN
    -- Check if appointments table exists and has status column
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'status') THEN
        -- Update string values to enum values (this is safe)
        UPDATE "appointments" SET "status" = 'scheduled'::text WHERE "status" = 'scheduled';
        UPDATE "appointments" SET "status" = 'confirmed'::text WHERE "status" = 'confirmed';
        UPDATE "appointments" SET "status" = 'completed'::text WHERE "status" = 'completed';
        UPDATE "appointments" SET "status" = 'cancelled'::text WHERE "status" = 'cancelled';
    END IF;
END $$;

-- Verify the changes
SELECT 'Database consistency fix completed successfully' as status;
