-- =============================================
-- SEED DATA: Services and Service Tiers
-- =============================================
-- This script adds sample services and tiers for testing

-- Insert Services
INSERT INTO public.services (id, title, description, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'MCAT Prep', 'Comprehensive MCAT preparation with experienced tutors', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'USMLE Step 1 Prep', 'Intensive USMLE Step 1 exam preparation', true),
  ('550e8400-e29b-41d4-a716-446655440003', 'USMLE Step 2 CK Prep', 'Clinical knowledge preparation for Step 2 CK', true),
  ('550e8400-e29b-41d4-a716-446655440004', 'Medical School Application Consulting', 'Guidance through the medical school application process', true),
  ('550e8400-e29b-41d4-a716-446655440005', 'Residency Application Consulting', 'Support for residency applications and match preparation', true);

-- Insert Service Tiers for MCAT Prep
INSERT INTO public.service_tiers (service_id, tier_name, base_units, base_price, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Basic (10 hours)', 10, 500.00, true),
  ('550e8400-e29b-41d4-a716-446655440001', 'Standard (25 hours)', 25, 1200.00, true),
  ('550e8400-e29b-41d4-a716-446655440001', 'Premium (50 hours)', 50, 2300.00, true),
  ('550e8400-e29b-41d4-a716-446655440001', 'Elite (100 hours)', 100, 4500.00, true);

-- Insert Service Tiers for USMLE Step 1 Prep
INSERT INTO public.service_tiers (service_id, tier_name, base_units, base_price, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 'Starter (15 hours)', 15, 750.00, true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Professional (30 hours)', 30, 1450.00, true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Comprehensive (60 hours)', 60, 2800.00, true);

-- Insert Service Tiers for USMLE Step 2 CK Prep
INSERT INTO public.service_tiers (service_id, tier_name, base_units, base_price, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'Essentials (20 hours)', 20, 950.00, true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Complete (40 hours)', 40, 1850.00, true);

-- Insert Service Tiers for Medical School Application Consulting
INSERT INTO public.service_tiers (service_id, tier_name, base_units, base_price, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440004', 'Basic Package (5 hours)', 5, 400.00, true),
  ('550e8400-e29b-41d4-a716-446655440004', 'Full Service (12 hours)', 12, 900.00, true),
  ('550e8400-e29b-41d4-a716-446655440004', 'Premium Package (20 hours)', 20, 1450.00, true);

-- Insert Service Tiers for Residency Application Consulting
INSERT INTO public.service_tiers (service_id, tier_name, base_units, base_price, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440005', 'Interview Prep (8 hours)', 8, 600.00, true),
  ('550e8400-e29b-41d4-a716-446655440005', 'Application Review (15 hours)', 15, 1100.00, true),
  ('550e8400-e29b-41d4-a716-446655440005', 'Complete Match Support (25 hours)', 25, 1800.00, true);

-- Display confirmation
SELECT
  s.title as service,
  COUNT(st.id) as tier_count
FROM public.services s
LEFT JOIN public.service_tiers st ON s.id = st.service_id
GROUP BY s.id, s.title
ORDER BY s.title;
