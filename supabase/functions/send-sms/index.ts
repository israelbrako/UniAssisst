/**
 * send-sms Edge Function
 *
 * Handles both single SMS (registration form) and bulk SMS (super admin).
 * Body can be:
 *   { phone: "0241234567", message: "..." }          — single
 *   { phones: ["024...", "055..."], message: "..." }  — bulk
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const MNOTIFY_API_KEY = Deno.env.get('MNOTIFY_API_KEY') ?? '';
const MNOTIFY_SENDER  = Deno.env.get('MNOTIFY_SENDER') ?? 'Webverse';

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const body = await req.json();
    const message: string = body.message ?? '';

    // Normalise recipients — support single phone or array
    let recipients: string[] = [];
    if (body.phones && Array.isArray(body.phones)) {
      recipients = body.phones;
    } else if (body.phone) {
      recipients = [body.phone];
    }

    if (!message || recipients.length === 0) {
      return json({ ok: false, error: 'message and phone/phones required' }, 400);
    }

    if (!MNOTIFY_API_KEY) {
      console.warn('MNOTIFY_API_KEY not set — SMS skipped');
      return json({ ok: true, warning: 'No API key configured' });
    }

    // mNotify accepts up to 50 recipients per call
    const BATCH = 50;
    let totalSent = 0;

    for (let i = 0; i < recipients.length; i += BATCH) {
      const batch = recipients.slice(i, i + BATCH);
      const res = await fetch(
        `https://api.mnotify.com/api/sms/quick?key=${MNOTIFY_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient:     batch,
            sender:        MNOTIFY_SENDER,
            message,
            is_schedule:   false,
            schedule_date: '',
          }),
        }
      );
      const result = await res.json();
      console.log(`Batch ${i}-${i + batch.length}:`, JSON.stringify(result));
      if (result.status === 'success') totalSent += batch.length;
    }

    return json({ ok: true, sent: totalSent });

  } catch (err) {
    console.error('send-sms error:', err);
    return json({ ok: false, error: String(err) }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
