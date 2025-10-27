-- ========================================
-- DATABASE CLEANUP SCRIPT
-- ========================================
-- IMPORTANT: Review results from audit first!
-- Only run these after confirming issues exist
-- ========================================

-- ========================================
-- 1. FIX COMMISSION MISMATCHES
-- ========================================
-- Recalculate all affiliate totalCommission values
UPDATE affiliates
SET total_commission = (
  SELECT COALESCE(SUM(commission_amount), 0)
  FROM affiliate_conversions
  WHERE affiliate_id = affiliates.id
    AND commission_amount > 0
)
WHERE EXISTS (
  SELECT 1 FROM affiliate_conversions
  WHERE affiliate_id = affiliates.id
);

-- ========================================
-- 2. CLEAN UP ORPHANED RECORDS
-- ========================================

-- 2a. Delete orphaned affiliate clicks (no affiliate)
-- UNCOMMENT AFTER VERIFICATION:
-- DELETE FROM affiliate_clicks
-- WHERE NOT EXISTS (
--   SELECT 1 FROM affiliates WHERE id = affiliate_clicks.affiliate_id
-- );

-- 2b. Delete orphaned affiliate conversions (no affiliate)
-- UNCOMMENT AFTER VERIFICATION:
-- DELETE FROM affiliate_conversions
-- WHERE NOT EXISTS (
--   SELECT 1 FROM affiliates WHERE id = affiliate_conversions.affiliate_id
-- );

-- 2c. Delete orphaned tasks (no appointment)
-- UNCOMMENT AFTER VERIFICATION:
-- DELETE FROM tasks
-- WHERE appointment_id IS NOT NULL
-- AND NOT EXISTS (
--   SELECT 1 FROM "Appointment" WHERE id = tasks.appointment_id
-- );

-- ========================================
-- 3. CLEAN UP OLD ABANDONED DATA
-- ========================================

-- 3a. Delete old abandoned quiz sessions (>30 days, in_progress)
-- UNCOMMENT AFTER VERIFICATION:
-- DELETE FROM "QuizSession"
-- WHERE status = 'in_progress'
-- AND created_at < NOW() - INTERVAL '30 days';

-- 3b. Update old appointments with no outcome
-- UNCOMMENT AFTER VERIFICATION:
-- UPDATE "Appointment"
-- SET outcome = 'no_show'
-- WHERE outcome IS NULL
-- AND start_time < NOW() - INTERVAL '30 days';

-- ========================================
-- 4. ADD MISSING INDEXES (if needed)
-- ========================================

-- Check if indexes exist first, then uncomment to create:

-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_sessions_email 
-- ON "QuizSession"(email) WHERE email IS NOT NULL;

-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_customer_email 
-- ON "Appointment"(customer_email);

-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_lead_email 
-- ON tasks(lead_email);

-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_lead_email 
-- ON notes(lead_email);

-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversions_affiliate_status 
-- ON affiliate_conversions(affiliate_id, commission_status);

-- ========================================
-- 5. ADD UNIQUE CONSTRAINTS (if needed)
-- ========================================

-- UNCOMMENT AFTER VERIFICATION:
-- ALTER TABLE affiliates 
-- ADD CONSTRAINT unique_referral_code UNIQUE (referral_code);

-- ALTER TABLE affiliates 
-- ADD CONSTRAINT unique_affiliate_email UNIQUE (email);

-- ========================================
-- 6. VERIFY CLEANUP
-- ========================================

-- Run these after cleanup to verify:

SELECT 
  'Orphaned Clicks' as check_name,
  COUNT(*) as count
FROM affiliate_clicks
WHERE NOT EXISTS (
  SELECT 1 FROM affiliates WHERE id = affiliate_clicks.affiliate_id
)
UNION ALL
SELECT 
  'Orphaned Conversions',
  COUNT(*)
FROM affiliate_conversions
WHERE NOT EXISTS (
  SELECT 1 FROM affiliates WHERE id = affiliate_conversions.affiliate_id
)
UNION ALL
SELECT 
  'Commission Mismatches',
  COUNT(*)
FROM affiliates a
WHERE ABS(a.total_commission - COALESCE((
  SELECT SUM(commission_amount)
  FROM affiliate_conversions
  WHERE affiliate_id = a.id
), 0)) > 0.01
UNION ALL
SELECT 
  'Old Abandoned Sessions',
  COUNT(*)
FROM "QuizSession"
WHERE status = 'in_progress'
AND created_at < NOW() - INTERVAL '30 days';

-- ========================================
-- 7. VACUUM AND ANALYZE
-- ========================================
-- Run these after major cleanup to optimize:

-- VACUUM ANALYZE affiliates;
-- VACUUM ANALYZE affiliate_conversions;
-- VACUUM ANALYZE affiliate_clicks;
-- VACUUM ANALYZE "QuizSession";
-- VACUUM ANALYZE "Appointment";
-- VACUUM ANALYZE tasks;
-- VACUUM ANALYZE notes;

