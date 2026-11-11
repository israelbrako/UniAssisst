/**
 * supabase.js — Supabase client singleton
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL      = 'https://chpcmswfxbljtznapvmz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocGNtc3dmeGJsanR6bmFwdm16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0ODAxMzAsImV4cCI6MjEwOTA1NjEzMH0.nHlurxI77FqfzlciXK1oh7zv2OgfGVnPlQJhOT2kYJU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/** Returns the currently signed-in user, or null. */
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Returns the profile row for a user.
 * If the row doesn't exist yet (e.g. signup INSERT failed),
 * creates it from auth metadata so the user isn't locked out.
 */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // Row exists — return it
  if (data) return data;

  // Row missing — create it from auth user metadata
  if (error?.code === 'PGRST116' || error?.message?.includes('0 rows')) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No auth user found');

    const full_name = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Student';
    const phone     = user.user_metadata?.phone ?? null;

    const { data: newProfile, error: insertErr } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name,
        email: user.email,
        phone,
        role: 'student',
        availability: 'available',
        active_requests: 0,
      })
      .select()
      .single();

    if (insertErr) throw insertErr;
    return newProfile;
  }

  throw error;
}

/**
 * Redirect to login if no active session.
 * Also signs out if the logged-in user is an admin (wrong role for student pages).
 * Returns { user, profile } if authenticated student.
 */
export async function requireAuth(loginPath = '../auth/login.html') {
  const user = await getUser();
  if (!user) {
    window.location.href = loginPath;
    return null;
  }
  try {
    const profile = await getProfile(user.id);
    // If an admin is somehow on a student page, redirect them to admin
    if (['admin','super_admin'].includes(profile.role)) {
      window.location.href = loginPath.replace('../auth/login.html', '../admin/index.html')
        .replace('/auth/login.html', '/admin/index.html');
      return null;
    }
    return { user, profile };
  } catch (err) {
    console.error('requireAuth: could not load profile', err);
    await supabase.auth.signOut();
    window.location.href = loginPath;
    return null;
  }
}

/**
 * Redirect non-admins away. Returns { user, profile } if authenticated admin or super_admin.
 * Also signs out if the logged-in user is a student (wrong role for admin pages).
 */
export async function requireAdmin(loginPath = 'login.html') {
  const user = await getUser();
  if (!user) {
    window.location.href = loginPath;
    return null;
  }
  try {
    const profile = await getProfile(user.id);
    if (!['admin','super_admin'].includes(profile.role)) {
      // Student on admin page — sign them out and redirect to admin login
      await supabase.auth.signOut();
      window.location.href = loginPath;
      return null;
    }
    return { user, profile };
  } catch (err) {
    console.error('requireAdmin: could not load profile', err);
    window.location.href = loginPath;
    return null;
  }
}
