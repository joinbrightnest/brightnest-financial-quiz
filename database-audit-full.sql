-- ========================================
-- COMPREHENSIVE DATABASE AUDIT
-- Run this in Supabase SQL Editor
-- ========================================

-- ========================================
-- 1. CHECK FOR DUPLICATE TABLES/SCHEMAS
-- ========================================
SELECT 
  schemaname,
  tablename,
  COUNT(*) as table_count
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
GROUP BY schemaname, tablename
HAVING COUNT(*) > 1;

-- ========================================
-- 2. LIST ALL TABLES AND ROW COUNTS
-- ========================================
SELECT 
  schemaname,
  tablename,
  (xpath('/row/cnt/text()', xml_count))[1]::text::int as row_count
FROM (
  SELECT 
    schemaname,
    tablename,
    query_to_xml(format('SELECT COUNT(*) as cnt FROM %I.%I', schemaname, tablename), false, true, '') as xml_count
  FROM pg_tables
  WHERE schemaname = 'public'
) t
ORDER BY row_count DESC;

-- ========================================
-- 3. CHECK FOR ORPHANED RECORDS
-- ========================================

-- 3a. Quiz sessions without results
SELECT 
  COUNT(*) as orphaned_sessions,
  'Quiz sessions without results' as issue
FROM "QuizSession" qs
WHERE NOT EXISTS (
  SELECT 1 FROM "Result" r WHERE r.session_id = qs.id
)
AND qs.status = 'completed';

-- 3b. Results without sessions
SELECT 
  COUNT(*) as orphaned_results,
  'Results without sessions' as issue
FROM "Result" r
WHERE NOT EXISTS (
  SELECT 1 FROM "QuizSession" qs WHERE qs.id = r.session_id
);

-- 3c. Affiliate conversions without affiliates
SELECT 
  COUNT(*) as orphaned_conversions,
  'Conversions without affiliates' as issue
FROM affiliate_conversions ac
WHERE NOT EXISTS (
  SELECT 1 FROM affiliates a WHERE a.id = ac.affiliate_id
);

-- 3d. Affiliate clicks without affiliates
SELECT 
  COUNT(*) as orphaned_clicks,
  'Clicks without affiliates' as issue
FROM affiliate_clicks ac
WHERE NOT EXISTS (
  SELECT 1 FROM affiliates a WHERE a.id = ac.affiliate_id
);

-- 3e. Appointments without sessions
SELECT 
  COUNT(*) as orphaned_appointments,
  'Appointments without sessions' as issue
FROM "Appointment" a
WHERE a.session_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM "QuizSession" qs WHERE qs.id = a.session_id
);

-- 3f. Tasks without appointments
SELECT 
  COUNT(*) as orphaned_tasks,
  'Tasks without appointments' as issue
FROM tasks t
WHERE t.appointment_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM "Appointment" a WHERE a.id = t.appointment_id
);

-- 3g. Notes without leads (invalid email)
SELECT 
  COUNT(*) as potentially_orphaned_notes,
  'Notes with no matching lead email' as issue
FROM notes n
WHERE NOT EXISTS (
  SELECT 1 FROM "QuizSession" qs WHERE qs.email = n.lead_email
)
AND NOT EXISTS (
  SELECT 1 FROM "Appointment" a WHERE a.customer_email = n.lead_email
);

-- ========================================
-- 4. CHECK FOR DUPLICATE RECORDS
-- ========================================

-- 4a. Duplicate affiliate referral codes
SELECT 
  referral_code,
  COUNT(*) as duplicate_count
FROM affiliates
GROUP BY referral_code
HAVING COUNT(*) > 1;

-- 4b. Duplicate affiliate emails
SELECT 
  email,
  COUNT(*) as duplicate_count
FROM affiliates
GROUP BY email
HAVING COUNT(*) > 1;

-- 4c. Duplicate quiz sessions (same email, same type, close time)
SELECT 
  email,
  quiz_type,
  COUNT(*) as duplicate_count,
  MIN(created_at) as first_created,
  MAX(created_at) as last_created
FROM "QuizSession"
GROUP BY email, quiz_type, DATE_TRUNC('hour', created_at)
HAVING COUNT(*) > 5;

-- 4d. Duplicate appointments (same email)
SELECT 
  customer_email,
  COUNT(*) as duplicate_count,
  string_agg(id::text, ', ') as appointment_ids
FROM "Appointment"
GROUP BY customer_email
HAVING COUNT(*) > 1;

-- ========================================
-- 5. DATA INTEGRITY CHECKS
-- ========================================

-- 5a. Affiliate commission mismatches
SELECT 
  a.name,
  a.referral_code,
  a.total_commission as stored_commission,
  COALESCE(SUM(ac.commission_amount), 0) as calculated_commission,
  a.total_commission - COALESCE(SUM(ac.commission_amount), 0) as difference
FROM affiliates a
LEFT JOIN affiliate_conversions ac ON a.id = ac.affiliate_id
GROUP BY a.id, a.name, a.referral_code, a.total_commission
HAVING ABS(a.total_commission - COALESCE(SUM(ac.commission_amount), 0)) > 0.01;

-- 5b. Affiliate leads count mismatches
SELECT 
  a.name,
  a.referral_code,
  a.total_leads as stored_leads,
  COUNT(DISTINCT ac.quiz_session_id) as calculated_leads,
  a.total_leads - COUNT(DISTINCT ac.quiz_session_id) as difference
