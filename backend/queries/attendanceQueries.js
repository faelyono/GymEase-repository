const pool = require('../config/db');

const getAllAttendances = async (filters = {}) => {
  let query = `
    SELECT a.attendance_id, a.booking_id, a.attended_at,
           b.member_id, b.class_id, b.status as booking_status,
           m.fullname as member_name, c.class_name, c.schedule
    FROM attendance a
    JOIN bookings b ON a.booking_id = b.booking_id
    JOIN members m ON b.member_id = m.member_id
    JOIN classes c ON b.class_id = c.class_id
    WHERE 1=1
  `;
  const values = [];
  let i = 1;

  if (filters.member_id) {
    query += ` AND b.member_id = $${i++}`;
    values.push(filters.member_id);
  }
  if (filters.class_id) {
    query += ` AND b.class_id = $${i++}`;
    values.push(filters.class_id);
  }

  query += ' ORDER BY a.attended_at DESC';
  const result = await pool.query(query, values);
  return result.rows;
};

const checkAlreadyAttended = async (booking_id) => {
  const result = await pool.query(
    'SELECT attendance_id FROM attendance WHERE booking_id = $1',
    [booking_id]
  );
  return result.rows[0];
};

const markAttendance = async (booking_id) => {
  const result = await pool.query(
    `INSERT INTO attendance (booking_id) VALUES ($1) RETURNING *`,
    [booking_id]
  );
  return result.rows[0];
};

const getAttendanceRateByMember = async (member_id) => {
  const result = await pool.query(
    `SELECT m.fullname,
            COUNT(b.booking_id) as total_bookings,
            COUNT(a.attendance_id) as total_attended,
            ROUND(COUNT(a.attendance_id) * 100.0 / NULLIF(COUNT(b.booking_id), 0), 2) as attendance_rate_percent
     FROM members m
     LEFT JOIN bookings b ON m.member_id = b.member_id AND b.status = 'confirmed'
     LEFT JOIN attendance a ON b.booking_id = a.booking_id
     WHERE m.member_id = $1
     GROUP BY m.member_id, m.fullname`,
    [member_id]
  );
  return result.rows[0];
};

const getAttendanceRateByClass = async (class_id) => {
  const result = await pool.query(
    `SELECT c.class_name,
            COUNT(b.booking_id) as total_confirmed_bookings,
            COUNT(a.attendance_id) as total_attended,
            ROUND(COUNT(a.attendance_id) * 100.0 / NULLIF(COUNT(b.booking_id), 0), 2) as attendance_rate_percent
     FROM classes c
     LEFT JOIN bookings b ON c.class_id = b.class_id AND b.status = 'confirmed'
     LEFT JOIN attendance a ON b.booking_id = a.booking_id
     WHERE c.class_id = $1
     GROUP BY c.class_id, c.class_name`,
    [class_id]
  );
  return result.rows[0];
};

module.exports = { getAllAttendances, checkAlreadyAttended, markAttendance, getAttendanceRateByMember, getAttendanceRateByClass };
