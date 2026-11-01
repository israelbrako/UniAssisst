-- ═══════════════════════════════════════════════════════════════
-- Fix admin profiles and missing profile rows
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════

-- 1. Fix the three admins who have no display name in auth metadata
--    Update their profiles to ensure role = admin
UPDATE public.profiles SET role = 'admin'
WHERE email IN (
  'elyamp750@gmail.com',
  'brempongansong3@gmail.com',
  'israelbrako@gmail.com'
);

-- 2. Backfill ANY auth users that still don't have a profile row
INSERT INTO public.profiles (id, full_name, email, role, availability, active_requests)
SELECT
  u.id,
  COALESCE(
    NULLIF(u.raw_user_meta_data->>'full_name', ''),
    split_part(u.email, '@', 1)
  ),
  u.email,
  CASE
    WHEN u.email IN ('elyamp750@gmail.com','brempongansong3@gmail.com','israelbrako@gmail.com')
    THEN 'admin'
    ELSE COALESCE(NULLIF(u.raw_user_meta_data->>'role',''), 'student')
  END,
  'available',
  0
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 3. Verify — show all profiles after fix
SELECT id, full_name, email, role FROM public.profiles ORDER BY role, full_name;
