-- Add AppointmentStatus enum
DO $$ BEGIN
    CREATE TYPE "AppointmentStatus" AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'no_show', 'cancelled', 'rescheduled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add CallOutcome enum
DO $$ BEGIN
    CREATE TYPE "CallOutcome" AS ENUM ('converted', 'not_interested', 'needs_follow_up', 'wrong_number', 'no_answer', 'callback_requested', 'rescheduled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
