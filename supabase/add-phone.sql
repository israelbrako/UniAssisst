-- ═══════════════════════════════════════════════════════════════
-- Add phone number field to profiles
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- Optional: index for quick lookups
CREATE INDEX IF NOT EXISTS profiles_phone_idx ON public.profiles (phone);
