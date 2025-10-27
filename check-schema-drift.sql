-- Check for schema drift between Prisma and Database
-- Run this in Supabase to see actual database columns

-- Check QuizSession columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'quiz_sessions'
ORDER BY ordinal_position;

-- Check if email field exists in quiz_sessions
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'quiz_sessions'
AND column_name = 'email';

-- Check Result columns  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'results'
ORDER BY ordinal_position;

-- Check all tables in public schema
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

