-- =====================================================
-- BrightNest Performance Indexes - SAFE MINIMAL VERSION
-- Only indexes that we know will work
-- =====================================================

-- ✅ AFFILIATES TABLE
CREATE INDEX IF NOT EXISTS "affiliates_is_approved_is_active_idx" 
ON "affiliates"("is_approved", "is_active");

CREATE INDEX IF NOT EXISTS "affiliates_created_at_idx" 
ON "affiliates"("created_at");

-- ✅ AFFILIATE CLICKS TABLE  
CREATE INDEX IF NOT EXISTS "affiliate_clicks_affiliate_id_created_at_idx" 
ON "affiliate_clicks"("affiliate_id", "created_at");

CREATE INDEX IF NOT EXISTS "affiliate_clicks_created_at_idx" 
ON "affiliate_clicks"("created_at");

-- ✅ AFFILIATE CONVERSIONS TABLE
CREATE INDEX IF NOT EXISTS "affiliate_conversions_affiliate_id_idx" 
ON "affiliate_conversions"("affiliate_id");

CREATE INDEX IF NOT EXISTS "affiliate_conversions_commission_status_hold_until_idx" 
ON "affiliate_conversions"("commission_status", "hold_until");

CREATE INDEX IF NOT EXISTS "affiliate_conversions_created_at_idx" 
ON "affiliate_conversions"("created_at");

-- ✅ APPOINTMENTS TABLE
CREATE INDEX IF NOT EXISTS "appointments_closer_id_outcome_idx" 
ON "appointments"("closer_id", "outcome");

CREATE INDEX IF NOT EXISTS "appointments_affiliate_code_idx" 
ON "appointments"("affiliate_code");

CREATE INDEX IF NOT EXISTS "appointments_scheduled_at_idx" 
ON "appointments"("scheduled_at");

CREATE INDEX IF NOT EXISTS "appointments_outcome_idx" 
ON "appointments"("outcome");

CREATE INDEX IF NOT EXISTS "appointments_created_at_idx" 
ON "appointments"("created_at");

-- =====================================================
-- TOTAL: 13 indexes
-- This covers the most critical performance bottlenecks:
-- - Affiliate dashboards (clicks, conversions)
-- - Admin analytics (affiliate lists, commission processing)
-- - Closer dashboards (appointments, outcomes)
-- - Date range filters (created_at indexes)
-- =====================================================

-- Verify indexes were created
SELECT 
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('affiliates', 'affiliate_clicks', 'affiliate_conversions', 'appointments')
ORDER BY tablename, indexname;

