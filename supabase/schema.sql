-- ═══════════════════════════════════════════════════════════════
-- UniAssist — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension (already enabled on Supabase, just in case)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profiles ──────────────────────────────────────────────────
-- Extends Supabase auth.users. Created automatically on signup
-- via a trigger, or manually for admin accounts.
CREATE TABLE IF NOT EXISTS public.profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name        TEXT NOT NULL,
  email            TEXT NOT NULL,
  role             TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  availability     TEXT NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'busy')),
  active_requests  INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Requests ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_to     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  service         TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  class_year      TEXT,
  deadline        DATE,
  file_url        TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','assigned','accepted','in_progress','review','completed','declined')),
  decline_reason  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

CREATE TRIGGER requests_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ── Status updates (timeline) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.status_updates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id  UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  admin_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Messages (chat) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id  UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  file_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Notifications ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_id  UUID REFERENCES public.requests(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('accepted','declined','status_update','new_message','new_request')),
  body        TEXT NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Helper: decrement active_requests safely ───────────────────
CREATE OR REPLACE FUNCTION public.decrement_active_requests(admin_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles
  SET active_requests = GREATEST(0, active_requests - 1)
  WHERE id = admin_id;
END; $$;

-- ── Auto-assignment trigger ────────────────────────────────────
-- Fires on INSERT to requests. Finds the least-loaded available admin
-- and assigns the request to them.
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
  ORDER BY active_requests ASC, RANDOM()  -- RANDOM() breaks ties
  LIMIT 1;

  IF v_admin_id IS NOT NULL THEN
    -- Assign the request
    NEW.assigned_to := v_admin_id;
    NEW.status      := 'assigned';

    -- Increment admin's active count
    UPDATE public.profiles
    SET active_requests = active_requests + 1
    WHERE id = v_admin_id;

    -- Notify the assigned admin
    INSERT INTO public.notifications (user_id, request_id, type, body)
    VALUES (
      v_admin_id,
      NEW.id,
      'new_request',
      'New request assigned to you: "' || NEW.title || '"'
    );
  END IF;
  -- If no admin available, request stays 'pending' (waiting queue)

  RETURN NEW;
END; $$;

CREATE TRIGGER on_request_insert
  BEFORE INSERT ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.auto_assign_request();

-- ── Waiting queue: assign next pending when admin frees up ─────
-- Called by decrement_active_requests or availability toggle
CREATE OR REPLACE FUNCTION public.assign_next_pending(p_admin_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_req_id UUID;
BEGIN
  -- Pick oldest pending request
  SELECT id INTO v_req_id
  FROM public.requests
  WHERE status = 'pending'
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_req_id IS NOT NULL THEN
    UPDATE public.requests
    SET assigned_to = p_admin_id,
        status      = 'assigned'
    WHERE id = v_req_id;

    UPDATE public.profiles
    SET active_requests = active_requests + 1
    WHERE id = p_admin_id;

    INSERT INTO public.notifications (user_id, request_id, type, body)
    SELECT p_admin_id, v_req_id, 'new_request',
           'New request assigned to you: "' || title || '"'
    FROM public.requests WHERE id = v_req_id;
  END IF;
END; $$;

-- ── Row Level Security ─────────────────────────────────────────
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_updates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications   ENABLE ROW LEVEL SECURITY;

-- profiles: everyone reads their own; admins read all
CREATE POLICY "own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "admins read all profiles" ON public.profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- requests: students see their own; admins see all
CREATE POLICY "student own requests" ON public.requests FOR SELECT
  USING (student_id = auth.uid());
CREATE POLICY "admin all requests" ON public.requests FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "student insert request" ON public.requests FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- status_updates: student reads updates on their requests; admin full access
CREATE POLICY "student read own updates" ON public.status_updates FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.requests WHERE id = request_id AND student_id = auth.uid()));
CREATE POLICY "admin manage updates" ON public.status_updates FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- messages: only participants of the request
CREATE POLICY "participant messages" ON public.messages FOR SELECT
  USING (
    sender_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.requests WHERE id = request_id AND student_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "participant insert message" ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND (
      EXISTS (SELECT 1 FROM public.requests WHERE id = request_id AND student_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- notifications: users read their own
CREATE POLICY "own notifications" ON public.notifications FOR ALL USING (user_id = auth.uid());

-- Allow service role (Edge Functions) to bypass RLS
-- This is automatic for the service_role key used in Edge Functions
