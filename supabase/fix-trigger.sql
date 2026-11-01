-- ═══════════════════════════════════════════════════════════════
-- Fix: auto-assign trigger inserting notification before request
-- row is committed (foreign key violation)
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════

-- Change trigger from BEFORE INSERT to AFTER INSERT
-- so the request row exists when the notification is inserted

DROP TRIGGER IF EXISTS on_request_insert ON public.requests;

CREATE OR REPLACE FUNCTION public.auto_assign_request()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  -- Find available admin with fewest active requests
  SELECT id INTO v_admin_id
  FROM public.profiles
  WHERE role = 'admin'
    AND availability = 'available'
  ORDER BY active_requests ASC, RANDOM()
  LIMIT 1;

  IF v_admin_id IS NOT NULL THEN
    -- Assign the request
    UPDATE public.requests
    SET assigned_to = v_admin_id,
        status      = 'assigned'
    WHERE id = NEW.id;

    -- Increment admin's active count
    UPDATE public.profiles
    SET active_requests = active_requests + 1
    WHERE id = v_admin_id;

    -- Notify the assigned admin (request row now exists — no FK violation)
    INSERT INTO public.notifications (user_id, request_id, type, body)
    VALUES (
      v_admin_id,
      NEW.id,
      'new_request',
      'New request assigned to you: "' || NEW.title || '"'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- AFTER INSERT so the request row is committed before notification
CREATE TRIGGER on_request_insert
  AFTER INSERT ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.auto_assign_request();
