<?php
require_once __DIR__ . '/includes/helpers.php';
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Use POST.']);
  exit;
}
$name = trim((string) ($_POST['name'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$class = trim((string) ($_POST['class'] ?? ''));
$hostel = trim((string) ($_POST['hostel'] ?? ''));
$service = trim((string) ($_POST['service'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));
$allowed = ['Assignments', 'Projects', 'One-on-One Tutorials', 'Group Tutorials'];
if ($name === '' || $email === '' || $class === '' || $hostel === '' || $message === '') {
  http_response_code(422);
  echo json_encode(['ok' => false, 'error' => 'Please fill all required fields, including class and hostel.']);
  exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422);
  echo json_encode(['ok' => false, 'error' => 'Enter a valid email.']);
  exit;
}
if (!in_array($service, $allowed, true)) $service = 'Assignments';
try {
  ensure_database();
  db()->prepare('INSERT INTO bookings (student_name, email, class_name, hostel, service, message) VALUES (?, ?, ?, ?, ?, ?)')
    ->execute([$name, $email, $class, $hostel, $service, $message]);
  echo json_encode(['ok' => true]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Could not save the request. Try again shortly.']);
}
