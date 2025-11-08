-- Check how email is stored in quiz answers for mNGU
SELECT 
  qa.id,
  qa.value,
  pg_typeof(qa.value) as value_type,
  q.prompt,
  q.type as question_type
FROM quiz_answers qa
JOIN quiz_questions q ON qa."questionId" = q.id
JOIN quiz_sessions qs ON qa."sessionId" = qs.id
WHERE qs.id = 'cmhgq4tbb000i204vyjde8b6'
  AND (q.type = 'email' OR LOWER(q.prompt) LIKE '%email%')
LIMIT 5;
