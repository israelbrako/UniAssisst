/**
 * notify-sms Edge Function
 *
 * Fires on INSERT to the `notifications` table (via Database Webhook).
 * Sends an SMS to the notification recipient using the mNotify BMS API.
 *
 * Environment secrets needed (Supabase Dashboard → Edge Functions → Secrets):
 *   MNOTIFY_API_KEY  = your mNotify API key
 *   MNOTIFY_SENDER   = your approved Sender ID (e.g. Webverse)
 *
 * Webhook setup (Supabase Dashboard → Database → Webhooks):
 *   Name:   notify-sms
 *   Table:  notifications
 *   Events: INSERT
 *   URL:    https://chpcmswfxbljtznapvmz.supabase.co/functions/v1/notify-sms
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL         = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const MNOTIFY_API_KEY      = Deno.env.get('MNOTIFY_API_KEY') ?? '';
const MNOTIFY_SENDER       = Deno.env.get('MNOTIFY_SENDER') ?? 'UniAssist';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

serve(async (req) => {
  try {
    const payload = await req.json();
    const record  = payload.record; // the new notification row

    if (!record?.id || !record?.user_id) {
      return new Response('Missing record data', { status: 400 });
    }

    // Skip if no API key configured
    if (!MNOTIFY_API_KEY) {
      console.log('MNOTIFY_API_KEY not set — skipping SMS');
      return new Response('No API key', { status: 200 });
    }

    // Fetch the recipient's profile to get their phone number
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('id', record.user_id)
      .single();

    if (profileErr || !profile?.phone) {
      // No phone number on file — skip silently
      console.log(`No phone for user ${record.user_id}, skipping SMS`);
      return new Response('No phone number', { status: 200 });
    }

    // Format phone number — mNotify expects local format e.g. 0241234567
    // Strip leading + or country code 233 if present
    const phone = formatPhone(profile.phone);
    if (!phone) {
      console.log(`Invalid phone format: ${profile.phone}`);
      return new Response('Invalid phone', { status: 200 });
    }

    // Build the SMS message based on notification type
    const message = buildMessage(record.type, record.body, profile.full_name);

    // Send via mNotify BMS API
    const smsRes = await fetch(
      `https://api.mnotify.com/api/sms/quick?key=${MNOTIFY_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient:     [phone],
          sender:        MNOTIFY_SENDER,
          message,
          is_schedule:   false,
          schedule_date: '',
        }),
      }
    );

    const smsResult = await smsRes.json();
    console.log('mNotify response:', JSON.stringify(smsResult));

    if (smsResult.status !== 'success') {
      console.error('mNotify error:', smsResult);
      return new Response('SMS send failed', { status: 500 });
    }

    return new Response('SMS sent', { status: 200 });

  } catch (err) {
    console.error('notify-sms error:', err);
    return new Response('Internal error', { status: 500 });
  }
});

/**
 * Format phone number to mNotify local format (e.g. 0241234567)
 * Handles: +233241234567, 233241234567, 0241234567
 */
function formatPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('233') && digits.length === 12) {
    return '0' + digits.slice(3); // 233241234567 → 0241234567
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return digits; // already correct
  }
  if (digits.length === 9) {
    return '0' + digits; // 241234567 → 0241234567
  }
  return null;
}

/**
 * Build a short, clear SMS message for each notification type.
 * SMS should be under 160 characters for a single message unit.
 */
function buildMessage(type: string, body: string, name: string): string {
  const firstName = name.split(' ')[0];

  switch (type) {
    case 'accepted':
      return `Hi ${firstName}, your UniAssist request has been ACCEPTED. Log in to chat with your assigned tutor: uniassist-eight.vercel.app`;

    case 'declined':
      return `Hi ${firstName}, your UniAssist request was declined. Log in to see the reason and submit a new one: uniassist-eight.vercel.app`;

    case 'status_update':
      // Trim body to keep SMS short
      const trimmed = body.length > 100 ? body.slice(0, 97) + '...' : body;
      return `UniAssist update: ${trimmed} Log in for details.`;

    case 'new_message':
      return `Hi ${firstName}, you have a new message on your UniAssist request. Log in to reply: uniassist-eight.vercel.app`;

    case 'new_request':
      // This goes to admins
      return `UniAssist: A new request has been assigned to you. Log in to review it: uniassist-eight.vercel.app/admin`;

    default:
      return body.length > 140 ? body.slice(0, 137) + '...' : body;
  }
}
