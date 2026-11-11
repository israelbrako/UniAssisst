-- ═══════════════════════════════════════════════════════════════
-- Function to allow super admins to delete a user
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.delete_user(user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Only super admins can call this
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Only super admins can delete users';
  END IF;

  -- Delete auth user (cascades to profiles, requests, notifications, messages)
  DELETE FROM auth.users WHERE id = user_id;
END;
$$;
