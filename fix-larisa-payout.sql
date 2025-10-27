-- Fix Larisa's payout - mark her conversions as 'paid'
-- Since you already paid out $10, we need to mark those conversions as paid

-- First, check Larisa's current state
SELECT 
  a.name,
  a.total_commission,
  COUNT(ac.id) as conversion_count,
  SUM(CASE WHEN ac.commission_status = 'available' THEN ac.commission_amount ELSE 0 END) as available,
  SUM(CASE WHEN ac.commission_status = 'paid' THEN ac.commission_amount ELSE 0 END) as paid_out,
  COALESCE(SUM(ap.amount_due), 0) as total_payouts
FROM affiliates a
LEFT JOIN affiliate_conversions ac ON a.id = ac.affiliate_id
LEFT JOIN affiliate_payouts ap ON a.id = ap.affiliate_id AND ap.status = 'completed'
WHERE a.referral_code = 'larisa'
GROUP BY a.id, a.name, a.total_commission;

-- Mark Larisa's $10 conversion as 'paid' (since it was already paid out)
UPDATE affiliate_conversions
SET commission_status = 'paid'
WHERE affiliate_id IN (SELECT id FROM affiliates WHERE referral_code = 'larisa')
  AND commission_status = 'available'
  AND commission_amount > 0;

-- Verify the fix
SELECT 
  a.name,
  a.total_commission as lifetime_total,
  SUM(CASE WHEN ac.commission_status = 'available' THEN ac.commission_amount ELSE 0 END) as available,
  SUM(CASE WHEN ac.commission_status = 'paid' THEN ac.commission_amount ELSE 0 END) as paid_out
FROM affiliates a
LEFT JOIN affiliate_conversions ac ON a.id = ac.affiliate_id
WHERE a.referral_code = 'larisa'
GROUP BY a.id, a.name, a.total_commission;

