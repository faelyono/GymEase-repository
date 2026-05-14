const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Route untuk Registrasi (Tugas Person 1)
router.post('/register', authController.register);

// Route untuk Login (Tugas Person 1)
router.post('/login', authController.login);

// Route untuk Melihat Profil (Diproteksi Middleware JWT)
// - Termasuk pengecekan membership status
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;