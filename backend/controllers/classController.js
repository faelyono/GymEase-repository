const {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getAvailabilityReport,
} = require('../queries/classQueries');

const getClasses = async (req, res) => {
  try {
    const { trainer_id, day } = req.query;
    const classes = await getAllClasses({ trainer_id, day });
    res.json({ success: true, data: classes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getClass = async (req, res) => {
  try {
    const cls = await getClassById(req.params.id);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, data: cls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const addClass = async (req, res) => {
  try {
    const { class_name, trainer_id, schedule, capacity } = req.body;
    if (!class_name || !schedule || !capacity) {
      return res.status(400).json({ success: false, message: 'class_name, schedule, capacity are required' });
    }
    const cls = await createClass({ class_name, trainer_id, schedule, capacity });
    res.status(201).json({ success: true, data: cls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const editClass = async (req, res) => {
  try {
    const cls = await updateClass(req.params.id, req.body);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, data: cls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const removeClass = async (req, res) => {
  try {
    const cls = await deleteClass(req.params.id);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, message: 'Class deleted', data: cls });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getReport = async (req, res) => {
  try {
    const report = await getAvailabilityReport();
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getClasses, getClass, addClass, editClass, removeClass, getReport };