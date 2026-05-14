const express = require('express');
const router = express.Router();
const { getAttendances, markPresent, getMemberAttendanceRate, getClassAttendanceRate } = require('../controllers/attendanceController');

router.get('/', getAttendances);
router.post('/', markPresent);
router.get('/rate/member/:member_id', getMemberAttendanceRate);
router.get('/rate/class/:class_id', getClassAttendanceRate);

module.exports = router;
