-- ============================================
-- GymEase - Complete Database Schema + Sample Data
-- Run this ONCE before starting the server
-- ============================================

-- ============================================
-- DROP TABLES (OPTIONAL FOR RESET)
-- ============================================

DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS trainers CASCADE;
DROP TABLE IF EXISTS members CASCADE;

-- ============================================
-- 1. MEMBERS
-- ============================================

CREATE TABLE IF NOT EXISTS members (
  member_id         SERIAL PRIMARY KEY,
  fullname          VARCHAR(100) NOT NULL,
  email             VARCHAR(100) UNIQUE NOT NULL,
  password_hash     TEXT NOT NULL,
  phone             VARCHAR(20),
  plan_type         VARCHAR(50),
  membership_expiry DATE,
  payment_status    VARCHAR(20) DEFAULT 'unpaid',
  created_at        TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. TRAINERS
-- ============================================

CREATE TABLE IF NOT EXISTS trainers (
  trainer_id      SERIAL PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  specialization  VARCHAR(100),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 3. CLASSES
-- ============================================

CREATE TABLE IF NOT EXISTS classes (
  class_id    SERIAL PRIMARY KEY,
  class_name  VARCHAR(100) NOT NULL,
  trainer_id  INT REFERENCES trainers(trainer_id) ON DELETE SET NULL,
  schedule    TIMESTAMP NOT NULL,
  capacity    INT NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 4. BOOKINGS
-- ============================================

CREATE TABLE IF NOT EXISTS bookings (
  booking_id  SERIAL PRIMARY KEY,
  member_id   INT NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
  class_id    INT NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
  status      VARCHAR(20) NOT NULL DEFAULT 'confirmed'
               CHECK (status IN ('confirmed', 'cancelled')),
  booked_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 5. ATTENDANCE
-- ============================================

CREATE TABLE IF NOT EXISTS attendance (
  attendance_id  SERIAL PRIMARY KEY,
  booking_id     INT NOT NULL UNIQUE REFERENCES bookings(booking_id) ON DELETE CASCADE,
  attended_at    TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- ============================================
-- INSERT TRAINERS
-- ============================================

INSERT INTO trainers (name, specialization)
VALUES
('John Carter', 'Strength Training'),
('Sarah Lee', 'Yoga'),
('Michael Brown', 'Cardio Fitness');

-- ============================================
-- INSERT CLASSES
-- ============================================

INSERT INTO classes (class_name, trainer_id, schedule, capacity)
VALUES
('Morning Yoga', 2, '2026-05-20 08:00:00', 20),
('Weightlifting Basics', 1, '2026-05-20 10:00:00', 15),
('Cardio Blast', 3, '2026-05-21 09:00:00', 25);

-- ============================================
-- INSERT MEMBERS
-- ============================================

INSERT INTO members (
  fullname,
  email,
  password_hash,
  phone,
  plan_type,
  membership_expiry,
  payment_status
)
VALUES
(
  'Alice Johnson',
  'alice@example.com',
  '$2b$10$samplehashedpassword1',
  '08123456789',
  'Premium',
  '2026-12-31',
  'paid'
),
(
  'Michael Smith',
  'michael@example.com',
  '$2b$10$samplehashedpassword2',
  '08987654321',
  'Basic',
  '2026-10-15',
  'paid'
),
(
  'Emma Wilson',
  'emma@example.com',
  '$2b$10$samplehashedpassword3',
  '082112223333',
  'Premium',
  '2027-01-01',
  'unpaid'
);

-- ============================================
-- INSERT BOOKINGS
-- ============================================

INSERT INTO bookings (
  member_id,
  class_id,
  status
)
VALUES
(1, 1, 'confirmed'),
(2, 2, 'confirmed'),
(3, 3, 'confirmed');

-- ============================================
-- INSERT ATTENDANCE
-- ============================================

INSERT INTO attendance (
  booking_id
)
VALUES
(1),
(2);

-- ============================================
-- SAMPLE QUERIES
-- ============================================

-- View all members
SELECT * FROM members;

-- View all trainers
SELECT * FROM trainers;

-- View all classes with trainer names
SELECT
  c.class_id,
  c.class_name,
  t.name AS trainer_name,
  c.schedule,
  c.capacity
FROM classes c
LEFT JOIN trainers t
ON c.trainer_id = t.trainer_id;

-- View bookings with member and class information
SELECT
  b.booking_id,
  m.fullname AS member_name,
  c.class_name,
  b.status,
  b.booked_at
FROM bookings b
JOIN members m
ON b.member_id = m.member_id
JOIN classes c
ON b.class_id = c.class_id;

-- View attendance records
SELECT
  a.attendance_id,
  m.fullname AS member_name,
  c.class_name,
  a.attended_at
FROM attendance a
JOIN bookings b
ON a.booking_id = b.booking_id
JOIN members m
ON b.member_id = m.member_id
JOIN classes c
ON b.class_id = c.class_id;
