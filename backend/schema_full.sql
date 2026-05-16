-- ============================================
-- GymEase - Complete Database Schema
-- Run this ONCE before starting the server
-- ============================================

-- 1. MEMBERS (Person 1)
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

-- 2. TRAINERS (Person 2)
CREATE TABLE IF NOT EXISTS trainers (
  trainer_id      SERIAL PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  specialization  VARCHAR(100),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- 3. CLASSES (Person 2)
CREATE TABLE IF NOT EXISTS classes (
  class_id    SERIAL PRIMARY KEY,
  class_name  VARCHAR(100) NOT NULL,
  trainer_id  INT REFERENCES trainers(trainer_id) ON DELETE SET NULL,
  schedule    TIMESTAMP NOT NULL,
  capacity    INT NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- 4. BOOKINGS (Person 3)
CREATE TABLE IF NOT EXISTS bookings (
  booking_id  SERIAL PRIMARY KEY,
  member_id   INT NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
  class_id    INT NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
  status      VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  booked_at   TIMESTAMP DEFAULT NOW()
);

-- 5. ATTENDANCE (Person 3)
CREATE TABLE IF NOT EXISTS attendance (
  attendance_id  SERIAL PRIMARY KEY,
  booking_id     INT NOT NULL UNIQUE REFERENCES bookings(booking_id) ON DELETE CASCADE,
  attended_at    TIMESTAMP DEFAULT NOW()
);
