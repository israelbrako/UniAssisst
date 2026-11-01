# UniAssist — Setup Guide

## 1. Create a Supabase project

1. Go to https://supabase.com and create a free project
2. Choose a region close to your users
3. Save your **Project URL** and **Anon key** (Dashboard → Settings → API)

---

## 2. Run the database schema

1. In Supabase Dashboard → **SQL Editor** → **New query**
2. Paste the entire contents of `supabase/schema.sql`
3. Click **Run**

This creates all tables, triggers, auto-assignment logic, and Row Level Security policies.

---

## 3. Configure the Supabase client

Open `js/lib/supabase.js` and replace the two placeholder values:

```js
const SUPABASE_URL    = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

---

## 4. Create admin accounts

Admin accounts must be created manually (they can't self-register via the student signup form).

For each admin (you have 3):

1. Supabase Dashboard → **Authentication** → **Users** → **Add user**
2. Fill in email and password, click **Create user** — note the UUID shown
3. Supabase Dashboard → **Table Editor** → `profiles` → **Insert row**:
   - `id` → paste the UUID from step 2
   - `full_name` → their name
   - `email` → their email
   - `phone` → their Ghana phone number e.g. `0241234567`
   - `role` → `admin`
   - `availability` → `available`
   - `active_requests` → `0`

---

## 5. Enable Realtime

Supabase Dashboard → **Database** → **Replication** → enable the following tables:
- `requests`
- `messages`
- `notifications`
- `profiles`

---

## 6. Set up Storage (file attachments)

1. Supabase Dashboard → **Storage** → **New bucket**
2. Name: `request-files`
3. Make it **Public** (so students can download files via URL)
4. Add a policy: allow authenticated users to upload to their own folder:
   ```
   (storage.foldername(name))[1] = auth.uid()::text
   ```

---

## 7. (Optional) Email notifications via Resend

1. Sign up at https://resend.com (free tier: 3,000 emails/month)
2. Get your API key
3. In Supabase Dashboard → **Edge Functions** → **Secrets**:
   - Add `RESEND_API_KEY` = your Resend key
4. Deploy the Edge Function:
   ```bash
   supabase functions deploy auto-assign
   ```
5. Create a **Database Webhook** (Supabase Dashboard → Database → Webhooks):
   - Table: `requests`
   - Events: `INSERT`
   - URL: your Edge Function URL

---

## 8. Update the public homepage links

In `index.html`, update the nav links:
- "Book a session" → `auth/signup.html` or `auth/login.html`
- Add a "My account" link for logged-in students

---

## Page URLs reference

| Page | URL |
|---|---|
| Homepage | `/index.html` |
| Student signup | `/auth/signup.html` |
| Student login | `/auth/login.html` |
| Student dashboard | `/dashboard/index.html` |
| New request | `/dashboard/new-request.html` |
| Request detail (student) | `/dashboard/request.html?id=UUID` |
| Admin login | `/admin/login.html` |
| Admin queue | `/admin/index.html` |
| Admin request detail | `/admin/request.html?id=UUID` |
| Admin my work | `/admin/my-work.html` |
| Admin team | `/admin/team.html` |
| Admin history | `/admin/history.html` |

---

## How the auto-assignment works

1. Student submits a request → row inserted into `requests` table
2. Postgres trigger `on_request_insert` fires immediately
3. It queries `profiles` for admins where `availability = 'available'`
4. Sorts by `active_requests ASC` — picks the least-loaded available admin
5. Updates the request: `assigned_to = admin_id`, `status = 'assigned'`
6. Increments `profiles.active_requests` for that admin
7. Inserts a notification for the admin
8. If no admin is available → request stays `status = 'pending'`
9. When an admin completes/declines a job → call `decrement_active_requests(admin_id)`
   → then call `assign_next_pending(admin_id)` to claim the oldest waiting request

---

## 9. SMS notifications via mNotify BMS

### Step A — Add phone column to the database
Run this in Supabase SQL Editor:
```sql
-- File: supabase/add-phone.sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
```

### Step B — Add your mNotify secrets to Supabase
1. Supabase Dashboard → **Edge Functions** → **Secrets**
2. Add these two secrets:
   - `MNOTIFY_API_KEY` = `mWKPxZ1MhBZb2RZ9dHksh9X1E`
   - `MNOTIFY_SENDER`  = `Webverse`

### Step C — Deploy the Edge Function
Install the Supabase CLI if you haven't:
```bash
npm install -g supabase
```
Then deploy:
```bash
supabase functions deploy notify-sms --project-ref chpcmswfxbljtznapvmz
```

### Step D — Create the Database Webhook
1. Supabase Dashboard → **Database** → **Webhooks** → **Create webhook**
2. Fill in:
   - Name: `notify-sms`
   - Table: `notifications`
   - Events: ✅ Insert
   - Type: **Supabase Edge Functions**
   - Edge Function: select `notify-sms`
3. Click **Create webhook**

That's it. Every time a notification row is inserted (accept, decline, status update, new message), the webhook fires the Edge Function, which reads the student's phone number and sends an SMS via mNotify.

### SMS messages sent for each event
| Event | Who gets SMS |
|---|---|
| Request accepted | Student |
| Request declined | Student |
| Status update posted | Student |
| Admin sends chat message | Student |
| New request assigned | Admin |

### Update your hosting URL in the SMS messages
Open `supabase/functions/notify-sms/index.ts` and replace `uniassist.netlify.app` with your actual hosted URL once you deploy the site.
