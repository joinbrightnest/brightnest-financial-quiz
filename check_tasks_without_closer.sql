-- Check if there are any tasks without a closer assigned
SELECT 
  id,
  title,
  lead_email,
  closer_id,
  created_at,
  status
FROM tasks
WHERE closer_id IS NULL
ORDER BY created_at DESC;

