/**
 * Genel hata yakalama middleware'i
 * Tüm route'lardan gelen hataları yakalar ve uygun formatta yanıt döner
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Konsola logla (geliştirme ortamı için)
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Hata:', err);
  }

  // Mongoose geçersiz ObjectId hatası
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Geçersiz ID formatı.',
    });
  }

  // Mongoose duplicate key hatası (ör: aynı e-posta ile kayıt)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const fieldNames = {
      email: 'E-posta adresi',
    };
    const displayName = fieldNames[field] || field;

    return res.status(400).json({
      success: false,
      message: `${displayName} zaten kayıtlı. Lütfen farklı bir ${displayName.toLowerCase()} kullanınız.`,
    });
  }

  // Mongoose validation hatası
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join('. '),
    });
  }

  // Varsayılan sunucu hatası
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Sunucu hatası oluştu.',
  });
};

module.exports = errorHandler;
