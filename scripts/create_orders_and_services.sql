-- =============================================
-- MATCHPAL: Services, Orders, and Sessions
-- =============================================
-- This migration creates the core tables for the student-tutor matching system
-- Option 1: Simple & Flat model for MVP

-- =============================================
-- TABLES
-- =============================================

-- Services table: The offerings students can purchase
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Service tiers table: Different levels/packages for each service
CREATE TABLE IF NOT EXISTS public.service_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL,
  base_units NUMERIC(10, 2) NOT NULL, -- hours/units available
  base_price NUMERIC(10, 2) NOT NULL, -- price in dollars
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create enum types for order statuses
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');
CREATE TYPE assignment_status AS ENUM ('unassigned', 'assigned', 'active', 'completed', 'cancelled');

-- Orders table: Core order tracking
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  service_tier_id UUID NOT NULL REFERENCES public.service_tiers(id) ON DELETE RESTRICT,
  tutor_id UUID REFERENCES public.tutor_profiles(id) ON DELETE SET NULL,

  payment_status payment_status NOT NULL DEFAULT 'pending',
  assignment_status assignment_status NOT NULL DEFAULT 'unassigned',

  total_units NUMERIC(10, 2) NOT NULL,
  units_remaining NUMERIC(10, 2) NOT NULL,
  hourly_rate_locked NUMERIC(10, 2), -- rate locked when tutor is assigned

  status_notes TEXT, -- admin notes about payment/assignment

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_at TIMESTAMPTZ, -- when tutor was assigned
  completed_at TIMESTAMPTZ -- when order was completed
);

-- Sessions table: Tutor-logged sessions
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES public.tutor_profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,

  units_consumed NUMERIC(10, 2) NOT NULL,
  session_date TIMESTAMPTZ NOT NULL,
  session_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_service_tiers_service_id ON public.service_tiers(service_id);
CREATE INDEX IF NOT EXISTS idx_orders_student_id ON public.orders(student_id);
CREATE INDEX IF NOT EXISTS idx_orders_tutor_id ON public.orders(tutor_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_assignment_status ON public.orders(assignment_status);
CREATE INDEX IF NOT EXISTS idx_sessions_order_id ON public.sessions(order_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tutor_id ON public.sessions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student_id ON public.sessions(student_id);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_tiers_updated_at BEFORE UPDATE ON public.service_tiers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TRIGGER TO AUTO-UPDATE units_remaining
-- =============================================

CREATE OR REPLACE FUNCTION update_order_units_remaining()
RETURNS TRIGGER AS $$
BEGIN
  -- When a session is inserted, reduce units_remaining
  UPDATE public.orders
  SET units_remaining = units_remaining - NEW.units_consumed
  WHERE id = NEW.order_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER session_updates_order_units AFTER INSERT ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION update_order_units_remaining();

-- =============================================
-- RLS POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SERVICES RLS POLICIES
-- =============================================

-- Everyone can view active services (for browsing/ordering)
CREATE POLICY "Anyone can view active services"
ON public.services
FOR SELECT
TO public
USING (is_active = true);

-- Admins can manage all services
CREATE POLICY "Admins can manage all services"
ON public.services
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);

-- =============================================
-- SERVICE TIERS RLS POLICIES
-- =============================================

-- Everyone can view active service tiers
CREATE POLICY "Anyone can view active service tiers"
ON public.service_tiers
FOR SELECT
TO public
USING (
  is_active = true
  AND EXISTS (
    SELECT 1 FROM public.services
    WHERE services.id = service_tiers.service_id
    AND services.is_active = true
  )
);

-- Admins can manage all service tiers
CREATE POLICY "Admins can manage all service tiers"
ON public.service_tiers
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);

-- =============================================
-- ORDERS RLS POLICIES
-- =============================================

-- Students can view their own orders
CREATE POLICY "Students can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (student_id = auth.uid());

-- Tutors can view orders assigned to them
CREATE POLICY "Tutors can view their assigned orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  tutor_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.tutor_profiles
    WHERE tutor_profiles.id = auth.uid()
  )
);

-- Tutors can update their assigned orders (needed for session trigger)
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

-- Admins can view and manage all orders
CREATE POLICY "Admins can manage all orders"
ON public.orders
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);

-- =============================================
-- SESSIONS RLS POLICIES
-- =============================================

-- Students can view sessions for their orders
CREATE POLICY "Students can view their own sessions"
ON public.sessions
FOR SELECT
TO authenticated
USING (student_id = auth.uid());

-- Tutors can view and create sessions for their assigned orders
CREATE POLICY "Tutors can view their sessions"
ON public.sessions
FOR SELECT
TO authenticated
USING (
  tutor_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.tutor_profiles
    WHERE tutor_profiles.id = auth.uid()
  )
);

CREATE POLICY "Tutors can create sessions for their orders"
ON public.sessions
FOR INSERT
TO authenticated
WITH CHECK (
  tutor_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_id
    AND orders.tutor_id = auth.uid()
  )
);

-- Tutors can update their own sessions
CREATE POLICY "Tutors can update their own sessions"
ON public.sessions
FOR UPDATE
TO authenticated
USING (tutor_id = auth.uid())
WITH CHECK (tutor_id = auth.uid());

-- Admins can manage all sessions
CREATE POLICY "Admins can manage all sessions"
ON public.sessions
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

COMMENT ON TABLE public.services IS 'Available services students can purchase';
COMMENT ON TABLE public.service_tiers IS 'Different tier/package options for each service';
COMMENT ON TABLE public.orders IS 'Student orders for services, tracking payment and tutor assignment';
COMMENT ON TABLE public.sessions IS 'Individual tutoring sessions logged by tutors';

COMMENT ON COLUMN public.orders.hourly_rate_locked IS 'Tutor hourly rate locked at time of assignment';
COMMENT ON COLUMN public.orders.status_notes IS 'Admin notes about payment or assignment issues';
COMMENT ON COLUMN public.orders.units_remaining IS 'Automatically updated when sessions are created';
