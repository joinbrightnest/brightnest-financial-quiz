SELECT 
  a.id,
  a.customer_email,
  a.quiz_session_id,
  a.scheduled_at,
  a.status,
  a.outcome,
  a.created_at
FROM appointments a
WHERE a.customer_email LIKE '%test%'
ORDER BY a.created_at DESC
LIMIT 5;
