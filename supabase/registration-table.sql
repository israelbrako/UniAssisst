-- ═══════════════════════════════════════════════════════════════
-- Registration table — stores VM installation day sign-ups
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.registrations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name   TEXT NOT NULL,
  email       TEXT,
  phone       TEXT NOT NULL,
  program     TEXT NOT NULL,
  year        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Allow anyone (unauthenticated) to insert a registration
-- This form is public — no login required
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can register"
  ON public.registrations FOR INSERT
  WITH CHECK (true);

-- Only admins can read registrations
CREATE POLICY "admins read registrations"
  ON public.registrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
