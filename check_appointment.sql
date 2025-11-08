-- Check the appointment for mNGU
SELECT 
  id,
  customer_email,
  customer_name,
  closer_id,
  created_at,
  scheduled_at
FROM appointments
WHERE customer_name LIKE '%mNGU%'
   OR customer_name LIKE '%mangu%'
ORDER BY created_at DESC
LIMIT 5;
