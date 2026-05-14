const pool = require('../config/db');

const getAllClasses = async (filters = {}) => {
  let query = `
    SELECT c.*, t.name as trainer_name 
    FROM classes c
    LEFT JOIN trainers t ON c.trainer_id = t.trainer_id
    WHERE 1=1
  `;
  const values = [];
  let i = 1;

  if (filters.trainer_id) {
    query += ` AND c.trainer_id = $${i++}`;
    values.push(filters.trainer_id);
  }
  if (filters.day) {
    query += ` AND TO_CHAR(c.schedule, 'Day') ILIKE $${i++}`;
    values.push(`%${filters.day}%`);
  }

  query += ' ORDER BY c.schedule';
  const result = await pool.query(query, values);
  return result.rows;
};

const getClassById = async (id) => {
  const result = await pool.query(
    `SELECT c.*, t.name as trainer_name 
     FROM classes c
     LEFT JOIN trainers t ON c.trainer_id = t.trainer_id
     WHERE c.class_id = $1`,
    [id]
  );
  return result.rows[0];
};

const createClass = async ({ class_name, trainer_id, schedule, capacity }) => {
  const result = await pool.query(
    `INSERT INTO classes (class_name, trainer_id, schedule, capacity) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [class_name, trainer_id, schedule, capacity]
  );
  return result.rows[0];
};

const updateClass = async (id, { class_name, trainer_id, schedule, capacity }) => {
  const result = await pool.query(
    `UPDATE classes SET class_name=$1, trainer_id=$2, schedule=$3, capacity=$4 
     WHERE class_id=$5 RETURNING *`,
    [class_name, trainer_id, schedule, capacity, id]
  );
  return result.rows[0];
};

const deleteClass = async (id) => {
  const result = await pool.query(
    'DELETE FROM classes WHERE class_id = $1 RETURNING *', [id]
  );
  return result.rows[0];
};

const getAvailabilityReport = async () => {
  const result = await pool.query(`
    SELECT 
      TO_CHAR(c.schedule, 'Day') as day_of_week,
      COUNT(c.class_id) as total_classes,
      SUM(c.capacity) as total_capacity,
      COUNT(b.booking_id) as total_bookings,
      ROUND(COUNT(b.booking_id) * 100.0 / NULLIF(SUM(c.capacity), 0), 2) as fill_rate_percent
    FROM classes c
    LEFT JOIN bookings b ON c.class_id = b.class_id
    GROUP BY TO_CHAR(c.schedule, 'Day')
    ORDER BY TO_CHAR(c.schedule, 'Day')
  `);
  return result.rows;
};

module.exports = { getAllClasses, getClassById, createClass, updateClass, deleteClass, getAvailabilityReport };