-- =====================================================
-- BrightNest Database Migration - SAFE VERSION
-- Date: October 24, 2025
-- Purpose: Add normal website click tracking only
-- =====================================================

-- 1. CREATE NEW TABLE: normal_website_clicks
-- This is the main table needed for the new click tracking feature
CREATE TABLE IF NOT EXISTS "normal_website_clicks" (
    "id" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "normal_website_clicks_pkey" PRIMARY KEY ("id")
);

-- 2. ADD INDEX for normal_website_clicks
CREATE INDEX IF NOT EXISTS "normal_website_clicks_created_at_idx" 
ON "normal_website_clicks"("created_at");

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check if table was created successfully:
SELECT 'normal_website_clicks table created' AS status
WHERE EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'normal_website_clicks'
);

-- =====================================================
-- NOTES
-- =====================================================
-- 1. This creates ONLY the essential new table
-- 2. Other indexes can be added later if needed
-- 3. Safe to run multiple times
-- 4. No existing data affected
-- =====================================================

