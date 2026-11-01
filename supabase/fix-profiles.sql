-- ═══════════════════════════════════════════════════════════════
-- Fix: Auto-create profile on signup via Postgres trigger
-- This makes profile creation reliable regardless of RLS policies
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════

-- 1. Allow users to insert their OWN profile row (fixes RLS blocking signup)
DROP POLICY IF EXISTS "users can insert own profile" ON public.profiles;
CREATE POLICY "users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Allow users to read their own profile
DROP POLICY IF EXISTS "own profile" ON public.profiles;
CREATE POLICY "own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- 3. Allow users to update their own profile
DROP POLICY IF EXISTS "update own profile" ON public.profiles;
CREATE POLICY "update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 4. Allow admins to read ALL profiles
DROP POLICY IF EXISTS "admins read all profiles" ON public.profiles;
CREATE POLICY "admins read all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Trigger: auto-create profile row whenever a new auth user signs up
--    This is the most reliable approach — runs as superuser, bypasses RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role, availability, active_requests)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    'available',
    0
  )
  ON CONFLICT (id) DO NOTHING;  -- safe to re-run, won't overwrite existing rows
  RETURN NEW;
END;
$$;

-- Drop old trigger if exists, then create fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Backfill: create profile rows for any existing auth users that are missing one
INSERT INTO public.profiles (id, full_name, email, role, availability, active_requests)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  u.email,
  COALESCE(u.raw_user_meta_data->>'role', 'student'),
  'available',
  0
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;
