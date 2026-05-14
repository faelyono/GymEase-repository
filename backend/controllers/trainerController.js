const {
  getAllTrainers,
  getTrainerById,
  createTrainer,
  updateTrainer,
  deleteTrainer,
} = require('../queries/trainerQueries');

const getTrainers = async (req, res) => {
  try {
    const trainers = await getAllTrainers();
    res.json({ success: true, data: trainers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getTrainer = async (req, res) => {
  try {
    const trainer = await getTrainerById(req.params.id);
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });
    res.json({ success: true, data: trainer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const addTrainer = async (req, res) => {
  try {
    const { name, specialization } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    const trainer = await createTrainer({ name, specialization });
    res.status(201).json({ success: true, data: trainer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const editTrainer = async (req, res) => {
  try {
    const trainer = await updateTrainer(req.params.id, req.body);
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });
    res.json({ success: true, data: trainer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const removeTrainer = async (req, res) => {
  try {
    const trainer = await deleteTrainer(req.params.id);
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });
    res.json({ success: true, message: 'Trainer deleted', data: trainer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getTrainers, getTrainer, addTrainer, editTrainer, removeTrainer };