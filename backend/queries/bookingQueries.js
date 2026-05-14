const pool = require('../config/db');

const getAllBookings = async (filters = {}) => {
  let query = `
    SELECT b.booking_id, b.member_id, b.class_id, b.status, b.booked_at,
           m.fullname as member_name, c.class_name, c.schedule, c.capacity
    FROM bookings b
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
  if (filters.status) {
    query += ` AND b.status = $${i++}`;
    values.push(filters.status);
  }

  query += ' ORDER BY b.booked_at DESC';
  const result = await pool.query(query, values);
  return result.rows;
};

const getBookingById = async (id) => {
  const result = await pool.query(
    `SELECT b.booking_id, b.member_id, b.class_id, b.status, b.booked_at,
            m.fullname as member_name, c.class_name, c.schedule, c.capacity
     FROM bookings b
     JOIN members m ON b.member_id = m.member_id
     JOIN classes c ON b.class_id = c.class_id
     WHERE b.booking_id = $1`,
    [id]
  );
  return result.rows[0];
};

const checkConflict = async (member_id, class_id) => {
  const result = await pool.query(
    `SELECT b.booking_id
     FROM bookings b
     JOIN classes c ON b.class_id = c.class_id
     WHERE b.member_id = $1
       AND b.status = 'confirmed'
       AND c.schedule = (SELECT schedule FROM classes WHERE class_id = $2)`,
    [member_id, class_id]
  );
  return result.rows[0];
};

const checkCapacity = async (class_id) => {
  const result = await pool.query(
    `SELECT c.capacity,
            COUNT(b.booking_id) FILTER (WHERE b.status = 'confirmed') as confirmed_count
     FROM classes c
     LEFT JOIN bookings b ON c.class_id = b.class_id
     WHERE c.class_id = $1
     GROUP BY c.capacity`,
    [class_id]
  );
  return result.rows[0];
};

const createBooking = async ({ member_id, class_id }) => {
  const result = await pool.query(
    `INSERT INTO bookings (member_id, class_id, status) VALUES ($1, $2, 'confirmed') RETURNING *`,
    [member_id, class_id]
  );
  return result.rows[0];
};

const cancelBooking = async (booking_id) => {
  const result = await pool.query(
    `UPDATE bookings SET status = 'cancelled' WHERE booking_id = $1 RETURNING *`,
    [booking_id]
  );
  return result.rows[0];
};

const getBookingStats = async (class_id) => {
  const result = await pool.query(
    `SELECT c.class_name, c.capacity,
            COUNT(b.booking_id) as total_bookings,
            COUNT(b.booking_id) FILTER (WHERE b.status = 'confirmed') as confirmed,
            COUNT(b.booking_id) FILTER (WHERE b.status = 'cancelled') as cancelled,
            ROUND(COUNT(b.booking_id) FILTER (WHERE b.status = 'confirmed') * 100.0 / NULLIF(c.capacity, 0), 2) as fill_rate_percent
     FROM classes c
     LEFT JOIN bookings b ON c.class_id = b.class_id
     WHERE c.class_id = $1
     GROUP BY c.class_id, c.class_name, c.capacity`,
    [class_id]
  );
  return result.rows[0];
};

module.exports = { getAllBookings, getBookingById, checkConflict, checkCapacity, createBooking, cancelBooking, getBookingStats };
