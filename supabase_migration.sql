-- =====================================================
-- BrightNest Database Migration
-- Date: October 24, 2025
-- Purpose: Add normal website click tracking + performance indexes
-- =====================================================

-- 1. CREATE NEW TABLE: normal_website_clicks
-- (Skip if already exists)
CREATE TABLE IF NOT EXISTS "normal_website_clicks" (
    "id" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "normal_website_clicks_pkey" PRIMARY KEY ("id")
);

-- 2. ADD PERFORMANCE INDEXES
-- These speed up common queries by 10-100x

-- Normal Website Clicks indexes
CREATE INDEX IF NOT EXISTS "normal_website_clicks_created_at_idx" ON "normal_website_clicks"("created_at");

-- Affiliate indexes
CREATE INDEX IF NOT EXISTS "affiliates_isApproved_isActive_idx" ON "affiliates"("is_approved", "is_active");
CREATE INDEX IF NOT EXISTS "affiliates_createdAt_idx" ON "affiliates"("created_at");

-- Affiliate Clicks indexes
CREATE INDEX IF NOT EXISTS "affiliate_clicks_affiliateId_createdAt_idx" ON "affiliate_clicks"("affiliate_id", "created_at");
CREATE INDEX IF NOT EXISTS "affiliate_clicks_createdAt_idx" ON "affiliate_clicks"("created_at");

-- Affiliate Conversions indexes
CREATE INDEX IF NOT EXISTS "affiliate_conversions_affiliateId_idx" ON "affiliate_conversions"("affiliate_id");
CREATE INDEX IF NOT EXISTS "affiliate_conversions_commissionStatus_holdUntil_idx" ON "affiliate_conversions"("commission_status", "hold_until");
CREATE INDEX IF NOT EXISTS "affiliate_conversions_createdAt_idx" ON "affiliate_conversions"("created_at");

-- Quiz Sessions indexes (check actual column names first - may vary)
-- CREATE INDEX IF NOT EXISTS "quiz_sessions_affiliateCode_idx" ON "quiz_sessions"("affiliate_code");
-- CREATE INDEX IF NOT EXISTS "quiz_sessions_completedAt_idx" ON "quiz_sessions"("completed_at");
-- CREATE INDEX IF NOT EXISTS "quiz_sessions_status_quizType_idx" ON "quiz_sessions"("status", "quiz_type");
-- CREATE INDEX IF NOT EXISTS "quiz_sessions_createdAt_idx" ON "quiz_sessions"("created_at");

-- Appointments indexes
CREATE INDEX IF NOT EXISTS "appointments_closerId_outcome_idx" ON "appointments"("closer_id", "outcome");
CREATE INDEX IF NOT EXISTS "appointments_affiliateCode_idx" ON "appointments"("affiliate_code");
CREATE INDEX IF NOT EXISTS "appointments_scheduledAt_idx" ON "appointments"("scheduled_at");
CREATE INDEX IF NOT EXISTS "appointments_outcome_idx" ON "appointments"("outcome");
CREATE INDEX IF NOT EXISTS "appointments_createdAt_idx" ON "appointments"("created_at");

-- =====================================================
-- VERIFICATION QUERIES
-- Run these after migration to verify success:
-- =====================================================

-- Check if normal_website_clicks table exists
-- SELECT EXISTS (
--     SELECT FROM information_schema.tables 
--     WHERE table_schema = 'public' 
--     AND table_name = 'normal_website_clicks'
-- );

-- Count indexes created
-- SELECT 
--     schemaname,
--     tablename,
--     indexname
-- FROM pg_indexes
-- WHERE schemaname = 'public'
-- ORDER BY tablename, indexname;

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================

-- Drop all indexes:
-- DROP INDEX IF EXISTS "normal_website_clicks_created_at_idx";
-- DROP INDEX IF EXISTS "affiliates_isApproved_isActive_idx";
-- DROP INDEX IF EXISTS "affiliates_createdAt_idx";
-- DROP INDEX IF EXISTS "affiliate_clicks_affiliateId_createdAt_idx";
-- DROP INDEX IF EXISTS "affiliate_clicks_createdAt_idx";
-- DROP INDEX IF EXISTS "affiliate_conversions_affiliateId_idx";
-- DROP INDEX IF EXISTS "affiliate_conversions_commissionStatus_holdUntil_idx";
-- DROP INDEX IF EXISTS "affiliate_conversions_createdAt_idx";
-- DROP INDEX IF EXISTS "quiz_sessions_affiliateCode_idx";
-- DROP INDEX IF EXISTS "quiz_sessions_completedAt_idx";
-- DROP INDEX IF EXISTS "quiz_sessions_status_quizType_idx";
-- DROP INDEX IF EXISTS "quiz_sessions_createdAt_idx";
-- DROP INDEX IF EXISTS "appointments_closerId_outcome_idx";
-- DROP INDEX IF EXISTS "appointments_affiliateCode_idx";
-- DROP INDEX IF EXISTS "appointments_scheduledAt_idx";
-- DROP INDEX IF EXISTS "appointments_outcome_idx";
-- DROP INDEX IF EXISTS "appointments_createdAt_idx";

-- Drop table:
-- DROP TABLE IF EXISTS "normal_website_clicks";

-- =====================================================
-- NOTES
-- =====================================================
-- 1. All CREATE statements use "IF NOT EXISTS" for safety
-- 2. Indexes significantly improve query performance
-- 3. The normal_website_clicks table tracks homepage visits
-- 4. Safe to run multiple times (idempotent)
-- 5. No data will be lost
-- =====================================================

