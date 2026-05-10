const { validationResult } = require('express-validator');
const User = require('../models/User');
const { ROLES } = require('../config/constants');

/**
 * @desc    Yeni kullanıcı kaydı
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
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

    const {
      name,
      surname,
      email,
      password,
      phone,
      role,
      city,
      interests,
      organizationName,
      organizationDescription,
    } = req.body;

    // E-posta kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu e-posta adresi zaten kayıtlı.',
      });
    }

    // Kullanıcı oluştur
    const userData = {
      name,
      surname,
      email,
      password,
      phone,
      role: role || ROLES.VOLUNTEER,
      city,
      interests,
    };

    // Organizatör ise ek bilgiler
    if (role === ROLES.ORGANIZER) {
      userData.organizationName = organizationName;
      userData.organizationDescription = organizationDescription;
    }

    const user = await User.create(userData);

    // Token üret
    const token = user.generateToken();

    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı! Hoş geldiniz.',
      data: {
        user: user.toSafeObject(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Kullanıcı girişi
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
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

    const { email, password } = req.body;

    // Kullanıcıyı şifresiyle birlikte bul
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz e-posta veya şifre.',
      });
    }

    // Hesap aktif mi kontrol et
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hesabınız devre dışı bırakılmıştır. Yönetici ile iletişime geçiniz.',
      });
    }

    // Şifre doğrulama
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz e-posta veya şifre.',
      });
    }

    // Son giriş tarihini güncelle
    user.lastLogin = new Date();
    await user.save({ validateModifiedOnly: true });

    // Token üret
    const token = user.generateToken();

    res.status(200).json({
      success: true,
      message: 'Giriş başarılı!',
      data: {
        user: user.toSafeObject(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mevcut kullanıcı bilgisi (token ile)
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

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

module.exports = {
  register,
  login,
  getMe,
};
