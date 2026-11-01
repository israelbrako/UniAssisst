/**
 * auto-assign Edge Function
 *
 * This function is triggered as a Supabase Database Webhook on
 * INSERT to the `requests` table.
 *
 * However, since we handle assignment directly in a Postgres trigger
 * (see schema.sql), this Edge Function is available as an alternative
 * approach — for example, if you want to send an email notification
 * to the assigned admin.
 *
 * To deploy: supabase functions deploy auto-assign
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL        = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY       = Deno.env.get('RESEND_API_KEY') ?? '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

serve(async (req) => {
  try {
    const payload = await req.json();
    const record  = payload.record; // the new request row

    if (!record?.id) {
      return new Response('No record', { status: 400 });
    }

    // Fetch the full request with assigned admin details
    const { data: request } = await supabase
      .from('requests')
      .select('*, assigned_to ( full_name, email ), student:student_id ( full_name, email )')
      .eq('id', record.id)
      .single();

    if (!request?.assigned_to) {
      // No admin available — notify all admins of a pending request
      const { data: admins } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'admin');

      if (admins && RESEND_API_KEY) {
        for (const admin of admins) {
          await sendEmail({
            to: admin.email,
            subject: 'New request waiting — no one available',
            html: `<p>Hi ${admin.full_name},</p>
                   <p>A new request "<strong>${request.title}</strong>" from ${request.student?.full_name} is waiting but no admin is currently available.</p>
                   <p>Please set yourself as Available to claim it.</p>`,
          });
        }
      }
      return new Response('Pending, no admin available', { status: 200 });
    }

    // Send email to assigned admin
    if (RESEND_API_KEY) {
      await sendEmail({
        to: request.assigned_to.email,
        subject: `New request assigned to you — ${request.title}`,
        html: `<p>Hi ${request.assigned_to.full_name},</p>
               <p>A new request has been assigned to you:</p>
               <ul>
                 <li><strong>Title:</strong> ${request.title}</li>
                 <li><strong>Service:</strong> ${request.service}</li>
                 <li><strong>Student:</strong> ${request.student?.full_name}</li>
                 <li><strong>Deadline:</strong> ${request.deadline ?? 'Not specified'}</li>
               </ul>
               <p>Log in to review and accept or decline it.</p>`,
      });

      // Also notify the student that their request was received
      await sendEmail({
        to: request.student?.email,
        subject: `We received your request — ${request.title}`,
        html: `<p>Hi ${request.student?.full_name},</p>
               <p>Your request "<strong>${request.title}</strong>" has been received and assigned to a team member. They'll review it shortly.</p>
               <p>Log in to your dashboard to track the status.</p>`,
      });
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response('Internal error', { status: 500 });
  }
});

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!RESEND_API_KEY) return;
  await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from:    'UniAssist <noreply@yourdomain.com>',
      to:      [to],
      subject,
      html,
    }),
  });
}
