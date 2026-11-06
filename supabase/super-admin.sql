-- ═══════════════════════════════════════════════════════════════
-- Add super_admin role
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════

-- Update role check to allow super_admin
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'admin', 'super_admin'));

-- Set Israel and Elyon as super_admin
UPDATE public.profiles SET role = 'super_admin'
WHERE email IN ('israelbrako@gmail.com', 'elyamp750@gmail.com');

-- Super admins can read ALL profiles
DROP POLICY IF EXISTS "super_admin read all" ON public.profiles;
CREATE POLICY "super_admin read all" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','super_admin')
    )
  );

-- Super admins can read all registrations
DROP POLICY IF EXISTS "admins read registrations" ON public.registrations;
CREATE POLICY "admins read registrations" ON public.registrations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin','super_admin')
    )
  );
