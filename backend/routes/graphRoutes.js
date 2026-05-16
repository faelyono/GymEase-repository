const express = require('express');
const router = express.Router();
const {
  syncBookingToGraph,
  getRecommendations,
  getPopularTrainers,
  getMemberGraph,
  getClassGraph,
  getTrainerGraph,
  getClassSimilarity,
  getMemberNetwork,
} = require('../controllers/graphController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/sync', verifyToken, syncBookingToGraph);
router.get('/recommend/:member_id', verifyToken, getRecommendations);
router.get('/popular-trainers', getPopularTrainers);

// 5 route baru
router.get('/member/:member_id', verifyToken, getMemberGraph);
router.get('/class/:class_id', verifyToken, getClassGraph);
router.get('/trainer/:trainer_id', getTrainerGraph);
router.get('/class-similarity', getClassSimilarity);
router.get('/member-network/:member_id', verifyToken, getMemberNetwork);

module.exports = router;