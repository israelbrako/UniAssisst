<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
$staff = require_staff();
$id = (int) ($_GET['id'] ?? 0);
$stmt = db()->prepare('SELECT b.*, s.name AS assignee FROM bookings b LEFT JOIN staff s ON s.id = b.assigned_to WHERE b.id = ?');
$stmt->execute([$id]);
$booking = $stmt->fetch();
if (!$booking) { http_response_code(404); exit('Request not found.'); }
$team = db()->query('SELECT id, name FROM staff ORDER BY name')->fetchAll();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  csrf_check();
  $assigned = $_POST['assigned_to'] === '' ? null : (int) $_POST['assigned_to'];
  $status = (string) ($_POST['status'] ?? 'new');
  $sessionAt = trim((string) ($_POST['session_at'] ?? ''));
  $notes = trim((string) ($_POST['staff_notes'] ?? ''));
  if (array_key_exists($status, booking_statuses())) {
    $sessionSql = $sessionAt === '' ? null : date('Y-m-d H:i:s', strtotime($sessionAt));
    if ($status === 'new' && $assigned) $status = 'assigned';
    if ($status !== 'cancelled' && $status !== 'done' && $sessionSql) $status = 'scheduled';
    db()->prepare('UPDATE bookings SET assigned_to = ?, status = ?, session_at = ?, staff_notes = ? WHERE id = ?')
      ->execute([$assigned, $status, $sessionSql, $notes === '' ? null : $notes, $id]);
    header('Location: request.php?id=' . $id . '&saved=1');
    exit;
  }
}
if (isset($_GET['saved'])) { $stmt->execute([$id]); $booking = $stmt->fetch(); }
$past = db()->prepare('SELECT id, service, status, created_at FROM bookings WHERE email = ? AND id <> ? ORDER BY created_at DESC');
$past->execute([$booking['email'], $id]);
$pastRows = $past->fetchAll();
staff_layout_start('Request #' . $id, 'queue', $staff);
?>
<div class="staff-hero">
  <div>
    <p class="eyebrow">Request #<?= (int) $booking['id'] ?></p>
    <h1><?= e($booking['student_name']) ?></h1>
    <p><?= e($booking['service']) ?> · <?= status_badge($booking['status']) ?></p>
  </div>
  <a class="btn btn-ghost dark" href="index.php">← Queue</a>
</div>
<?php if (isset($_GET['saved'])): ?><p class="stat-card" style="margin-bottom:1rem">Saved.</p><?php endif; ?>
<div class="detail-grid">
  <section class="panel">
    <h2>Student</h2>
    <dl>
      <div class="kv"><dt>Email</dt><dd><a href="history.php?email=<?= e(urlencode($booking['email'])) ?>"><?= e($booking['email']) ?></a></dd></div>
      <div class="kv"><dt>Class</dt><dd><?= e($booking['class_name']) ?></dd></div>
      <div class="kv"><dt>Hostel</dt><dd><?= e($booking['hostel']) ?></dd></div>
      <div class="kv"><dt>Message</dt><dd class="note-box"><?= e($booking['message']) ?></dd></div>
    </dl>
    <?php if ($pastRows): ?>
      <h2>Earlier requests</h2>
      <ul><?php foreach ($pastRows as $item): ?>
        <li><a href="request.php?id=<?= (int) $item['id'] ?>"><?= e($item['service']) ?></a> · <?= e($item['status']) ?> · <?= e(date('j M Y', strtotime($item['created_at']))) ?></li>
      <?php endforeach; ?></ul>
    <?php endif; ?>
  </section>
  <section class="panel">
    <h2>Assign &amp; schedule</h2>
    <form method="post" class="modal-form">
      <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>" />
      <label><span>Who is handling this</span>
        <select name="assigned_to">
          <option value="">Unassigned</option>
          <?php foreach ($team as $member): ?>
            <option value="<?= (int) $member['id'] ?>" <?= (int) $booking['assigned_to'] === (int) $member['id'] ? 'selected' : '' ?>><?= e($member['name']) ?></option>
          <?php endforeach; ?>
        </select>
      </label>
      <label><span>Weekend / session time</span>
        <input type="datetime-local" name="session_at" value="<?= $booking['session_at'] ? e(date('Y-m-d\TH:i', strtotime($booking['session_at']))) : '' ?>" />
      </label>
      <label><span>Status</span>
        <select name="status">
          <?php foreach (booking_statuses() as $key => $label): ?>
            <option value="<?= e($key) ?>" <?= $booking['status'] === $key ? 'selected' : '' ?>><?= e($label) ?></option>
          <?php endforeach; ?>
        </select>
      </label>
      <label><span>Internal notes</span>
        <textarea name="staff_notes" rows="5"><?= e($booking['staff_notes'] ?? '') ?></textarea>
      </label>
      <button type="submit" class="btn btn-primary">Save</button>
    </form>
  </section>
</div>
<?php staff_layout_end();
