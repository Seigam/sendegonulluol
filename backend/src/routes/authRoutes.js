const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { auth } = require('../middlewares/auth');
const { registerValidation, loginValidation } = require('../middlewares/validators');

/**
 * Auth Route'ları
 *
 * POST   /api/auth/register  - Yeni kullanıcı kaydı
 * POST   /api/auth/login     - Kullanıcı girişi
 * GET    /api/auth/me        - Mevcut kullanıcı bilgisi
 */

// Kayıt
router.post('/register', registerValidation, register);

// Giriş
router.post('/login', loginValidation, login);

// Mevcut kullanıcı (token gerekli)
router.get('/me', auth, getMe);

// ⚙️ İlk Admin oluşturma (SADECE geliştirme ortamı — üretimde kaldırılmalı)
router.post('/init-admin', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'Bu endpoint üretim ortamında devre dışıdır.' });
  }
  try {
    const User = require('../models/User');
    const { ROLES } = require('../config/constants');
    const exists = await User.findOne({ role: ROLES.ADMIN });
    if (exists) {
      // Admin varsa sadece login token dön
      const token = exists.generateToken();
      return res.json({ success: true, message: 'Admin zaten mevcut.', data: { user: exists.toSafeObject(), token } });
    }
    const admin = await User.create({
      name: 'Sistem',
      surname: 'Yöneticisi',
      email: req.body.email || 'admin@sendegonulluol.com',
      password: req.body.password || 'Admin123!',
      role: ROLES.ADMIN,
      city: 'Ardeşen',
    });
    const token = admin.generateToken();
    return res.status(201).json({ success: true, message: 'Admin hesabı oluşturuldu.', data: { user: admin.toSafeObject(), token } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

