-- Add calendly_link column to closers table
ALTER TABLE "closers" ADD COLUMN IF NOT EXISTS "calendly_link" TEXT;
