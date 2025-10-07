-- =============================================
-- SEED DATA: Orders
-- =============================================
-- This script adds sample orders for testing
--
-- PREREQUISITES:
-- - You must have students in the profiles/student_profiles tables
-- - You must have tutors in the profiles/tutor_profiles tables
-- - You must have services and service_tiers created (run seed_services.sql first)
--
-- INSTRUCTIONS:
-- 1. Update the student_id and tutor_id values below with actual IDs from your database
-- 2. Update the service_tier_id values with actual IDs from your service_tiers table
-- 3. Run this script in your Supabase SQL Editor

-- Example orders (replace IDs with actual values from your database)
-- To get student IDs, run: SELECT id, first_name, last_name FROM profiles WHERE role = 'Client';
-- To get tutor IDs, run: SELECT id FROM tutor_profiles;
-- To get service tier IDs, run: SELECT id, tier_name FROM service_tiers;

-- Order 1: Paid order, assigned to tutor, active
INSERT INTO public.orders (
  student_id,
  service_tier_id,
  tutor_id,
  payment_status,
  assignment_status,
  total_units,
  units_remaining,
  hourly_rate_locked,
  status_notes
) VALUES (
  'REPLACE_WITH_STUDENT_ID_1', -- student_id
  'REPLACE_WITH_SERVICE_TIER_ID_1', -- service_tier_id (e.g., MCAT Basic 10 hours)
  'REPLACE_WITH_TUTOR_ID_1', -- tutor_id
  'paid',
  'active',
  10.0,
  7.5,
  50.00,
  'Student is making good progress'
);

-- Order 2: Paid order, assigned to tutor, just started
INSERT INTO public.orders (
  student_id,
  service_tier_id,
  tutor_id,
  payment_status,
  assignment_status,
  total_units,
  units_remaining,
  hourly_rate_locked,
  status_notes
) VALUES (
  'REPLACE_WITH_STUDENT_ID_2',
  'REPLACE_WITH_SERVICE_TIER_ID_2', -- e.g., USMLE Step 1 Starter 15 hours
  'REPLACE_WITH_TUTOR_ID_1',
  'paid',
  'active',
  15.0,
  15.0,
  55.00,
  'First session scheduled for next week'
);

-- Order 3: Pending payment, unassigned
INSERT INTO public.orders (
  student_id,
  service_tier_id,
  tutor_id,
  payment_status,
  assignment_status,
  total_units,
  units_remaining,
  hourly_rate_locked,
  status_notes
) VALUES (
  'REPLACE_WITH_STUDENT_ID_3',
  'REPLACE_WITH_SERVICE_TIER_ID_3', -- e.g., MCAT Standard 25 hours
  NULL,
  'pending',
  'unassigned',
  25.0,
  25.0,
  NULL,
  'Waiting for payment confirmation'
);

-- Order 4: Paid order, assigned to different tutor
INSERT INTO public.orders (
  student_id,
  service_tier_id,
  tutor_id,
  payment_status,
  assignment_status,
  total_units,
  units_remaining,
  hourly_rate_locked,
  status_notes
) VALUES (
  'REPLACE_WITH_STUDENT_ID_1',
  'REPLACE_WITH_SERVICE_TIER_ID_4', -- e.g., Medical School Application Consulting
  'REPLACE_WITH_TUTOR_ID_2',
  'paid',
  'assigned',
  5.0,
  5.0,
  60.00,
  'Tutor assigned, awaiting first session'
);

-- Order 5: Completed order
INSERT INTO public.orders (
  student_id,
  service_tier_id,
  tutor_id,
  payment_status,
  assignment_status,
  total_units,
  units_remaining,
  hourly_rate_locked,
  status_notes,
  completed_at
) VALUES (
  'REPLACE_WITH_STUDENT_ID_2',
  'REPLACE_WITH_SERVICE_TIER_ID_5', -- e.g., USMLE Step 2 Essentials 20 hours
  'REPLACE_WITH_TUTOR_ID_2',
  'paid',
  'completed',
  20.0,
  0.0,
  52.00,
  'Successfully completed all sessions. Student passed exam!',
  NOW()
);

-- Order 6: Cancelled order with refund
INSERT INTO public.orders (
  student_id,
  service_tier_id,
  tutor_id,
  payment_status,
  assignment_status,
  total_units,
  units_remaining,
  hourly_rate_locked,
  status_notes
) VALUES (
  'REPLACE_WITH_STUDENT_ID_3',
  'REPLACE_WITH_SERVICE_TIER_ID_6',
  NULL,
  'refunded',
  'cancelled',
  10.0,
  10.0,
  NULL,
  'Student changed their mind, full refund issued'
);

-- Display confirmation
SELECT
  o.id,
  p.first_name || ' ' || p.last_name as student_name,
  st.tier_name,
  s.title as service,
  o.payment_status,
  o.assignment_status,
  o.total_units,
  o.units_remaining
FROM public.orders o
JOIN public.profiles p ON o.student_id = p.id
JOIN public.service_tiers st ON o.service_tier_id = st.id
JOIN public.services s ON st.service_id = s.id
ORDER BY o.created_at DESC;

-- =============================================
-- HELPER QUERIES
-- =============================================
-- Run these queries to get the IDs you need:

-- Get student IDs:
-- SELECT id, first_name, last_name, email FROM profiles WHERE role = 'Client' ORDER BY created_at DESC LIMIT 5;

-- Get tutor IDs:
-- SELECT tp.id, p.first_name, p.last_name, tp.hourly_rate
-- FROM tutor_profiles tp
-- JOIN profiles p ON tp.id = p.id
-- ORDER BY tp.created_at DESC LIMIT 5;

-- Get service tier IDs:
-- SELECT st.id, s.title, st.tier_name, st.base_price, st.base_units
-- FROM service_tiers st
-- JOIN services s ON st.service_id = s.id
-- WHERE st.is_active = true
-- ORDER BY s.title, st.base_price;
