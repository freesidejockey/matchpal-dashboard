-- =============================================
-- CREATE: Session Trigger Function
-- =============================================
-- This script creates the function that automatically updates
-- order units_remaining when a session is created

-- Drop existing function if it exists (for clean reinstall)
DROP FUNCTION IF EXISTS update_order_units_remaining() CASCADE;

-- Create the function
CREATE OR REPLACE FUNCTION update_order_units_remaining()
RETURNS TRIGGER AS $$
BEGIN
  -- When a session is inserted, reduce units_remaining on the order
  UPDATE public.orders
  SET units_remaining = units_remaining - NEW.units_consumed
  WHERE id = NEW.order_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger (it was dropped by CASCADE above)
DROP TRIGGER IF EXISTS session_updates_order_units ON public.sessions;

CREATE TRIGGER session_updates_order_units
AFTER INSERT ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION update_order_units_remaining();

-- Verify the function was created
SELECT
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'update_order_units_remaining'
  AND n.nspname = 'public';

-- Verify the trigger was created
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'session_updates_order_units'
  AND event_object_table = 'sessions';

-- Expected output:
-- trigger_name: session_updates_order_units
-- event_manipulation: INSERT
-- event_object_table: sessions
-- action_statement: EXECUTE FUNCTION update_order_units_remaining()
