-- Query 1: Check the appointment for mNGU
SELECT 
  id,
  customer_email,
  customer_name,
  closer_id,
  created_at
FROM appointments
WHERE customer_email = 'mangu@gmail.com'
   OR customer_name LIKE '%mNGU%'
LIMIT 5;

-- Query 2: Check recently created tasks (with correct column names)
SELECT 
  t.id,
  t.lead_email,
  t.title,
  t.closer_id,
  t.created_at,
  c.name as closer_name,
  a.customer_email as appointment_email
FROM tasks t
LEFT JOIN closers c ON t.closer_id = c.id
LEFT JOIN appointments a ON t.lead_email = a.customer_email
WHERE t.created_at > NOW() - INTERVAL '1 hour'
ORDER BY t.created_at DESC
LIMIT 5;

-- Query 3: Check quiz session data for mNGU
SELECT 
  id,
  status,
  user_id,
  created_at
FROM quiz_sessions
WHERE id = 'cmhgq4tbb000i204vyjde8b6';
