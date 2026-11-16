/**
 * session.js — Inactivity timeout + session management
 * - 3 minute inactivity timeout
 * - Shows a 30-second warning overlay at 2:30
 * - Signs out at 3:00
 * - Works on mobile (uses visibilitychange + localStorage timestamp)
 */

import { supabase } from './supabase.js';

const TIMEOUT_MS  = 3 * 60 * 1000;
const WARNING_MS  = TIMEOUT_MS - 30000;
const STORAGE_KEY = 'ua_last_active';

let warningTimer = null;
let logoutTimer  = null;
let warningEl    = null;
let loginPath    = '../auth/login.html';

export function startSessionTimer(path = '../auth/login.html') {
  loginPath = path;
  touch();

  // Desktop + mobile interaction events
  const events = ['mousemove','keydown','mousedown','touchstart','touchmove','pointerdown','scroll','click'];
  events.forEach(ev => window.addEventListener(ev, onActivity, { passive: true }));

  // Mobile: when user returns to the tab, check if expired
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkExpiry();
    }
  });

  // Poll every 15 seconds (works even when timers are throttled on mobile)
  setInterval(checkExpiry, 15000);

  scheduleTimers();
}

function onActivity() {
  touch();
}

function touch() {
  localStorage.setItem(STORAGE_KEY, Date.now().toString());
  if (warningEl) {
    warningEl.remove();
    warningEl = null;
  }
  scheduleTimers();
}

function scheduleTimers() {
  clearTimeout(warningTimer);
  clearTimeout(logoutTimer);
  warningTimer = setTimeout(() => showWarning(), WARNING_MS);
  logoutTimer  = setTimeout(() => forceLogout(), TIMEOUT_MS);
}

function checkExpiry() {
  const last = parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10);
  if (last > 0 && Date.now() - last >= TIMEOUT_MS) {
    forceLogout();
  }
}

function showWarning() {
  if (warningEl) return;
  warningEl = document.createElement('div');
  warningEl.id = 'session-warning';
  warningEl.innerHTML = `
    <div style="
      position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);
      z-index:9999;background:#1a1f2e;color:#f7f1e4;
      border-radius:12px;padding:1rem 1.25rem;
      box-shadow:0 8px 32px rgba(0,0,0,.45);
      display:flex;align-items:center;gap:0.85rem;
      max-width:min(380px, calc(100vw - 2rem));width:calc(100vw - 2rem);
      border:1px solid rgba(247,241,228,.12);
      font-family:'Source Sans 3',sans-serif;font-size:0.9rem;
    ">
      <span style="font-size:1.3rem;flex-shrink:0">⏱</span>
      <div style="flex:1;min-width:0">
        <strong style="display:block;margin-bottom:0.1rem">Still there?</strong>
        <span style="color:rgba(247,241,228,.65);font-size:0.82rem">
          Signing out in <strong id="ua-countdown" style="color:#c6a35a">30</strong>s due to inactivity.
        </span>
      </div>
      <button id="ua-stay-btn" style="
        background:#c6a35a;color:#0c241c;border:none;
        padding:0.45rem 0.85rem;border-radius:7px;
        font:inherit;font-size:0.85rem;font-weight:700;cursor:pointer;
        white-space:nowrap;flex-shrink:0;min-height:44px;
      ">Stay in</button>
    </div>`;
  document.body.appendChild(warningEl);

  let seconds = 30;
  const countdownEl = document.getElementById('ua-countdown');
  const interval = setInterval(() => {
    seconds--;
    if (countdownEl) countdownEl.textContent = seconds;
    if (seconds <= 0) clearInterval(interval);
  }, 1000);

  document.getElementById('ua-stay-btn').addEventListener('click', () => {
    clearInterval(interval);
    touch();
  });

  // Tap anywhere also resets
  warningEl.addEventListener('touchstart', () => { clearInterval(interval); touch(); }, { passive: true });
}

async function forceLogout() {
  clearTimeout(warningTimer);
  clearTimeout(logoutTimer);
  localStorage.removeItem(STORAGE_KEY);
  await supabase.auth.signOut();
  window.location.href = loginPath;
}

export async function enforceSession(path = '../auth/login.html') {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { window.location.href = path; return false; }
  const last = parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10);
  if (last > 0 && Date.now() - last >= TIMEOUT_MS) {
    await forceLogout();
    return false;
  }
  return true;
}
