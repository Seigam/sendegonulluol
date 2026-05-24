const { validationResult } = require('express-validator');
const User = require('../models/User');
const { ROLES } = require('../config/constants');

/**
 * @desc    Kullanıcı profilini getir
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Kullanıcı profilini güncelle
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    // Doğrulama hatalarını kontrol et
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Doğrulama hatası.',
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }

    // Güncellenebilir alanlar (şifre ve rol hariç)
    const allowedFields = [
      'name',
      'surname',
      'phone',
      'bio',
      'avatar',
      'interests',
      'city',
    ];

    // Organizatör ise ek alanlar
    if (req.user.role === ROLES.ORGANIZER) {
      allowedFields.push('organizationName', 'organizationDescription');
    }

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profil başarıyla güncellendi.',
      data: {
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Şifre değiştir
 * @route   PUT /api/users/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    // Doğrulama hatalarını kontrol et
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Doğrulama hatası.',
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Kullanıcıyı şifresiyle birlikte bul
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.',
      });
    }

    // Mevcut şifreyi doğrula
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Mevcut şifre yanlış.',
      });
    }

    // Yeni şifreyi kaydet
    user.password = newPassword;
    await user.save();

    // Yeni token üret
    const token = user.generateToken();

    res.status(200).json({
      success: true,
      message: 'Şifre başarıyla değiştirildi.',
      data: {
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Belirli bir kullanıcının public profilini getir
 * @route   GET /api/users/:id
 * @access  Public
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.',
      });
    }

    // Public profilde sadece sınırlı bilgi döndür
    const publicProfile = {
      id: user._id,
      name: user.name,
      surname: user.surname,
      bio: user.bio,
      avatar: user.avatar,
      city: user.city,
      interests: user.interests,
      role: user.role,
      completedEventsCount: user.completedEventsCount,
      badges: user.badges,
      currentRank: user.currentRank,
      organizationName: user.organizationName,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      data: {
        user: publicProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Tüm kullanıcıları listele (Admin)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    // Filtreleme
    const filter = {};

    if (req.query.role) {
      filter.role = req.query.role;
    }

    if (req.query.city) {
      filter.city = { $regex: req.query.city, $options: 'i' };
    }

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    // Arama (isim veya e-posta)
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { surname: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        users: users.map((u) => u.toSafeObject()),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Kullanıcı hesabını aktif/pasif yap (Admin)
 * @route   PUT /api/users/:id/toggle-status
 * @access  Private/Admin
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.',
      });
    }

    // Admin kendini devre dışı bırakamasın
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Kendi hesabınızı devre dışı bırakamazsınız.',
      });
    }

    user.isActive = !user.isActive;
    await user.save({ validateModifiedOnly: true });

    const statusText = user.isActive ? 'aktif' : 'devre dışı';

    res.status(200).json({
      success: true,
      message: `Kullanıcı hesabı ${statusText} yapıldı.`,
      data: {
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user statistics (e.g. number of active volunteers)
 * @route   GET /api/users/stats
 * @access  Public
 */
const getUserStats = async (req, res, next) => {
  try {
    const totalUsersCount = await User.countDocuments({
      isActive: true,
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers: totalUsersCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getUserById,
  getAllUsers,
  toggleUserStatus,
  getUserStats,
};
