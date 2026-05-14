const express = require('express');
const router = express.Router();
const {
  getClasses,
  getClass,
  addClass,
  editClass,
  removeClass,
  getReport,
} = require('../controllers/classController');

router.get('/', getClasses);
router.post('/', addClass);
router.get('/report/availability', getReport);
router.get('/:id', getClass);
router.put('/:id', editClass);
router.delete('/:id', removeClass);

module.exports = router;