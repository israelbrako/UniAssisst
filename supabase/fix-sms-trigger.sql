-- ═══════════════════════════════════════════════════════════════
-- SMS notification when a request is assigned to an admin
-- This works by inserting into the notifications table,
-- which triggers the notify-sms webhook automatically
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════

-- The auto_assign_request trigger already inserts a notification
-- when a request is assigned. The notify-sms webhook fires on that.
-- We just need to make sure the admin's phone number is being
-- looked up correctly in the notify-sms function.

-- Check which admins have phone numbers set:
SELECT full_name, email, phone, role, availability, active_requests
FROM public.profiles
WHERE role IN ('admin', 'super_admin')
ORDER BY full_name;
