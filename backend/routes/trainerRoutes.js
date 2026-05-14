const express = require('express');
const router = express.Router();
const {
  getTrainers,
  getTrainer,
  addTrainer,
  editTrainer,
  removeTrainer,
} = require('../controllers/trainerController');

// GET    /api/trainers          → get all trainers (with class count)
// POST   /api/trainers          → create new trainer
// GET    /api/trainers/:id      → get trainer by ID (with their classes)
// PUT    /api/trainers/:id      → update trainer
// DELETE /api/trainers/:id      → delete trainer

router.get('/', getTrainers);
router.post('/', addTrainer);
router.get('/:id', getTrainer);
router.put('/:id', editTrainer);
router.delete('/:id', removeTrainer);

module.exports = router;