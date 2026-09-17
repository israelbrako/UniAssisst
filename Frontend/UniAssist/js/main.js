document.addEventListener('DOMContentLoaded', function () {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const modal = document.getElementById('contact-modal');
  const form = document.getElementById('contact-form');
  const openBtns = ['open-contact', 'open-contact-hero', 'open-contact-cta']
    .map((id) => document.getElementById(id));

  function setModal(open) {
    if (!modal) return;
    modal.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      const first = modal.querySelector('input,select,textarea,button');
      if (first) first.focus();
    }
  }

  openBtns.forEach((b) => { if (b) b.addEventListener('click', (e) => { e.preventDefault(); setModal(true); }); });
  if (modal) modal.querySelectorAll('[data-modal-close]').forEach((c) => c.addEventListener('click', () => setModal(false)));
  const sidebar = document.getElementById('site-sidebar');
  const menuBtn = document.querySelector('.menu-toggle');
  function setSidebar(open) {
    document.body.classList.toggle('sidebar-open', open);
    if (menuBtn) menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (menuBtn) menuBtn.addEventListener('click', () => setSidebar(!document.body.classList.contains('sidebar-open')));
  document.querySelectorAll('[data-sidebar-close]').forEach((el) => el.addEventListener('click', () => setSidebar(false)));
  if (sidebar) {
    sidebar.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('click', () => {
        if (window.matchMedia('(max-width: 899px)').matches) setSidebar(false);
      });
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setSidebar(false);
      setModal(false);
    }
  });
  if (new URLSearchParams(location.search).get('book') === '1') setModal(true);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const statusEl = form.querySelector('.form-status');
      const required = ['name', 'email', 'class', 'hostel', 'message'];
      if (required.some((k) => !String(data.get(k) || '').trim())) {
        if (statusEl) statusEl.textContent = 'Please fill all required fields, including class and hostel.';
        return;
      }
      if (statusEl) statusEl.textContent = 'Sending…';
      fetch(form.getAttribute('action') || 'book.php', { method: 'POST', body: data })
        .then((res) => res.json().then((json) => ({ ok: res.ok, json })))
        .then(({ ok, json }) => {
          if (!ok || !json.ok) {
            if (statusEl) statusEl.textContent = json.error || 'Could not send. Please try again.';
            return;
          }
          if (statusEl) statusEl.textContent = 'Received — the ASCES team will pick this up from the staff desk.';
          form.reset();
          setTimeout(() => setModal(false), 1400);
        })
        .catch(() => {
          if (statusEl) statusEl.textContent = 'Could not send. Check your connection and try again.';
        });
    });
  }
});
