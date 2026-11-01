<?php

function staff_layout_start(string $title, string $active, array $staff): void
{
  $GLOBALS['staff_active'] = $active;
  $nav = [
    'queue'    => ['index.php',    'Queue'],
    'upcoming' => ['upcoming.php', 'Upcoming'],
    'history'  => ['history.php',  'History'],
    'team'     => ['team.php',     'Team'],
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
  <link rel="stylesheet" href="../css/styles.css?v=5" />
  <link rel="stylesheet" href="../css/staff.css?v=5" />
</head>
<body class="staff-body">
  <!-- ── Staff top navigation ─────────────────────────────── -->
  <header class="site-header">
    <div class="container header-inner">
      <a class="logo" href="index.php">
        <img class="logo-img" src="../img/umat.jpg" alt="UMAT logo" />
        Staff
      </a>
      <!-- Desktop nav -->
      <ul class="top-nav" role="list">
        <?php foreach ($nav as $key => [$href, $label]): ?>
          <li><a href="<?= e($href) ?>" class="<?= $active === $key ? 'is-active' : '' ?>"><?= e($label) ?></a></li>
        <?php endforeach; ?>
        <li><span class="staff-header-who"><?= e($staff['name']) ?></span></li>
        <li><a href="logout.php" class="staff-header-logout">Log out</a></li>
      </ul>
      <!-- Hamburger (mobile) -->
      <button class="menu-toggle" type="button" aria-controls="nav-drawer" aria-expanded="false" aria-label="Open menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>

  <!-- Mobile nav drawer -->
  <nav class="nav-drawer" id="nav-drawer" aria-label="Staff navigation">
    <?php foreach ($nav as $key => [$href, $label]): ?>
      <a href="<?= e($href) ?>" class="<?= $active === $key ? 'is-active' : '' ?>"><?= e($label) ?></a>
    <?php endforeach; ?>
    <div class="drawer-foot">
      <?= e($staff['name']) ?> · <a href="logout.php">Log out</a>
    </div>
  </nav>

  <main class="staff-main container">
  <?php
}

function staff_layout_end(): void
{
  ?>
  </main>
  <script src="../js/main.js?v=5"></script>
</body>
</html>
  <?php
}

function status_badge(string $status): string
{
  return '<span class="badge badge-' . e($status) . '">' . e(booking_statuses()[$status] ?? $status) . '</span>';
}
