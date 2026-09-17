<?php

function staff_layout_start(string $title, string $active, array $staff): void
{
  $GLOBALS['staff_active'] = $active;
  $nav = [
    'queue' => ['index.php', 'Queue'],
    'upcoming' => ['upcoming.php', 'Upcoming'],
    'history' => ['history.php', 'History'],
    'team' => ['team.php', 'Team'],
  ];
  ?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#0c241c" />
  <title><?= e($title) ?> — UniAssist staff</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../css/styles.css?v=3" />
  <link rel="stylesheet" href="../css/staff.css?v=3" />
</head>
<body class="staff-body has-sidebar">
  <div class="sidebar-backdrop" data-sidebar-close></div>
  <aside class="sidebar" id="site-sidebar">
    <a class="logo sidebar-brand" href="index.php"><span class="logo-mark">UA</span> Staff</a>
    <nav class="sidebar-nav">
      <?php foreach ($nav as $key => [$href, $label]): ?>
        <a href="<?= e($href) ?>" class="<?= $active === $key ? 'is-active' : '' ?>"><?= e($label) ?></a>
      <?php endforeach; ?>
    </nav>
    <p class="sidebar-foot">
      <?= e($staff['name']) ?><br>
      <a href="logout.php">Log out</a>
    </p>
  </aside>
  <header class="site-header">
    <div class="container header-inner">
      <button class="menu-toggle" type="button" aria-controls="site-sidebar" aria-expanded="false" aria-label="Open menu">
        <span></span><span></span><span></span>
      </button>
      <a class="logo" href="index.php"><span class="logo-mark">UA</span> Staff</a>
    </div>
  </header>
  <main class="staff-main container">
  <?php
}

function staff_layout_end(): void
{
  ?>
  </main>
  <script src="../js/main.js?v=3"></script>
</body>
</html>
  <?php
}

function status_badge(string $status): string
{
  return '<span class="badge badge-' . e($status) . '">' . e(booking_statuses()[$status] ?? $status) . '</span>';
}
