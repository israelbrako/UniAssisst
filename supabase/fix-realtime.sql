-- ═══════════════════════════════════════════════════════════════
-- Enable Realtime on all required tables
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.status_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
