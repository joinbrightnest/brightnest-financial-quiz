-- Fix Prisma Enum Issues
-- Run this directly in your Supabase SQL Editor

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

-- Add missing calendly_link column to closers table
ALTER TABLE "closers" ADD COLUMN IF NOT EXISTS "calendly_link" TEXT;

-- Verify the enums were created
SELECT typname FROM pg_type WHERE typname IN ('AppointmentStatus', 'CallOutcome');
