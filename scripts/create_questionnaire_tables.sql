-- =============================================
-- MATCHPAL: Questionnaire & Pairing System
-- =============================================
-- This migration creates tables for the intake questionnaire and pairing system

-- =============================================
-- PHASE 1.1: QUESTIONNAIRE RESPONSES TABLE
-- =============================================

-- Create enum for questionnaire types
DO $$ BEGIN
  CREATE TYPE questionnaire_type AS ENUM ('tutoring', 'advising');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for questionnaire status
DO $$ BEGIN
  CREATE TYPE questionnaire_status AS ENUM ('pending', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Questionnaire responses table: Stores student intake form submissions
CREATE TABLE IF NOT EXISTS public.questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  questionnaire_type questionnaire_type NOT NULL,
  status questionnaire_status NOT NULL DEFAULT 'pending',
  responses JSONB,  -- Stores the form data (typed in application code)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(order_id)  -- One questionnaire per order
);

-- Indexes for questionnaire_responses
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_status
  ON public.questionnaire_responses(status);
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_order
  ON public.questionnaire_responses(order_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_type
  ON public.questionnaire_responses(questionnaire_type);

-- =============================================
-- PHASE 1.2: ADD questionnaire_type TO SERVICES
-- =============================================

-- Add questionnaire_type column to services table
-- This determines which intake form students see when purchasing this service
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS questionnaire_type questionnaire_type;

COMMENT ON COLUMN public.services.questionnaire_type IS
  'Type of intake questionnaire required for this service (tutoring/advising/null)';

-- =============================================
-- PHASE 1.3: ADD MATCHING FIELDS TO TUTOR_PROFILES
-- =============================================

-- Create enum for tutor role type
DO $$ BEGIN
  CREATE TYPE tutor_role_type AS ENUM ('tutor', 'advisor', 'both');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add matching fields to tutor_profiles
ALTER TABLE public.tutor_profiles
ADD COLUMN IF NOT EXISTS degree VARCHAR(10),              -- 'MD' | 'DO'
ADD COLUMN IF NOT EXISTS school_name VARCHAR(255),        -- Free text
ADD COLUMN IF NOT EXISTS residency_name VARCHAR(255),     -- Free text
ADD COLUMN IF NOT EXISTS specialty VARCHAR(100),          -- Medical specialty
ADD COLUMN IF NOT EXISTS region VARCHAR(100),             -- US region
ADD COLUMN IF NOT EXISTS role_type tutor_role_type DEFAULT 'tutor',
ADD COLUMN IF NOT EXISTS exam_subjects TEXT[];            -- Array of exam types they teach

COMMENT ON COLUMN public.tutor_profiles.degree IS 'MD or DO degree';
COMMENT ON COLUMN public.tutor_profiles.school_name IS 'Medical school name (0 weight in matching)';
COMMENT ON COLUMN public.tutor_profiles.residency_name IS 'Residency program name (0 weight in matching)';
COMMENT ON COLUMN public.tutor_profiles.specialty IS 'Medical specialty for advising matches';
COMMENT ON COLUMN public.tutor_profiles.region IS 'US region for advising matches';
COMMENT ON COLUMN public.tutor_profiles.role_type IS 'Whether they do tutoring, advising, or both';
COMMENT ON COLUMN public.tutor_profiles.exam_subjects IS 'Array of exam types they can teach (USMLE Step 1, etc.)';

-- =============================================
-- PHASE 4.1: PAIRING OFFERS TABLE (for later phases)
-- =============================================

-- Create enum for pairing offer status
DO $$ BEGIN
  CREATE TYPE pairing_offer_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Pairing offers table: Tracks offers made to tutors/advisors
CREATE TABLE IF NOT EXISTS public.pairing_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES public.tutor_profiles(id) ON DELETE CASCADE,
  status pairing_offer_status NOT NULL DEFAULT 'pending',
  match_score INTEGER,                    -- 0-100 score
  match_reasons JSONB,                    -- Array of reasons for the match
  is_student_preference BOOLEAN DEFAULT false,  -- True if student selected this provider
  offered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,                 -- offered_at + 12 hours
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for pairing_offers
CREATE INDEX IF NOT EXISTS idx_pairing_offers_order
  ON public.pairing_offers(order_id);
CREATE INDEX IF NOT EXISTS idx_pairing_offers_tutor
  ON public.pairing_offers(tutor_id);
CREATE INDEX IF NOT EXISTS idx_pairing_offers_status
  ON public.pairing_offers(status);
CREATE INDEX IF NOT EXISTS idx_pairing_offers_expires
  ON public.pairing_offers(expires_at)
  WHERE status = 'pending';

-- =============================================
-- RLS POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pairing_offers ENABLE ROW LEVEL SECURITY;

-- =============================================
-- QUESTIONNAIRE_RESPONSES RLS POLICIES
-- =============================================

-- Students can view their own questionnaire responses (via their orders)
CREATE POLICY "Students can view their own questionnaire responses"
ON public.questionnaire_responses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = questionnaire_responses.order_id
    AND orders.student_id = auth.uid()
  )
);

-- Students can update their own pending questionnaire responses
CREATE POLICY "Students can update their pending questionnaire responses"
ON public.questionnaire_responses
FOR UPDATE
TO authenticated
USING (
  status = 'pending'
  AND EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = questionnaire_responses.order_id
    AND orders.student_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = questionnaire_responses.order_id
    AND orders.student_id = auth.uid()
  )
);

-- Tutors can view questionnaire responses for their assigned orders
CREATE POLICY "Tutors can view questionnaire responses for their orders"
ON public.questionnaire_responses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = questionnaire_responses.order_id
    AND orders.tutor_id = auth.uid()
  )
);

-- Admins can manage all questionnaire responses
CREATE POLICY "Admins can manage all questionnaire responses"
ON public.questionnaire_responses
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);

-- =============================================
-- PAIRING_OFFERS RLS POLICIES
-- =============================================

-- Tutors can view pairing offers for themselves
CREATE POLICY "Tutors can view their pairing offers"
ON public.pairing_offers
FOR SELECT
TO authenticated
USING (
  tutor_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.tutor_profiles
    WHERE tutor_profiles.id = auth.uid()
  )
);

-- Tutors can update their pending pairing offers (accept/reject)
CREATE POLICY "Tutors can respond to their pairing offers"
ON public.pairing_offers
FOR UPDATE
TO authenticated
USING (
  tutor_id = auth.uid()
  AND status = 'pending'
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

-- Admins can manage all pairing offers
CREATE POLICY "Admins can manage all pairing offers"
ON public.pairing_offers
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE public.questionnaire_responses IS
  'Student intake form responses, one per order';
COMMENT ON TABLE public.pairing_offers IS
  'Pairing offers made to tutors/advisors, with 12hr response window';

COMMENT ON COLUMN public.questionnaire_responses.responses IS
  'JSONB storing form data - typed as TutoringIntakeData or AdvisingIntakeData in app code';
COMMENT ON COLUMN public.pairing_offers.is_student_preference IS
  'True if the student specifically selected this provider in the intake form';
COMMENT ON COLUMN public.pairing_offers.expires_at IS
  'Offer expires 12 hours after offered_at if not responded to';
