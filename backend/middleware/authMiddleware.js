const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    // 1. Ambil header Authorization
    const authHeader = req.header('Authorization');
    
    // Debugging: Muncul di terminal VS Code jika token tidak masuk
    if (!authHeader) {
        console.log("Error: Header Authorization tidak ditemukan.");
        return res.status(401).json({ message: "Akses ditolak. Token tidak ditemukan." });
    }

    // 2. Cek apakah menggunakan format "Bearer <token>"
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        console.log("Error: Format header bukan Bearer.");
        return res.status(401).json({ message: "Format token salah. Gunakan: Bearer <token>" });
    }

    const token = parts[1];

    try {
        // 3. Verifikasi token menggunakan secret dari .env
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // Simpan data user (id, email) ke req.user agar bisa dipakai di controller
        req.user = verified;
        
        next(); // Lanjut ke controller profile
    } catch (err) {
        // 4. Penanganan error spesifik untuk debugging kamu
        console.log("JWT Error detail:", err.message);
        
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token sudah kedaluwarsa. Silakan login ulang." });
        }
        
        res.status(400).json({ message: "Token tidak valid atau kunci rahasia salah." });
    }
};