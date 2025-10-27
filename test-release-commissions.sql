-- SQL Script to manually release commissions for testing
-- Run this in your Supabase SQL editor

-- 1. View current held commissions
SELECT 
  id,
  commission_amount,
  commission_status,
  hold_until,
  created_at
FROM affiliate_conversions
WHERE commission_status = 'held'
ORDER BY created_at DESC;

-- 2. Update hold_until to NOW() to make them immediately available
-- (Uncomment the line below to execute)
-- UPDATE affiliate_conversions 
-- SET hold_until = NOW() 
-- WHERE commission_status = 'held';

-- 3. After updating, call the release endpoint via your browser or the test script:
-- Visit: https://joinbrightnest.com/api/auto-release-commissions

-- 4. Verify the commissions were released
-- (Run this after calling the endpoint)
-- SELECT 
--   id,
--   commission_amount,
--   commission_status,
--   hold_until,
--   released_at
-- FROM affiliate_conversions
-- WHERE released_at IS NOT NULL
-- ORDER BY released_at DESC;

