-- Safe affiliate system migration - handles existing tables
-- This will only create what doesn't already exist

-- Create enums only if they don't exist
DO $$ BEGIN
    CREATE TYPE "AffiliateTier" AS ENUM ('quiz', 'creator', 'agency');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PayoutMethod" AS ENUM ('stripe', 'paypal', 'wise');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ConversionStatus" AS ENUM ('pending', 'confirmed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PayoutStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create affiliates table only if it doesn't exist
CREATE TABLE IF NOT EXISTS "affiliates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "tier" "AffiliateTier" NOT NULL DEFAULT 'quiz',
    "referral_code" TEXT NOT NULL,
    "custom_link" TEXT NOT NULL,
    "payout_method" "PayoutMethod",
    "payout_details" JSONB,
    "commission_rate" DECIMAL(5,4) NOT NULL DEFAULT 0.1000,
    "total_clicks" INTEGER NOT NULL DEFAULT 0,
    "total_leads" INTEGER NOT NULL DEFAULT 0,
    "total_bookings" INTEGER NOT NULL DEFAULT 0,
    "total_sales" INTEGER NOT NULL DEFAULT 0,
    "total_commission" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "stripe_account_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliates_pkey" PRIMARY KEY ("id")
);

-- Create affiliate_clicks table only if it doesn't exist
CREATE TABLE IF NOT EXISTS "affiliate_clicks" (
    "id" TEXT NOT NULL,
    "affiliate_id" TEXT NOT NULL,
    "referral_code" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "landing_page" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_clicks_pkey" PRIMARY KEY ("id")
);

-- Create affiliate_conversions table only if it doesn't exist
CREATE TABLE IF NOT EXISTS "affiliate_conversions" (
    "id" TEXT NOT NULL,
    "affiliate_id" TEXT NOT NULL,
    "quiz_session_id" TEXT,
    "referral_code" TEXT NOT NULL,
    "conversion_type" TEXT NOT NULL,
    "status" "ConversionStatus" NOT NULL DEFAULT 'pending',
    "commission_amount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "sale_value" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliate_conversions_pkey" PRIMARY KEY ("id")
);

-- Create affiliate_payouts table only if it doesn't exist
CREATE TABLE IF NOT EXISTS "affiliate_payouts" (
    "id" TEXT NOT NULL,
    "affiliate_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'pending',
    "payout_method" "PayoutMethod" NOT NULL,
    "payout_details" JSONB,
    "stripe_payout_id" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliate_payouts_pkey" PRIMARY KEY ("id")
);

-- Create affiliate_audit_logs table only if it doesn't exist
CREATE TABLE IF NOT EXISTS "affiliate_audit_logs" (
    "id" TEXT NOT NULL,
    "affiliate_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_audit_logs_pkey" PRIMARY KEY ("id")
);

-- Create indexes only if they don't exist
CREATE UNIQUE INDEX IF NOT EXISTS "affiliates_email_key" ON "affiliates"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "affiliates_referral_code_key" ON "affiliates"("referral_code");
CREATE INDEX IF NOT EXISTS "affiliate_clicks_affiliate_id_idx" ON "affiliate_clicks"("affiliate_id");
CREATE INDEX IF NOT EXISTS "affiliate_clicks_referral_code_idx" ON "affiliate_clicks"("referral_code");
CREATE INDEX IF NOT EXISTS "affiliate_conversions_affiliate_id_idx" ON "affiliate_conversions"("affiliate_id");
CREATE INDEX IF NOT EXISTS "affiliate_conversions_quiz_session_id_idx" ON "affiliate_conversions"("quiz_session_id");
CREATE INDEX IF NOT EXISTS "affiliate_payouts_affiliate_id_idx" ON "affiliate_payouts"("affiliate_id");
CREATE INDEX IF NOT EXISTS "affiliate_audit_logs_affiliate_id_idx" ON "affiliate_audit_logs"("affiliate_id");

-- Add foreign key constraints only if they don't exist
DO $$ BEGIN
    ALTER TABLE "affiliate_clicks" ADD CONSTRAINT "affiliate_clicks_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "affiliate_conversions" ADD CONSTRAINT "affiliate_conversions_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "affiliate_conversions" ADD CONSTRAINT "affiliate_conversions_quiz_session_id_fkey" FOREIGN KEY ("quiz_session_id") REFERENCES "quiz_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "affiliate_payouts" ADD CONSTRAINT "affiliate_payouts_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "affiliate_audit_logs" ADD CONSTRAINT "affiliate_audit_logs_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add affiliate_code column to quiz_sessions if it doesn't exist
ALTER TABLE "quiz_sessions" ADD COLUMN IF NOT EXISTS "affiliate_code" TEXT;
