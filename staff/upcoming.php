<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
$staff = require_staff();
$now = new DateTimeImmutable('now');
$n = (int) $now->format('N');
$start = $n === 6 ? $now->setTime(0,0,0) : ($n === 7 ? $now->modify('-1 day')->setTime(0,0,0) : $now->modify('next Saturday')->setTime(0,0,0));
$end = $start->modify('+1 day')->setTime(23,59,59);
$q = "SELECT b.*, s.name AS assignee FROM bookings b LEFT JOIN staff s ON s.id = b.assigned_to WHERE b.status = 'scheduled'";
$weekend = db()->prepare($q . ' AND b.session_at BETWEEN ? AND ? ORDER BY b.session_at');
$weekend->execute([$start->format('Y-m-d H:i:s'), $end->format('Y-m-d H:i:s')]);
$later = db()->prepare($q . ' AND b.session_at > ? ORDER BY b.session_at');
$later->execute([$end->format('Y-m-d H:i:s')]);
$mine = db()->prepare($q . " AND b.assigned_to = ? AND b.session_at >= datetime('now','localtime') ORDER BY b.session_at");
$mine->execute([$staff['id']]);
function render_session_table(array $rows): void {
  if (!$rows) { echo '<p class="empty">None scheduled.</p>'; return; }
  echo '<table class="staff-table"><thead><tr><th>When</th><th>Student</th><th>Need</th><th>Handler</th><th></th></tr></thead><tbody>';
  foreach ($rows as $row) {
    echo '<tr><td>' . e(date('D j M, H:i', strtotime($row['session_at']))) . '</td>';
    echo '<td><strong>' . e($row['student_name']) . '</strong><br>' . e($row['hostel']) . ' · ' . e($row['class_name']) . '</td>';
    echo '<td>' . e($row['service']) . '</td><td>' . e($row['assignee'] ?: '—') . '</td>';
    echo '<td><a href="request.php?id=' . (int) $row['id'] . '">Open →</a></td></tr>';
  }
  echo '</tbody></table>';
}
staff_layout_start('Upcoming', 'upcoming', $staff);
?>
<div class="staff-hero"><div><h1>Upcoming sessions</h1><p>The weekend board. Work from here instead of WhatsApp.</p></div></div>
<section class="panel"><h2>Mine</h2><?php render_session_table($mine->fetchAll()); ?></section>
<section class="panel"><h2>This weekend · <?= e($start->format('j M')) ?>–<?= e($end->format('j M')) ?></h2><?php render_session_table($weekend->fetchAll()); ?></section>
<section class="panel"><h2>After this weekend</h2><?php render_session_table($later->fetchAll()); ?></section>
<?php staff_layout_end();
