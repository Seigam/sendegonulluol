const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  getUserById,
  getAllUsers,
  toggleUserStatus,
  getUserStats,
} = require('../controllers/userController');
const { auth, authorize } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');
const {
  updateProfileValidation,
  changePasswordValidation,
} = require('../middlewares/validators');

/**
 * User Route'ları
 *
 * GET    /api/users/profile          - Kendi profilini getir
 * PUT    /api/users/profile          - Kendi profilini güncelle
 * PUT    /api/users/change-password  - Şifre değiştir
 * GET    /api/users/:id              - Belirli kullanıcıyı görüntüle (public)
 * GET    /api/users                  - Tüm kullanıcıları listele (Admin)
 * PUT    /api/users/:id/toggle-status - Kullanıcı durumunu değiştir (Admin)
 */

// Private - Herhangi bir giriş yapmış kullanıcı
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfileValidation, updateProfile);
router.put('/change-password', auth, changePasswordValidation, changePassword);

// Public - Stats
router.get('/stats', getUserStats);

// Public - Belirli kullanıcı profili
router.get('/:id', getUserById);

// Admin Only
router.get('/', auth, authorize(ROLES.ADMIN), getAllUsers);
router.put('/:id/toggle-status', auth, authorize(ROLES.ADMIN), toggleUserStatus);

module.exports = router;
