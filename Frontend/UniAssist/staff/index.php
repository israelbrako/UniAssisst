<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
$staff = require_staff();
$pdo = db();
$counts = [
  'new' => (int) $pdo->query("SELECT COUNT(*) FROM bookings WHERE status = 'new'")->fetchColumn(),
  'assigned' => (int) $pdo->query("SELECT COUNT(*) FROM bookings WHERE status = 'assigned'")->fetchColumn(),
];
$now = new DateTimeImmutable('now');
$n = (int) $now->format('N');
$start = $n === 6 ? $now->setTime(0,0,0) : ($n === 7 ? $now->modify('-1 day')->setTime(0,0,0) : $now->modify('next Saturday')->setTime(0,0,0));
$end = $start->modify('+1 day')->setTime(23,59,59);
$wk = $pdo->prepare("SELECT COUNT(*) FROM bookings WHERE status = 'scheduled' AND session_at BETWEEN ? AND ?");
$wk->execute([$start->format('Y-m-d H:i:s'), $end->format('Y-m-d H:i:s')]);
$weekend = (int) $wk->fetchColumn();
$queue = $pdo->query("SELECT b.*, s.name AS assignee FROM bookings b LEFT JOIN staff s ON s.id = b.assigned_to
  WHERE b.status IN ('new','assigned') OR (b.status = 'scheduled' AND b.session_at < datetime('now','localtime'))
  ORDER BY CASE b.status WHEN 'new' THEN 1 WHEN 'assigned' THEN 2 ELSE 3 END, b.created_at ASC")->fetchAll();
staff_layout_start('Queue', 'queue', $staff);
?>
<div class="staff-hero">
  <div>
    <h1>Request queue</h1>
    <p>New bookings land here. Assign someone and set a weekend slot.</p>
  </div>
  <a class="btn btn-primary" href="upcoming.php">This weekend</a>
</div>
<div class="stat-cards">
  <div class="stat-card"><b><?= $counts['new'] ?></b><span>Unassigned</span></div>
  <div class="stat-card"><b><?= $counts['assigned'] ?></b><span>Assigned, not dated</span></div>
  <div class="stat-card"><b><?= $weekend ?></b><span>This weekend</span></div>
  <div class="stat-card"><b><?= $counts['new'] + $counts['assigned'] ?></b><span>Still open</span></div>
</div>
<section class="panel">
  <h2>Needs action</h2>
  <?php if (!$queue): ?>
    <p class="empty">Nothing waiting. When a student books from the site, it shows up here.</p>
  <?php else: ?>
    <table class="staff-table">
      <thead><tr><th>When</th><th>Student</th><th>Need</th><th>Who</th><th>Status</th><th></th></tr></thead>
      <tbody>
      <?php foreach ($queue as $row): ?>
        <tr>
          <td><?= e(date('d M, H:i', strtotime($row['created_at']))) ?></td>
          <td><strong><?= e($row['student_name']) ?></strong><br><a href="history.php?email=<?= e(urlencode($row['email'])) ?>"><?= e($row['email']) ?></a><br><?= e($row['class_name']) ?> · <?= e($row['hostel']) ?></td>
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
<?php staff_layout_end();
