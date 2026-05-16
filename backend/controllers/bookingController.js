const { getAllBookings, getBookingById, checkConflict, checkCapacity, createBooking, cancelBooking, getBookingStats } = require('../queries/bookingQueries');

const getBookings = async (req, res) => {
  try {
    const { member_id, class_id, status } = req.query;
    const bookings = await getAllBookings({ member_id, class_id, status });
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getBooking = async (req, res) => {
  try {
    const booking = await getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const addBooking = async (req, res) => {
  try {
    const { member_id, class_id } = req.body;
    if (!member_id || !class_id) {
      return res.status(400).json({ success: false, message: 'member_id and class_id are required' });
    }

    const conflict = await checkConflict(member_id, class_id);
    if (conflict) {
      return res.status(409).json({ success: false, message: 'Booking conflict: member already has a confirmed booking at this schedule' });
    }

    const capacity = await checkCapacity(class_id);
    if (!capacity) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }
    if (parseInt(capacity.confirmed_count) >= parseInt(capacity.capacity)) {
      return res.status(409).json({ success: false, message: 'Class is full, no available slots' });
    }

    const booking = await createBooking({ member_id, class_id });
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const removeBooking = async (req, res) => {
  try {
    const booking = await cancelBooking(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, message: 'Booking cancelled', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await getBookingStats(req.params.class_id);
    if (!stats) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getBookings, getBooking, addBooking, removeBooking, getStats };
