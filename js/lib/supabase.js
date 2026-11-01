/**
 * supabase.js — Supabase client singleton
 *
 * Replace SUPABASE_URL and SUPABASE_ANON_KEY with your project values from:
 * https://supabase.com/dashboard → Project Settings → API
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

/** Returns the profile row for user (includes role, availability, etc.) */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

/** Redirect to login if no active session, returns {user, profile} if ok. */
export async function requireAuth(loginPath = '/auth/login.html') {
  const user = await getUser();
  if (!user) {
    window.location.href = loginPath;
    return null;
  }
  const profile = await getProfile(user.id);
  return { user, profile };
}

/** Redirect non-admins away. */
export async function requireAdmin(loginPath = '/admin/login.html') {
  const user = await getUser();
  if (!user) { window.location.href = loginPath; return null; }
  const profile = await getProfile(user.id);
  if (profile.role !== 'admin') { window.location.href = '/index.html'; return null; }
  return { user, profile };
}
