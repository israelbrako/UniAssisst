<?php
require_once __DIR__ . '/helpers.php';

function start_staff_session(): void
{
  if (session_status() !== PHP_SESSION_ACTIVE) {
    session_name('uniassist_staff');
    session_start();
  }
}

function current_staff(): ?array
{
  start_staff_session();
  if (empty($_SESSION['staff_id'])) return null;
  $stmt = db()->prepare('SELECT id, name, email, role FROM staff WHERE id = ?');
  $stmt->execute([(int) $_SESSION['staff_id']]);
  return $stmt->fetch() ?: null;
}

function require_staff(): array
{
  try { ensure_database(); } catch (Throwable $e) {
    header('Location: login.php');
    exit;
  }
  $staff = current_staff();
  if (!$staff) { header('Location: login.php'); exit; }
  return $staff;
}

function require_admin(array $staff): void
{
  if (($staff['role'] ?? '') !== 'admin') {
    http_response_code(403);
    exit('Only an admin can manage the team.');
  }
}

function csrf_token(): string
{
  start_staff_session();
  if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16));
  return $_SESSION['csrf'];
}

function csrf_check(): void
{
  start_staff_session();
  if (!hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf'] ?? '')) {
    http_response_code(400);
    exit('Invalid session token.');
  }
}

function staff_count(): int
{
  return (int) db()->query('SELECT COUNT(*) FROM staff')->fetchColumn();
}
