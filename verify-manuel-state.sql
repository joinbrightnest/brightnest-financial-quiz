-- Verify Manuel's current state in the database

-- 1. Manuel's conversions (should show 2: one available, one held)
SELECT 
  id,
  commission_amount,
  commission_status,
  created_at
FROM affiliate_conversions
WHERE affiliate_id IN (SELECT id FROM affiliates WHERE referral_code = 'manuel')
ORDER BY created_at DESC;

-- 2. Manuel's payouts (should be empty after deletion)
SELECT 
  id,
  amount_due,
  status,
  created_at
FROM affiliate_payouts
WHERE affiliate_id IN (SELECT id FROM affiliates WHERE referral_code = 'manuel')
ORDER BY created_at DESC;

-- 3. Manuel's affiliate record
SELECT 
  id,
  name,
  total_commission,
  referral_code
FROM affiliates
WHERE referral_code = 'manuel';

