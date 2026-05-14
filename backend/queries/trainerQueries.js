const pool = require('../config/db');

const getAllTrainers = async () => {
  const result = await pool.query('SELECT * FROM trainers ORDER BY trainer_id');
  return result.rows;
};

const getTrainerById = async (id) => {
  const result = await pool.query('SELECT * FROM trainers WHERE trainer_id = $1', [id]);
  return result.rows[0];
};

const createTrainer = async ({ name, specialization }) => {
  const result = await pool.query(
    'INSERT INTO trainers (name, specialization) VALUES ($1, $2) RETURNING *',
    [name, specialization]
  );
  return result.rows[0];
};

const updateTrainer = async (id, { name, specialization }) => {
  const result = await pool.query(
    'UPDATE trainers SET name = $1, specialization = $2 WHERE trainer_id = $3 RETURNING *',
    [name, specialization, id]
  );
  return result.rows[0];
};

const deleteTrainer = async (id) => {
  const result = await pool.query(
    'DELETE FROM trainers WHERE trainer_id = $1 RETURNING *', [id]
  );
  return result.rows[0];
};

module.exports = { getAllTrainers, getTrainerById, createTrainer, updateTrainer, deleteTrainer };