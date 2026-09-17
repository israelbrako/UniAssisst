<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
$staff = require_staff();
$isAdmin = ($staff['role'] ?? '') === 'admin';
$error = ''; $ok = false;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  require_admin($staff);
  csrf_check();
  $name = trim((string) ($_POST['name'] ?? ''));
  $email = trim((string) ($_POST['email'] ?? ''));
  $password = (string) ($_POST['password'] ?? '');
  $role = $_POST['role'] === 'admin' ? 'admin' : 'member';
  if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8) {
    $error = 'Name, a valid email, and a password of at least 8 characters are required.';
  } else {
    try {
      db()->prepare('INSERT INTO staff (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
        ->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT), $role]);
      $ok = true;
    } catch (PDOException $e) { $error = 'That email is already on the team.'; }
  }
}
$team = db()->query('SELECT id, name, email, role FROM staff ORDER BY name')->fetchAll();
staff_layout_start('Team', 'team', $staff);
?>
<div class="staff-hero"><div><h1>The guys</h1><p>Add the rest of the ASCES team so you can assign work by name.</p></div></div>
<?php if ($ok): ?><p class="stat-card" style="margin-bottom:1rem">Teammate added.</p><?php endif; ?>
<?php if ($error): ?><p class="auth-error"><?= e($error) ?></p><?php endif; ?>
<div class="detail-grid">
  <section class="panel">
    <h2>Team</h2>
    <table class="staff-table">
      <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
      <tbody>
      <?php foreach ($team as $member): ?>
        <tr><td><?= e($member['name']) ?></td><td><?= e($member['email']) ?></td><td><?= e($member['role']) ?></td></tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </section>
  <section class="panel">
    <h2>Add someone</h2>
    <?php if (!$isAdmin): ?><p class="empty">Ask an admin to add new staff logins.</p>
    <?php else: ?>
    <form method="post" class="modal-form">
      <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>" />
      <label><span>Name</span><input type="text" name="name" required /></label>
      <label><span>Email</span><input type="email" name="email" required /></label>
      <label><span>Password</span><input type="password" name="password" minlength="8" required /></label>
      <label><span>Role</span><select name="role"><option value="member">Member</option><option value="admin">Admin</option></select></label>
      <button type="submit" class="btn btn-primary">Add to team</button>
    </form>
    <?php endif; ?>
  </section>
</div>
<?php staff_layout_end();
