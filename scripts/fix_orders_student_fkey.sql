-- =============================================
-- FIX: Orders Table Student Foreign Key
-- =============================================
-- This script corrects the orders.student_id foreign key
-- to reference the students table instead of profiles table

-- IMPORTANT: This will FAIL if you have existing orders with student_ids
-- that don't exist in the students table. You'll need to either:
-- 1. Delete those orders first, OR
-- 2. Migrate the data by creating matching student records

-- Step 1: Drop the incorrect foreign key constraint
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_student_id_fkey;

-- Step 2: Add the correct foreign key constraint to students table
ALTER TABLE public.orders
ADD CONSTRAINT orders_student_id_fkey
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
  AND tc.table_name = 'orders'
  AND kcu.column_name = 'student_id';

-- Expected result:
-- table_name | column_name | foreign_table_name | foreign_column_name
-- orders     | student_id  | students           | id

-- =============================================
-- TROUBLESHOOTING
-- =============================================
-- If the ALTER TABLE fails with a foreign key violation, run this
-- to see which order records have invalid student_ids:
--
-- SELECT o.id, o.student_id
-- FROM orders o
-- LEFT JOIN students s ON o.student_id = s.id
-- WHERE s.id IS NULL;
--
-- You can either:
-- A) Delete those orders: DELETE FROM orders WHERE student_id NOT IN (SELECT id FROM students);
-- B) Create matching student records for those IDs

-- =============================================
-- ROLLBACK (if needed)
-- =============================================
-- If you need to revert this change, run:
--
-- ALTER TABLE public.orders
-- DROP CONSTRAINT orders_student_id_fkey;
--
-- ALTER TABLE public.orders
-- ADD CONSTRAINT orders_student_id_fkey
-- FOREIGN KEY (student_id)
-- REFERENCES public.profiles(id)
-- ON DELETE CASCADE;
