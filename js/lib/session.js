/**
 * session.js — Inactivity timeout + session management
 *
 * - 3 minute inactivity timeout
 * - Shows a 30-second warning overlay at 2:30
 * - Signs out and redirects to login at 3:00
 * - Resets timer on any user interaction
 * - On page load, checks if session exists and forces login if expired
 */

import { supabase } from './supabase.js';

const TIMEOUT_MS  = 3 * 60 * 1000;       // 3 minutes
const WARNING_MS  = TIMEOUT_MS - 30000;   // warn at 2:30
const STORAGE_KEY = 'ua_last_active';

let warningTimer = null;
let logoutTimer  = null;
let warningEl    = null;

/** Start inactivity tracking. Call this on every protected page after auth. */
export function startSessionTimer(loginPath = '../auth/login.html') {
  // Record activity timestamp in localStorage so other tabs share it
  touch();

  // Reset timers on any user interaction
  const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'click'];
  events.forEach(ev => window.addEventListener(ev, () => touch(), { passive: true }));

  // Check every 10 seconds if another tab reset the timer
  setInterval(() => checkExpiry(loginPath), 10000);

  scheduleTimers(loginPath);
}

function touch() {
  localStorage.setItem(STORAGE_KEY, Date.now().toString());
  // If warning is showing, hide it since user is active
  if (warningEl) {
    warningEl.remove();
    warningEl = null;
  }
  scheduleTimers();
}

function scheduleTimers(loginPath) {
  clearTimeout(warningTimer);
  clearTimeout(logoutTimer);

  warningTimer = setTimeout(() => showWarning(loginPath), WARNING_MS);
  logoutTimer  = setTimeout(() => forceLogout(loginPath), TIMEOUT_MS);
}

function checkExpiry(loginPath) {
  const last = parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10);
  if (Date.now() - last >= TIMEOUT_MS) {
    forceLogout(loginPath);
  }
}

function showWarning(loginPath) {
  // Don't show duplicate
  if (warningEl) return;

  warningEl = document.createElement('div');
  warningEl.id = 'session-warning';
  warningEl.innerHTML = `
    <div style="
      position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);
      z-index:9999;background:#1a1f2e;color:#f7f1e4;
      border-radius:12px;padding:1rem 1.5rem;
      box-shadow:0 8px 32px rgba(0,0,0,.4);
      display:flex;align-items:center;gap:1rem;
      max-width:380px;width:calc(100% - 2rem);
      border:1px solid rgba(247,241,228,.12);
      font-family:'Source Sans 3',sans-serif;font-size:0.9rem;
    ">
      <span style="font-size:1.3rem">⏱</span>
      <div style="flex:1">
        <strong style="display:block;margin-bottom:0.15rem">Still there?</strong>
        <span style="color:rgba(247,241,228,.65);font-size:0.83rem">
          You'll be signed out in <strong id="countdown" style="color:#c6a35a">30</strong>s due to inactivity.
        </span>
      </div>
      <button id="stay-btn" style="
        background:#c6a35a;color:#0c241c;border:none;
        padding:0.4rem 0.9rem;border-radius:7px;
        font:inherit;font-size:0.85rem;font-weight:700;cursor:pointer;
        white-space:nowrap;
      ">Stay signed in</button>
    </div>
  `;
  document.body.appendChild(warningEl);

  // Countdown
  let seconds = 30;
  const countdownEl = document.getElementById('countdown');
  const interval = setInterval(() => {
    seconds--;
    if (countdownEl) countdownEl.textContent = seconds;
    if (seconds <= 0) clearInterval(interval);
  }, 1000);

  document.getElementById('stay-btn').addEventListener('click', () => {
    clearInterval(interval);
    touch();
  });
}

async function forceLogout(loginPath = '../auth/login.html') {
  clearTimeout(warningTimer);
  clearTimeout(logoutTimer);
  localStorage.removeItem(STORAGE_KEY);
  // Clear the Supabase session so opening a new tab requires login
  await supabase.auth.signOut();
  window.location.href = loginPath;
}

/**
 * Call this at the top of every protected page BEFORE showing content.
 * If the session is expired or missing, redirects to login immediately.
 */
export async function enforceSession(loginPath = '../auth/login.html') {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = loginPath;
    return false;
  }

  // Check if inactivity timer already expired in another tab
  const last = parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10);
  if (last > 0 && Date.now() - last >= TIMEOUT_MS) {
    await forceLogout(loginPath);
    return false;
  }

  return true;
}
