<?php
require_once __DIR__ . '/../includes/auth.php';
start_staff_session();
try { ensure_database(); } catch (Throwable $e) { $fatal = 'Cannot create the local data file.'; }
if (empty($fatal) && staff_count() > 0) { header('Location: login.php'); exit; }
$error = $fatal ?? '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && empty($fatal)) {
  csrf_check();
  $name = trim((string) ($_POST['name'] ?? ''));
  $email = trim((string) ($_POST['email'] ?? ''));
  $password = (string) ($_POST['password'] ?? '');
  if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8) {
    $error = 'Use your name, a real email, and a password of at least 8 characters.';
  } else {
    db()->prepare('INSERT INTO staff (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
      ->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT), 'admin']);
    session_regenerate_id(true);
    $_SESSION['staff_id'] = (int) db()->lastInsertId();
    header('Location: index.php');
    exit;
  }
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>Create staff desk — UniAssist</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../css/styles.css" />
  <link rel="stylesheet" href="../css/staff.css" />
</head>
<body class="auth-wrap">
  <div class="auth-card">
    <p class="eyebrow">First-time setup</p>
    <h1>Create the first admin</h1>
    <p class="lead">This is only shown once. After this, add the rest of the guys from Team.</p>
    <?php if ($error): ?><p class="auth-error"><?= e($error) ?></p><?php endif; ?>
    <?php if (empty($fatal)): ?>
    <form method="post" class="modal-form">
      <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>" />
      <label><span>Your name</span><input type="text" name="name" required /></label>
      <label><span>Email</span><input type="email" name="email" required /></label>
      <label><span>Password</span><input type="password" name="password" minlength="8" required /></label>
      <button type="submit" class="btn btn-primary">Create staff desk</button>
    </form>
    <?php endif; ?>
  </div>
</body>
</html>
