const express = require('express');
const router = express.Router();
const { getBookings, getBooking, addBooking, removeBooking, getStats } = require('../controllers/bookingController');

router.get('/', getBookings);
router.post('/', addBooking);
router.get('/stats/:class_id', getStats);
router.get('/:id', getBooking);
router.put('/:id/cancel', removeBooking);

module.exports = router;
