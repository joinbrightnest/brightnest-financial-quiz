-- Comprehensive Commission Audit
-- Run this in Supabase to find the issue

-- 1. Check all conversions for Manuel
SELECT 
  id,
  conversion_type,
  commission_amount,
  sale_value,
  commission_status,
  status,
  created_at,
  hold_until,
  released_at
FROM affiliate_conversions
WHERE affiliate_id IN (
  SELECT id FROM affiliates WHERE referral_code = 'manuel'
)
ORDER BY created_at DESC;

-- 2. Check Manuel's total commission in affiliates table
SELECT 
  name,
  referral_code,
  total_commission,
  total_leads,
  total_bookings,
  total_sales
FROM affiliates
WHERE referral_code = 'manuel';

-- 3. Sum of actual commission amounts from conversions
SELECT 
  a.name,
  a.referral_code,
  a.total_commission as stored_total,
  SUM(ac.commission_amount) as actual_total_from_conversions,
  SUM(CASE WHEN ac.commission_status = 'held' THEN ac.commission_amount ELSE 0 END) as held_amount,
  SUM(CASE WHEN ac.commission_status = 'available' THEN ac.commission_amount ELSE 0 END) as available_amount,
  COUNT(*) as conversion_count
FROM affiliates a
LEFT JOIN affiliate_conversions ac ON a.id = ac.affiliate_id
WHERE a.referral_code = 'manuel'
GROUP BY a.id, a.name, a.referral_code, a.total_commission;

-- 4. Check for duplicate conversions or commission amounts
SELECT 
  conversion_type,
  commission_amount,
  commission_status,
  COUNT(*) as count
FROM affiliate_conversions
WHERE affiliate_id IN (
  SELECT id FROM affiliates WHERE referral_code = 'manuel'
)
GROUP BY conversion_type, commission_amount, commission_status
ORDER BY count DESC;

