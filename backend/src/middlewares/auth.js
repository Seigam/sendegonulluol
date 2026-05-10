const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT Token doğrulama middleware'i
 * Authorization header'dan Bearer token'ı alır ve doğrular
 */
const auth = async (req, res, next) => {
  try {
    // Token'ı header'dan al
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Erişim reddedildi. Lütfen giriş yapınız.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kullanıcıyı veritabanından bul
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Bu token ile ilişkili kullanıcı bulunamadı.',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hesabınız devre dışı bırakılmıştır.',
      });
    }

    // Kullanıcı bilgisini request'e ekle
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Oturum süreniz dolmuştur. Lütfen tekrar giriş yapınız.',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token. Lütfen tekrar giriş yapınız.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası.',
    });
  }
};

/**
 * Rol bazlı yetkilendirme middleware'i
 * Belirli rollere sahip kullanıcıların erişimine izin verir
 * @param  {...string} roles - İzin verilen roller
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Bu işlem için yetkiniz bulunmamaktadır. Gerekli rol: ${roles.join(', ')}`,
      });
    }
    next();
  };
};

module.exports = { auth, authorize };
