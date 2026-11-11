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

/* ── Build sidebar layout ──────────────────────────────────── */
/**
 * buildSidebar(opts)
 * opts.role         — 'student' | 'admin' | 'super_admin'
 * opts.profile      — { full_name, role }
 * opts.active       — active nav key
 * opts.basePath     — '../' for subfolders
 * opts.onSignout    — async function to call on sign out
 */
export function buildSidebar(opts = {}) {
  const { role = 'student', profile = {}, active = '', basePath = '', onSignout } = opts;
  const isSuperAdmin = role === 'super_admin';
  const isAdmin      = role === 'admin' || isSuperAdmin;
  const firstName    = (profile.full_name ?? '').split(' ')[0] ?? '?';
  const initials     = (profile.full_name ?? '?').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();

  const studentLinks = [
    { key: 'dashboard', href: `${basePath}dashboard/index.html`,       label: 'Dashboard',   icon: 'home' },
    { key: 'requests',  href: `${basePath}dashboard/index.html`,       label: 'My Requests', icon: 'file' },
    { key: 'new',       href: `${basePath}dashboard/new-request.html`, label: 'New Request', icon: 'plus-circle' },
  ];

  const adminLinks = [
    { key: 'queue',    href: `${basePath}admin/index.html`,    label: 'Queue',       icon: 'clipboard' },
    { key: 'my-work',  href: `${basePath}admin/my-work.html`,  label: 'My Work',     icon: 'monitor' },
    { key: 'history',  href: `${basePath}admin/history.html`,  label: 'History',     icon: 'clock' },
    { key: 'team',     href: `${basePath}admin/team.html`,     label: 'Team',        icon: 'users' },
  ];
  if (isSuperAdmin) {
    adminLinks.push({ key: 'super', href: `${basePath}admin/super.html`, label: 'Super Admin', icon: 'zap' });
  }

  const links = isAdmin ? adminLinks : studentLinks;
  const roleLabel = isSuperAdmin ? 'Super Admin' : isAdmin ? 'Staff' : 'Student';

  const svgMap = {
    home:        `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
    file:        `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>`,
    'plus-circle':`<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>`,
    clipboard:   `<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>`,
    monitor:     `<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>`,
    clock:       `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
    users:       `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
    zap:         `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
    logout:      `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>`,
  };

  function svg(key) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${svgMap[key] ?? ''}</svg>`;
  }

  // Set body class for admin green theme
  if (isAdmin) document.body.closest('body')?.classList.add('admin-layout');

  const sidebar = document.getElementById('app-sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <a class="sidebar-brand" href="${basePath}index.html">
      <img src="${basePath}img/umat.jpg" alt="UMAT" />
      <div>
        <span class="sidebar-brand-text">UniAssist</span>
        <span class="sidebar-brand-sub">${escHtml(roleLabel)}</span>
      </div>
    </a>

    <nav class="sidebar-nav">
      ${links.map(l => `
        <a href="${l.href}" class="${active === l.key ? 'active' : ''}">
          ${svg(l.icon)}
          <span class="nav-label">${escHtml(l.label)}</span>
        </a>`).join('')}
    </nav>

    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="sidebar-avatar">${escHtml(initials)}</div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">${escHtml(profile.full_name ?? '')}</div>
          <div class="sidebar-user-role">${escHtml(roleLabel)}</div>
        </div>
      </div>
      <button class="sidebar-signout" id="sidebar-signout-btn">
        ${svg('logout')} Sign out
      </button>
    </div>`;

  // Wire sign out
  document.getElementById('sidebar-signout-btn')?.addEventListener('click', async () => {
    if (onSignout) await onSignout();
  });

  // Wire mobile toggle
  document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
    document.body.classList.add('sidebar-open-app');
  });
  document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
    document.body.classList.remove('sidebar-open-app');
  });

  // Close sidebar when nav link clicked on mobile
  sidebar.querySelectorAll('.sidebar-nav a').forEach(a => {
    a.addEventListener('click', () => document.body.classList.remove('sidebar-open-app'));
  });
}
