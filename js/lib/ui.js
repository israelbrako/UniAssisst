/**
 * ui.js — Shared UI helpers used across dashboard and admin pages
 */

import { supabase, getUser, getProfile } from './supabase.js';

/* ── Date / time helpers ───────────────────────────────────── */
export function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const day = Math.floor(h / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function fmtDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ── Status badge HTML ─────────────────────────────────────── */
export function badge(status) {
  const labels = {
    pending:     'Pending',
    assigned:    'Assigned',
    accepted:    'Accepted',
    in_progress: 'In Progress',
    review:      'Review',
    completed:   'Completed',
    declined:    'Declined',
  };
  return `<span class="badge badge-${status}">${labels[status] ?? status}</span>`;
}

/* ── Notification bell ─────────────────────────────────────── */
export class NotificationBell {
  constructor(container, userId) {
    this.userId    = userId;
    this.container = container;
    this.panel     = null;
    this.countEl   = null;
    this._render();
    this._load();
    this._subscribe();
  }

  _render() {
    this.container.innerHTML = `
      <div style="position:relative">
        <button class="notif-btn" aria-label="Notifications" id="notif-btn">
          <svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span class="notif-count" id="notif-count" hidden></span>
        </button>
        <div class="notif-panel" id="notif-panel">
          <div class="notif-panel-hd">
            Notifications
            <button id="notif-read-all">Mark all read</button>
          </div>
          <div id="notif-list"></div>
        </div>
      </div>`;

    this.countEl = document.getElementById('notif-count');
    this.panel   = document.getElementById('notif-panel');

    document.getElementById('notif-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.panel.classList.toggle('open');
    });
    document.addEventListener('click', () => this.panel.classList.remove('open'));
    document.getElementById('notif-read-all').addEventListener('click', () => this._markAllRead());
  }

  async _load() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })
      .limit(25);
    this._render_items(data ?? []);
  }

  _render_items(items) {
    const list    = document.getElementById('notif-list');
    const unread  = items.filter(n => !n.read).length;
    this.countEl.textContent = unread > 9 ? '9+' : unread;
    this.countEl.hidden = unread === 0;

    if (items.length === 0) {
      list.innerHTML = '<p class="notif-empty">Nothing here yet.</p>';
      return;
    }
    list.innerHTML = items.map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}" data-id="${n.id}" data-req="${n.request_id}">
        <p class="notif-body">${escHtml(n.body)}</p>
        <p class="notif-time">${timeAgo(n.created_at)}</p>
      </div>`).join('');

    list.querySelectorAll('.notif-item').forEach(el => {
      el.addEventListener('click', async () => {
        const reqId = el.dataset.req;
        const nId   = el.dataset.id;
        await supabase.from('notifications').update({ read: true }).eq('id', nId);
        if (reqId) window.location.href = `request.html?id=${reqId}`;
      });
    });
  }

  async _markAllRead() {
    await supabase.from('notifications').update({ read: true }).eq('user_id', this.userId).eq('read', false);
    this._load();
  }

  _subscribe() {
    supabase.channel('notif-' + this.userId)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${this.userId}`,
      }, () => this._load())
      .subscribe();
  }
}

/* ── Safe HTML escape ──────────────────────────────────────── */
export function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ── Build top navbar for app pages ────────────────────────── */
export function buildNavbar(opts = {}) {
  /*
   * opts.role       — 'student' | 'admin'
   * opts.name       — display name
   * opts.userId     — for notification bell
   * opts.active     — active link key
   * opts.basePath   — '../' if in a subdir, '' if at root
   */
  const { role = 'student', name = '', userId, active = '', basePath = '' } = opts;

  const studentLinks = [
    { key: 'home',       href: `${basePath}index.html`,                label: 'Home' },
    { key: 'dashboard',  href: `${basePath}dashboard/index.html`,      label: 'My Requests' },
    { key: 'new',        href: `${basePath}dashboard/new-request.html`, label: 'New Request' },
  ];
  const adminLinks = [
    { key: 'queue',    href: `${basePath}admin/index.html`,    label: 'Queue' },
    { key: 'my-work',  href: `${basePath}admin/my-work.html`,  label: 'My Work' },
    { key: 'history',  href: `${basePath}admin/history.html`,  label: 'History' },
    { key: 'team',     href: `${basePath}admin/team.html`,     label: 'Team' },
  ];

  // Super admins get an extra link
  const isSuperAdmin = opts.role === 'super_admin' ||
    (typeof opts.isSuperAdmin !== 'undefined' && opts.isSuperAdmin);
  if (isSuperAdmin) {
    adminLinks.push({ key: 'super', href: `${basePath}admin/super.html`, label: '⚡ Super Admin' });
  }

  const links = role === 'admin' ? adminLinks : studentLinks;

  const header = document.querySelector('.site-header');
  if (!header) return;

  const topNav = header.querySelector('.top-nav');
  if (topNav) {
    topNav.innerHTML = links.map(l => `
      <li><a href="${l.href}" class="${active === l.key ? 'is-active' : ''}">${escHtml(l.label)}</a></li>
    `).join('') + `
      <li id="notif-bell-container"></li>
      <li><button class="signout-btn" id="signout-btn">Sign out</button></li>
    `;
  }

  const drawer = document.querySelector('.nav-drawer');
  if (drawer) {
    drawer.innerHTML = links.map(l => `
      <a href="${l.href}" class="${active === l.key ? 'is-active' : ''}">${escHtml(l.label)}</a>
    `).join('') + `
      <div class="drawer-foot">
        ${escHtml(name)} · <a href="#" id="signout-drawer">Sign out</a>
      </div>`;
    document.getElementById('signout-drawer')?.addEventListener('click', (e) => {
      e.preventDefault(); signOut(basePath);
    });
  }

  document.getElementById('signout-btn')?.addEventListener('click', () => signOut(basePath));

  // Mount notification bell
  const bellContainer = document.getElementById('notif-bell-container');
  if (bellContainer && userId) {
    new NotificationBell(bellContainer, userId);
  }
}

async function signOut(basePath) {
  await supabase.auth.signOut();
  window.location.href = `${basePath}auth/login.html`;
}
