<?php

function db(): PDO
{
  static $pdo;
  if ($pdo instanceof PDO) return $pdo;
  $dir = dirname(__DIR__) . '/data';
  if (!is_dir($dir)) mkdir($dir, 0775, true);
  $pdo = new PDO('sqlite:' . $dir . '/uniassist.sqlite', null, null, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
  $pdo->exec('PRAGMA foreign_keys = ON');
  return $pdo;
}

function ensure_database(): void
{
  $pdo = db();
  $pdo->exec("CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )");
  $pdo->exec("CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_name TEXT NOT NULL,
    email TEXT NOT NULL,
    class_name TEXT NOT NULL,
    hostel TEXT NOT NULL,
    service TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    assigned_to INTEGER NULL,
    session_at TEXT NULL,
    staff_notes TEXT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES staff(id) ON DELETE SET NULL
  )");
}

function e(?string $value): string
{
  return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function booking_statuses(): array
{
  return ['new' => 'New', 'assigned' => 'Assigned', 'scheduled' => 'Scheduled', 'done' => 'Done', 'cancelled' => 'Cancelled'];
}
