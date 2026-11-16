/**
 * profile-prompt.js
 *
 * Shows a profile completion modal when a student's profile is missing
 * key information (phone, avatar). Skippable once per session.
 *
 * Usage: call checkProfileCompletion(supabase, user, profile) after auth.
 */

import { escHtml } from './ui.js';

const SKIP_KEY = 'ua_profile_skip';

export async function checkProfileCompletion(supabase, user, profile) {
  // Only for students
  if (profile.role !== 'student') return;

  // Re-fetch the latest profile so we don't rely on cached data
  const { data: fresh } = await supabase
    .from('profiles')
    .select('phone, avatar_url, bio')
    .eq('id', user.id)
    .single();

  const p = fresh ?? profile;

  // Complete = has a phone number (minimum requirement)
  const isComplete = !!p.phone;
  if (isComplete) return;

  // Don't show if already dismissed this session
  if (sessionStorage.getItem(SKIP_KEY)) return;

  showProfileModal(supabase, user, profile);
}

function showProfileModal(supabase, user, profile) {
  // Remove any existing instance
  document.getElementById('profile-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'profile-modal';

  const missingPhone  = !profile.phone;
  const missingAvatar = !profile.avatar_url;
  const firstName     = profile.full_name?.split(' ')[0] ?? 'there';

  modal.innerHTML = `
    <div id="pm-backdrop" style="
      position:fixed;inset:0;z-index:1000;
      background:rgba(8,18,15,.65);
      display:flex;align-items:flex-end;justify-content:center;
      padding:0 0 0 0;
    ">
      <div id="pm-panel" style="
        background:#fbf8f1;
        border-radius:20px 20px 0 0;
        padding:1.75rem 1.5rem calc(1.75rem + env(safe-area-inset-bottom, 0px));
        width:100%; max-width:520px;
        max-height:90dvh; overflow-y:auto;
        box-shadow:0 -8px 40px rgba(0,0,0,.2);
        animation: slideUp .3s ease;
      ">
        <style>
          @keyframes slideUp { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
          .pm-avatar-wrap { position:relative; width:80px; height:80px; margin:0 auto 1.25rem; cursor:pointer; }
          .pm-avatar-img  { width:80px; height:80px; border-radius:50%; object-fit:cover; border:3px solid var(--gold,#c6a35a); display:block; }
          .pm-avatar-placeholder {
            width:80px; height:80px; border-radius:50%;
            background:#0c241c; color:#c6a35a;
            font-size:1.8rem; font-family:Georgia,serif; font-weight:700;
            display:grid; place-items:center;
            border:3px solid rgba(198,163,90,.3);
          }
          .pm-avatar-edit {
            position:absolute; bottom:0; right:0;
            width:26px; height:26px; border-radius:50%;
            background:#c6a35a; color:#0c241c;
            display:grid; place-items:center;
            font-size:0.75rem; border:2px solid #fbf8f1;
          }
          .pm-field { margin-bottom:0.9rem; }
          .pm-field label { display:block; font-weight:600; font-size:0.88rem; margin-bottom:0.3rem; }
          .pm-field input, .pm-field textarea {
            width:100%; padding:0.7rem 0.9rem;
            border:1px solid rgba(16,24,20,.12); border-radius:8px;
            font:inherit; font-size:15px; background:#fff;
            transition:border-color .15s; box-sizing:border-box;
          }
          .pm-field input:focus, .pm-field textarea:focus { outline:none; border-color:#c6a35a; }
          .pm-actions { display:flex; gap:0.6rem; margin-top:1.1rem; }
          .pm-btn-primary {
            flex:1; padding:0.85rem; border:none; border-radius:10px;
            background:#c6a35a; color:#0c241c; font:inherit; font-weight:700;
            font-size:0.95rem; cursor:pointer; min-height:52px;
          }
          .pm-btn-skip {
            padding:0.85rem 1.1rem; border:1px solid rgba(16,24,20,.15);
            border-radius:10px; background:transparent; font:inherit;
            font-size:0.9rem; color:#5c675f; cursor:pointer; min-height:52px;
          }
          .pm-status { font-size:0.85rem; color:#c0392b; margin-top:0.5rem; min-height:1em; }
          .pm-success { color:#0e3320; }
          .pm-progress { display:flex; gap:0.4rem; margin-bottom:1.25rem; }
          .pm-dot { flex:1; height:4px; border-radius:2px; background:rgba(16,24,20,.1); }
          .pm-dot.done { background:#c6a35a; }
        </style>

        <!-- Progress dots -->
        <div class="pm-progress">
          <div class="pm-dot ${profile.avatar_url ? 'done' : ''}"></div>
          <div class="pm-dot ${profile.phone ? 'done' : ''}"></div>
          <div class="pm-dot ${profile.bio ? 'done' : ''}"></div>
        </div>

        <!-- Avatar -->
        <div class="pm-avatar-wrap" id="pm-avatar-wrap">
          ${profile.avatar_url
            ? `<img class="pm-avatar-img" id="pm-avatar-preview" src="${escHtml(profile.avatar_url)}" alt="Your photo" />`
            : `<div class="pm-avatar-placeholder" id="pm-avatar-preview">${escHtml(firstName[0].toUpperCase())}</div>`}
          <div class="pm-avatar-edit">✎</div>
          <input type="file" id="pm-avatar-input" accept="image/png,image/jpeg,image/webp"
            style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%" />
        </div>

        <h2 style="margin:0 0 0.3rem;font-size:1.35rem;text-align:center;font-family:'Cormorant Garamond',Georgia,serif">
          Complete your profile, ${escHtml(firstName)}
        </h2>
        <p style="color:#5c675f;font-size:0.88rem;text-align:center;margin:0 0 1.4rem;line-height:1.5">
          Help the team reach you faster. Add your phone number and a quick bio — we'll keep it private.
        </p>

        <div class="pm-field">
          <label for="pm-phone">📱 Phone number <span style="color:#c0392b">*</span></label>
          <input type="tel" id="pm-phone" placeholder="e.g. 0241234567"
            value="${escHtml(profile.phone ?? '')}" />
        </div>

        <div class="pm-field">
          <label for="pm-bio">📝 Short bio <span style="font-weight:400;color:#5c675f">(optional)</span></label>
          <textarea id="pm-bio" rows="2" placeholder="e.g. 300L Computer Science. Need help with final year project.">${escHtml(profile.bio ?? '')}</textarea>
        </div>

        <div class="pm-status" id="pm-status"></div>

        <div class="pm-actions">
          <button class="pm-btn-skip" id="pm-skip-btn">Later</button>
          <button class="pm-btn-primary" id="pm-save-btn">Save profile</button>
        </div>
      </div>
    </div>`;

  document.body.appendChild(modal);

  // Avatar preview on file select
  document.getElementById('pm-avatar-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wrap    = document.getElementById('pm-avatar-wrap');
      const preview = document.getElementById('pm-avatar-preview');
      if (preview.tagName === 'IMG') {
        preview.src = ev.target.result;
      } else {
        // Replace placeholder div with img
        const img = document.createElement('img');
        img.className = 'pm-avatar-img';
        img.id        = 'pm-avatar-preview';
        img.src       = ev.target.result;
        preview.replaceWith(img);
      }
    };
    reader.readAsDataURL(file);
  });

  // Skip
  document.getElementById('pm-skip-btn').addEventListener('click', () => {
    sessionStorage.setItem(SKIP_KEY, '1');
    modal.remove();
  });

  // Close on backdrop tap (outside panel)
  document.getElementById('pm-backdrop').addEventListener('click', (e) => {
    if (e.target === document.getElementById('pm-backdrop')) {
      sessionStorage.setItem(SKIP_KEY, '1');
      modal.remove();
    }
  });

  // Save
  document.getElementById('pm-save-btn').addEventListener('click', async () => {
    const phone   = document.getElementById('pm-phone').value.trim();
    const bio     = document.getElementById('pm-bio').value.trim();
    const fileInput = document.getElementById('pm-avatar-input');
    const statusEl = document.getElementById('pm-status');
    const saveBtn  = document.getElementById('pm-save-btn');

    if (!phone) {
      statusEl.textContent = 'Phone number is required.';
      return;
    }

    saveBtn.textContent = 'Saving…';
    saveBtn.disabled    = true;
    statusEl.textContent = '';

    try {
      let avatarUrl = profile.avatar_url ?? null;

      // Upload avatar if a new file was chosen — skip silently if storage not configured
      if (fileInput.files[0]) {
        try {
          const file = fileInput.files[0];
          const ext  = file.name.split('.').pop();
          const path = `${user.id}/avatar.${ext}`;

          const { error: upErr } = await supabase.storage
            .from('avatars')
            .upload(path, file, { upsert: true });

          if (!upErr) {
            const { data: { publicUrl } } = supabase.storage
              .from('avatars').getPublicUrl(path);
            avatarUrl = publicUrl + '?t=' + Date.now();
          }
        } catch (_) {
          // Avatar upload failed — continue without it
        }
      }

      // Only update columns that definitely exist
      const updateData = { phone, full_name: profile.full_name };
      if (bio) updateData.bio = bio;
      if (avatarUrl) updateData.avatar_url = avatarUrl;

      const { error: updateErr } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (updateErr) {
        console.error('Profile update error:', updateErr);
        throw updateErr;
      }

      statusEl.className = 'pm-status pm-success';
      statusEl.textContent = '✅ Profile updated!';

      // Update progress dots
      modal.querySelectorAll('.pm-dot').forEach((dot, i) => {
        if (i === 0 && avatarUrl) dot.classList.add('done');
        if (i === 1 && phone)     dot.classList.add('done');
        if (i === 2 && bio)       dot.classList.add('done');
      });

      setTimeout(() => modal.remove(), 1200);

    } catch (err) {
      statusEl.className = 'pm-status';
      statusEl.textContent = err.message || 'Could not save. Please try again.';
      console.error('Profile save error:', err);
      saveBtn.textContent = 'Save profile';
      saveBtn.disabled    = false;
    }
  });
}
