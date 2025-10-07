-- =============================================
-- FIX: Add UPDATE policy for tutors on orders
-- =============================================
-- This allows the session trigger to update units_remaining
-- when tutors create sessions

-- Add policy to allow tutors to update their assigned orders
-- This is needed for the session trigger to work when tutors log sessions
CREATE POLICY "Tutors can update units on their assigned orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  tutor_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.tutor_profiles
    WHERE tutor_profiles.id = auth.uid()
  )
)
WITH CHECK (
  tutor_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.tutor_profiles
    WHERE tutor_profiles.id = auth.uid()
  )
);

-- Verify the policy was created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'orders'
  AND policyname = 'Tutors can update units on their assigned orders';

-- Expected output:
-- policyname: Tutors can update units on their assigned orders
-- cmd: UPDATE
