-- ═══════════════════════════════════════════════════════════════
-- Fix infinite recursion in profiles RLS policy
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════

-- Drop ALL existing policies on profiles to start clean
DROP POLICY IF EXISTS "own profile" ON public.profiles;
DROP POLICY IF EXISTS "admins read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "update own profile" ON public.profiles;
DROP POLICY IF EXISTS "users can insert own profile" ON public.profiles;

-- 1. Anyone can read any profile (safe — profiles only contain name, role, availability)
--    This avoids the recursion completely
CREATE POLICY "profiles are readable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- 2. Users can insert their own profile row
CREATE POLICY "users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 3. Users can update their own profile
CREATE POLICY "users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);
