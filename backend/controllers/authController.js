const pool = require('../config/db'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Tambahkan ini agar bisa baca process.env

// 1. REGISTER MEMBER
exports.register = async (req, res) => {
  const { fullname, email, password, phone, plan_type, membership_expiry } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO members (fullname, email, password_hash, phone, plan_type, membership_expiry) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING member_id, fullname, email`,
      [fullname, email, hashedPassword, phone, plan_type, membership_expiry]
    );
    res.status(201).json({ message: "Registrasi berhasil!", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Email mungkin sudah terdaftar atau data tidak valid." });
  }
};

// 2. LOGIN MEMBER
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM members WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
        return res.status(404).json({ message: "User tidak ditemukan." });
    }

    const user = userResult.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ message: "Password salah." });

    // PERBAIKAN DI SINI: Gunakan process.env.JWT_SECRET agar sinkron dengan middleware
    const token = jwt.sign(
        { id: user.member_id }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
    );

    res.json({ message: "Login sukses!", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. PROFILE & MEMBERSHIP STATUS
exports.getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT member_id, fullname, email, phone, plan_type, membership_expiry, payment_status FROM members WHERE member_id = $1',
      [req.user.id] 
    );
    
    if (result.rows.length === 0) return res.status(404).json({ message: "Data member tidak ditemukan." });

    const member = result.rows[0];
    
    // Logika Membership Status
    const today = new Date();
    const expiryDate = new Date(member.membership_expiry);
    const isExpired = expiryDate < today;

    res.json({ 
      ...member, 
      status_aktif: isExpired ? "EXPIRED" : "ACTIVE" 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};