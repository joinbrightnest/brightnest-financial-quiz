-- Fix appointment email casing issue
-- This script normalizes all customer emails to lowercase for consistency
-- Run this to fix existing records so activity logs can find appointments correctly

-- Update all appointment emails to lowercase
UPDATE appointments 
SET customer_email = LOWER(customer_email)
WHERE customer_email != LOWER(customer_email);

-- Check results
SELECT 
  id, 
  customer_name, 
  customer_email,
  outcome,
  status,
  created_at
FROM appointments 
ORDER BY created_at DESC
LIMIT 20;

-- Verify the fix by checking if any mixed-case emails remain
SELECT COUNT(*) as remaining_mixed_case_emails
FROM appointments
WHERE customer_email != LOWER(customer_email);

