-- =====================================================
-- DIAGNOSTIC: Check Actual Column Names in Supabase
-- =====================================================

-- Check quiz_sessions table structure
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'quiz_sessions'
ORDER BY ordinal_position;

-- Check appointments table structure
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'appointments'
ORDER BY ordinal_position;

-- Check affiliates table structure  
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'affiliates'
ORDER BY ordinal_position;

-- Check affiliate_conversions table structure
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'affiliate_conversions'
ORDER BY ordinal_position;

-- List all existing indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

