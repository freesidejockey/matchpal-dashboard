-- =============================================
-- FIX: Sessions Table Student Foreign Key
-- =============================================
-- This script corrects the sessions.student_id foreign key
-- to reference the students table instead of profiles table

-- IMPORTANT: Run this BEFORE creating any sessions, or you'll need to
-- update existing session records first

-- Step 1: Drop the incorrect foreign key constraint
ALTER TABLE public.sessions
DROP CONSTRAINT IF EXISTS sessions_student_id_fkey;

-- Step 2: Add the correct foreign key constraint to students table
ALTER TABLE public.sessions
ADD CONSTRAINT sessions_student_id_fkey
FOREIGN KEY (student_id)
REFERENCES public.students(id)
ON DELETE CASCADE;

-- Step 3: Verify the constraint was created correctly
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'sessions'
  AND kcu.column_name = 'student_id';

-- Expected result:
-- table_name | column_name | foreign_table_name | foreign_column_name
-- sessions   | student_id  | students           | id

-- =============================================
-- ROLLBACK (if needed)
-- =============================================
-- If you need to revert this change, run:
--
-- ALTER TABLE public.sessions
-- DROP CONSTRAINT sessions_student_id_fkey;
--
-- ALTER TABLE public.sessions
-- ADD CONSTRAINT sessions_student_id_fkey
-- FOREIGN KEY (student_id)
-- REFERENCES public.profiles(id)
-- ON DELETE CASCADE;
