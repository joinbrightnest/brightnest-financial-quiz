-- Fix Duplicate Commission Amounts
-- This script corrects the totalCommission field in the affiliates table
-- by subtracting the amounts that were incorrectly added twice

-- Step 1: View current state before fix
SELECT 
  a.name,
  a.referral_code,
  a.total_commission as current_stored_total,
  SUM(ac.commission_amount) as actual_total_from_conversions,
  a.total_commission - SUM(ac.commission_amount) as difference
FROM affiliates a
LEFT JOIN affiliate_conversions ac ON a.id = ac.affiliate_id
WHERE ac.commission_amount > 0
GROUP BY a.id, a.name, a.referral_code, a.total_commission;

-- Step 2: Fix Manuel's account (subtract the duplicate $10)
-- IMPORTANT: Only run this ONCE after verifying the amounts above
UPDATE affiliates
SET total_commission = (
  SELECT SUM(commission_amount)
  FROM affiliate_conversions
  WHERE affiliate_id = affiliates.id
    AND commission_amount > 0
)
WHERE referral_code = 'manuel';

-- Step 3: Fix ALL affiliates who might have this issue
-- This recalculates totalCommission based on actual conversion amounts
UPDATE affiliates
SET total_commission = (
  SELECT COALESCE(SUM(commission_amount), 0)
  FROM affiliate_conversions
  WHERE affiliate_id = affiliates.id
    AND commission_amount > 0
)
WHERE id IN (
  SELECT DISTINCT affiliate_id
  FROM affiliate_conversions
  WHERE commission_amount > 0
);

-- Step 4: Verify the fix
SELECT 
  a.name,
  a.referral_code,
  a.total_commission as corrected_total,
  SUM(ac.commission_amount) as actual_total_from_conversions,
  SUM(CASE WHEN ac.commission_status = 'held' THEN ac.commission_amount ELSE 0 END) as held,
  SUM(CASE WHEN ac.commission_status = 'available' THEN ac.commission_amount ELSE 0 END) as available
FROM affiliates a
LEFT JOIN affiliate_conversions ac ON a.id = ac.affiliate_id
WHERE ac.commission_amount > 0
GROUP BY a.id, a.name, a.referral_code, a.total_commission;

