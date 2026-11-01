<?php
require_once __DIR__ . '/../includes/auth.php';
start_staff_session();
if (current_staff()) { header('Location: index.php'); exit; }
$error = '';
try { ensure_database(); } catch (Throwable $e) { $error = 'Cannot create the local data file.'; }
if (!$error && staff_count() === 0) { header('Location: setup.php'); exit; }
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$error) {
  csrf_check();
  $email = trim((string) ($_POST['email'] ?? ''));
  $password = (string) ($_POST['password'] ?? '');
  $stmt = db()->prepare('SELECT id, password_hash FROM staff WHERE email = ?');
  $stmt->execute([$email]);
  $row = $stmt->fetch();
  if ($row && password_verify($password, $row['password_hash'])) {
    session_regenerate_id(true);
    $_SESSION['staff_id'] = (int) $row['id'];
    header('Location: index.php');
    exit;
  }
  $error = 'Email or password is wrong.';
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#0c241c" />
  <title>Staff login — UniAssist</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../css/styles.css" />
  <link rel="stylesheet" href="../css/staff.css" />
</head>
<body class="auth-wrap">
  <div class="auth-card">
    <p class="eyebrow">ASCES · Staff only</p>
    <h1>Staff desk</h1>
    <p class="lead">Queue, history, and weekend sessions — without the WhatsApp scramble.</p>
    <?php if ($error): ?><p class="auth-error"><?= e($error) ?></p><?php endif; ?>
    <form method="post" class="modal-form">
      <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>" />
      <label><span>Email</span><input type="email" name="email" required /></label>
      <label><span>Password</span><input type="password" name="password" required /></label>
      <button type="submit" class="btn btn-primary">Log in</button>
    </form>
    <p class="section-sub" style="margin-top:1rem"><a href="../index.html">← Back to the site</a></p>
  </div>
</body>
</html>
