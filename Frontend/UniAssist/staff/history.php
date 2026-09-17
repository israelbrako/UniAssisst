<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
$staff = require_staff();
$q = trim((string) ($_GET['q'] ?? ''));
$email = trim((string) ($_GET['email'] ?? ''));
$students = [];
$timeline = [];
if ($email !== '') {
  $stmt = db()->prepare('SELECT b.*, s.name AS assignee FROM bookings b LEFT JOIN staff s ON s.id = b.assigned_to WHERE b.email = ? ORDER BY b.created_at DESC');
  $stmt->execute([$email]);
  $timeline = $stmt->fetchAll();
} else {
  $sql = 'SELECT email, MAX(student_name) AS student_name, MAX(class_name) AS class_name, MAX(hostel) AS hostel, COUNT(*) AS visits, MAX(created_at) AS last_seen FROM bookings';
  if ($q !== '') {
    $stmt = db()->prepare($sql . ' WHERE student_name LIKE ? OR email LIKE ? OR class_name LIKE ? OR hostel LIKE ? GROUP BY email ORDER BY last_seen DESC LIMIT 50');
    $like = '%' . $q . '%';
    $stmt->execute([$like, $like, $like, $like]);
    $students = $stmt->fetchAll();
  } else {
    $students = db()->query($sql . ' GROUP BY email ORDER BY last_seen DESC LIMIT 40')->fetchAll();
  }
}
staff_layout_start('History', 'history', $staff);
?>
<div class="staff-hero"><div><h1>Student history</h1><p>Repeat visitors, class, hostel, and every request in one place.</p></div></div>
<form method="get" class="panel">
  <label><span>Search name, email, class, or hostel</span><input type="search" name="q" value="<?= e($q) ?>" /></label>
  <div style="margin-top:.8rem"><button class="btn btn-primary" type="submit">Search</button></div>
</form>
<?php if ($email !== ''): ?>
<section class="panel">
  <h2><?= $timeline ? e($timeline[0]['student_name']) : e($email) ?></h2>
  <?php if (!$timeline): ?><p class="empty">No requests for this email.</p>
  <?php else: ?>
  <table class="staff-table">
    <thead><tr><th>Date</th><th>Service</th><th>Handler</th><th>Status</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($timeline as $row): ?>
      <tr>
        <td><?= e(date('j M Y', strtotime($row['created_at']))) ?></td>
        <td><?= e($row['service']) ?></td>
        <td><?= e($row['assignee'] ?: '—') ?></td>
        <td><?= status_badge($row['status']) ?></td>
        <td><a href="request.php?id=<?= (int) $row['id'] ?>">Open →</a></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
  <?php endif; ?>
</section>
<?php else: ?>
<section class="panel">
  <h2><?= $q !== '' ? 'Matches' : 'Recent students' ?></h2>
  <?php if (!$students): ?><p class="empty">No students yet. History appears after the first booking.</p>
  <?php else: ?>
  <table class="staff-table">
    <thead><tr><th>Student</th><th>Class / hostel</th><th>Visits</th><th>Last request</th></tr></thead>
    <tbody>
    <?php foreach ($students as $row): ?>
      <tr>
        <td><strong><?= e($row['student_name']) ?></strong><br><a href="history.php?email=<?= e(urlencode($row['email'])) ?>"><?= e($row['email']) ?></a></td>
        <td><?= e($row['class_name']) ?><br><?= e($row['hostel']) ?></td>
        <td><?= (int) $row['visits'] ?></td>
        <td><?= e(date('j M Y', strtotime($row['last_seen']))) ?></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
  <?php endif; ?>
</section>
<?php endif; ?>
<?php staff_layout_end();
