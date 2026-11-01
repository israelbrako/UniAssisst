-- ═══════════════════════════════════════════════════════════════
-- Fix messages RLS — allow participants to send and read messages
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════

-- Drop all existing message policies
DROP POLICY IF EXISTS "participant messages" ON public.messages;
DROP POLICY IF EXISTS "participant insert message" ON public.messages;

-- 1. Any authenticated user can read messages on requests they are part of
CREATE POLICY "read own messages" ON public.messages
  FOR SELECT TO authenticated
  USING (
    -- Student who owns the request
    EXISTS (
      SELECT 1 FROM public.requests
      WHERE id = request_id AND student_id = auth.uid()
    )
    OR
    -- Admin assigned to the request
    EXISTS (
      SELECT 1 FROM public.requests
      WHERE id = request_id AND assigned_to = auth.uid()
    )
    OR
    -- Any admin (for team visibility)
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2. Any authenticated user can insert a message on a request they are part of
CREATE POLICY "insert own messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      -- Student who owns the request
      EXISTS (
        SELECT 1 FROM public.requests
        WHERE id = request_id AND student_id = auth.uid()
      )
      OR
      -- Any admin
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Also fix status_updates RLS so admins can insert
DROP POLICY IF EXISTS "admin manage updates" ON public.status_updates;
DROP POLICY IF EXISTS "student read own updates" ON public.status_updates;

CREATE POLICY "read status updates" ON public.status_updates
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.requests WHERE id = request_id AND student_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admins insert status updates" ON public.status_updates
  FOR INSERT TO authenticated
  WITH CHECK (
    admin_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Fix notifications RLS
DROP POLICY IF EXISTS "own notifications" ON public.notifications;

CREATE POLICY "read own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
