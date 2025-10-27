-- Complete Audit of Manuel's Commission Data
-- =============================================

-- 1. Check all conversions for Manuel
SELECT 
  id,
  conversion_type,
  commission_amount,
  sale_value,
  commission_status,
  created_at,
  hold_until,
  released_at
FROM affiliate_conversions
WHERE affiliate_id IN (SELECT id FROM affiliates WHERE referral_code = 'manuel')
ORDER BY created_at DESC;

-- 2. Check Manuel's affiliate record
SELECT 
  name,
  referral_code,
  total_commission,
  total_leads,
  total_bookings,
  total_sales
FROM affiliates
WHERE referral_code = 'manuel';

-- 3. Check all payouts for Manuel
SELECT 
  id,
  amount_due,
  status,
  notes,
  created_at,
  paid_at
FROM affiliate_payouts
WHERE affiliate_id IN (SELECT id FROM affiliates WHERE referral_code = 'manuel')
ORDER BY created_at DESC;

-- 4. Calculate what the numbers SHOULD be
SELECT 
  a.name,
  a.referral_code,
  a.total_commission as stored_total_commission,
  
  -- Sum of ALL commissions (lifetime total)
  COALESCE(SUM(ac.commission_amount), 0) as actual_lifetime_commission,
  
  -- Sum of commissions with status='available'
  COALESCE(SUM(CASE WHEN ac.commission_status = 'available' THEN ac.commission_amount ELSE 0 END), 0) as should_be_available,
  
  -- Sum of commissions with status='paid'
  COALESCE(SUM(CASE WHEN ac.commission_status = 'paid' THEN ac.commission_amount ELSE 0 END), 0) as should_be_paid,
  
  -- Sum of commissions with status='held'
  COALESCE(SUM(CASE WHEN ac.commission_status = 'held' THEN ac.commission_amount ELSE 0 END), 0) as should_be_held,
  
  -- Sum of completed payouts
  COALESCE((SELECT SUM(amount_due) FROM affiliate_payouts WHERE affiliate_id = a.id AND status = 'completed'), 0) as total_paid_out,
  
  -- Count of each conversion type
  COUNT(CASE WHEN ac.conversion_type = 'sale' THEN 1 END) as sale_count,
  COUNT(CASE WHEN ac.conversion_type = 'booking' THEN 1 END) as booking_count,
  COUNT(CASE WHEN ac.conversion_type = 'quiz_completion' THEN 1 END) as quiz_count
  
FROM affiliates a
LEFT JOIN affiliate_conversions ac ON a.id = ac.affiliate_id
WHERE a.referral_code = 'manuel'
GROUP BY a.id, a.name, a.referral_code, a.total_commission;

-- 5. Check if there are duplicate conversions (same amount, same time)
SELECT 
  commission_amount,
  commission_status,
  DATE_TRUNC('minute', created_at) as created_minute,
  COUNT(*) as duplicate_count
FROM affiliate_conversions
WHERE affiliate_id IN (SELECT id FROM affiliates WHERE referral_code = 'manuel')
  AND commission_amount > 0
GROUP BY commission_amount, commission_status, DATE_TRUNC('minute', created_at)
HAVING COUNT(*) > 1;

