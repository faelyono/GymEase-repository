const { getAllAttendances, checkAlreadyAttended, markAttendance, getAttendanceRateByMember, getAttendanceRateByClass } = require('../queries/attendanceQueries');
const pool = require('../config/db');

const getAttendances = async (req, res) => {
  try {
    const { member_id, class_id } = req.query;
    const attendances = await getAllAttendances({ member_id, class_id });
    res.json({ success: true, data: attendances });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const markPresent = async (req, res) => {
  try {
    const { booking_id } = req.body;
    if (!booking_id) {
      return res.status(400).json({ success: false, message: 'booking_id is required' });
    }

    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE booking_id = $1',
      [booking_id]
    );
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (bookingResult.rows[0].status !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Cannot mark attendance for a cancelled booking' });
    }

    const already = await checkAlreadyAttended(booking_id);
    if (already) {
      return res.status(409).json({ success: false, message: 'Attendance already marked for this booking' });
    }

    const attendance = await markAttendance(booking_id);
    res.status(201).json({ success: true, data: attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMemberAttendanceRate = async (req, res) => {
  try {
    const rate = await getAttendanceRateByMember(req.params.member_id);
    if (!rate) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, data: rate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getClassAttendanceRate = async (req, res) => {
  try {
    const rate = await getAttendanceRateByClass(req.params.class_id);
    if (!rate) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, data: rate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAttendances, markPresent, getMemberAttendanceRate, getClassAttendanceRate };