FROM affiliates a
LEFT JOIN affiliate_conversions ac ON a.id = ac.affiliate_id 
  AND ac.conversion_type = 'quiz_completion'
GROUP BY a.id, a.name, a.referral_code, a.total_leads
HAVING a.total_leads != COUNT(DISTINCT ac.quiz_session_id);

-- 5c. Check for negative or invalid amounts
SELECT 
  'Negative commission amounts' as issue,
  COUNT(*) as count
FROM affiliate_conversions
WHERE commission_amount < 0
UNION ALL
SELECT 
  'Negative sale values' as issue,
  COUNT(*) as count
FROM affiliate_conversions
WHERE sale_value < 0
UNION ALL
SELECT 
  'Commission > Sale Value' as issue,
  COUNT(*) as count
FROM affiliate_conversions
WHERE commission_amount > sale_value AND sale_value > 0;

-- 5d. Check for invalid commission statuses
SELECT 
  commission_status,
  COUNT(*) as count,
  SUM(commission_amount) as total_amount
FROM affiliate_conversions
GROUP BY commission_status;

-- 5e. Held commissions past their release date
SELECT 
  COUNT(*) as overdue_held_commissions,
  SUM(commission_amount) as total_overdue_amount
FROM affiliate_conversions
WHERE commission_status = 'held'
AND hold_until < NOW()
AND commission_amount > 0;

-- ========================================
-- 6. CHECK FOR UNUSED/INACTIVE DATA
-- ========================================

-- 6a. Inactive affiliates with no activity
SELECT 
  COUNT(*) as inactive_affiliates_no_activity
FROM affiliates a
WHERE a.is_active = false
AND NOT EXISTS (
  SELECT 1 FROM affiliate_conversions ac WHERE ac.affiliate_id = a.id
)
AND NOT EXISTS (
  SELECT 1 FROM affiliate_clicks ac WHERE ac.affiliate_id = a.id
);

-- 6b. Old pending quiz sessions (>7 days)
SELECT 
  COUNT(*) as old_pending_sessions
FROM "QuizSession"
WHERE status = 'in_progress'
AND created_at < NOW() - INTERVAL '7 days';

-- 6c. Abandoned appointments (no outcome after 30 days)
SELECT 
  COUNT(*) as abandoned_appointments
FROM "Appointment"
WHERE outcome IS NULL
AND start_time < NOW() - INTERVAL '30 days';

-- ========================================
-- 7. DATABASE SIZE AND PERFORMANCE
-- ========================================

-- 7a. Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;

-- 7b. Missing indexes (tables without indexes)
SELECT 
  t.tablename,
  COUNT(i.indexname) as index_count
FROM pg_tables t
LEFT JOIN pg_indexes i ON t.tablename = i.tablename AND t.schemaname = i.schemaname
WHERE t.schemaname = 'public'
GROUP BY t.tablename
HAVING COUNT(i.indexname) = 0;

-- 7c. Unused indexes (indexes that are never used)
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as times_used,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- ========================================
-- 8. CHECK FOR NULL VALUES IN CRITICAL FIELDS
-- ========================================

-- 8a. Affiliates with missing critical data
SELECT 
  'Affiliates missing email' as issue,
  COUNT(*) as count
FROM affiliates WHERE email IS NULL OR email = ''
UNION ALL
SELECT 
  'Affiliates missing referral code' as issue,
  COUNT(*) as count
FROM affiliates WHERE referral_code IS NULL OR referral_code = ''
UNION ALL
SELECT 
  'Affiliates missing commission rate' as issue,
  COUNT(*) as count
FROM affiliates WHERE commission_rate IS NULL;

-- 8b. Quiz sessions with missing data
SELECT 
  'Sessions missing email' as issue,
  COUNT(*) as count
FROM "QuizSession" WHERE email IS NULL OR email = ''
UNION ALL
SELECT 
  'Sessions missing quiz type' as issue,
  COUNT(*) as count
FROM "QuizSession" WHERE quiz_type IS NULL;

-- ========================================
-- 9. SUMMARY STATISTICS
-- ========================================
SELECT 
  'Total Affiliates' as metric,
  COUNT(*)::text as value
FROM affiliates
UNION ALL
SELECT 
  'Active Affiliates',
  COUNT(*)::text
FROM affiliates WHERE is_active = true
UNION ALL
SELECT 
  'Total Quiz Sessions',
  COUNT(*)::text
FROM "QuizSession"
UNION ALL
SELECT 
  'Completed Sessions',
  COUNT(*)::text
FROM "QuizSession" WHERE status = 'completed'
UNION ALL
SELECT 
  'Total Appointments',
  COUNT(*)::text
FROM "Appointment"
UNION ALL
SELECT 
  'Total Conversions',
  COUNT(*)::text
FROM affiliate_conversions
UNION ALL
SELECT 
  'Total Commission Earned',
  CONCAT('$', SUM(commission_amount)::text)
FROM affiliate_conversions
UNION ALL
SELECT 
  'Total Commission Available',
  CONCAT('$', SUM(commission_amount)::text)
FROM affiliate_conversions WHERE commission_status = 'available'
UNION ALL
SELECT 
  'Total Commission Held',
  CONCAT('$', SUM(commission_amount)::text)
FROM affiliate_conversions WHERE commission_status = 'held'
UNION ALL
SELECT 
  'Total Tasks',
  COUNT(*)::text
FROM tasks
UNION ALL
SELECT 
  'Total Notes',
  COUNT(*)::text
FROM notes;

