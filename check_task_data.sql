-- Check if the task was created with the correct leadEmail
SELECT 
  t.id,
  t.lead_email,
  t.title,
  t."closerId",
  t.created_at,
  c.name as closer_name
FROM tasks t
LEFT JOIN closers c ON t."closerId" = c.id
WHERE t.created_at > NOW() - INTERVAL '1 hour'
ORDER BY t.created_at DESC
LIMIT 5;
