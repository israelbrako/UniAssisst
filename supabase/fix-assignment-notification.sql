-- ═══════════════════════════════════════════════════════════════
-- Update auto_assign trigger to include student name in notification
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.auto_assign_request()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_admin_id    UUID;
  v_student_name TEXT;
BEGIN
  -- Get student name
  SELECT full_name INTO v_student_name
  FROM public.profiles
  WHERE id = NEW.student_id;

  -- Find available admin with fewest active requests
  SELECT id INTO v_admin_id
  FROM public.profiles
  WHERE role IN ('admin', 'super_admin')
    AND availability = 'available'
  ORDER BY active_requests ASC, RANDOM()
  LIMIT 1;

  IF v_admin_id IS NOT NULL THEN
    UPDATE public.requests
    SET assigned_to = v_admin_id,
        status      = 'assigned'
    WHERE id = NEW.id;

    UPDATE public.profiles
    SET active_requests = active_requests + 1
    WHERE id = v_admin_id;

    -- Include student name in body using | separator so notify-sms can parse it
    INSERT INTO public.notifications (user_id, request_id, type, body)
    VALUES (
      v_admin_id,
      NEW.id,
      'new_request',
      v_student_name || '|' || NEW.title
    );
  END IF;

  RETURN NEW;
END;
$$;
