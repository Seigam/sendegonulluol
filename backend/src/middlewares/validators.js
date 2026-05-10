const { body } = require('express-validator');

/**
 * Kayıt (Register) doğrulama kuralları
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('İsim alanı zorunludur.')
    .isLength({ min: 2, max: 50 })
    .withMessage('İsim 2-50 karakter arasında olmalıdır.'),

  body('surname')
    .trim()
    .notEmpty()
    .withMessage('Soyisim alanı zorunludur.')
    .isLength({ min: 2, max: 50 })
    .withMessage('Soyisim 2-50 karakter arasında olmalıdır.'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('E-posta alanı zorunludur.')
    .isEmail()
    .withMessage('Geçerli bir e-posta adresi giriniz.')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Şifre alanı zorunludur.')
    .isLength({ min: 6 })
    .withMessage('Şifre en az 6 karakter olmalıdır.')
    .matches(/\d/)
    .withMessage('Şifre en az bir rakam içermelidir.'),

  body('phone')
    .optional()
    .trim()
    .matches(/^(\+90|0)?[0-9]{10}$/)
    .withMessage('Geçerli bir telefon numarası giriniz (ör: 05551234567).'),

  body('role')
    .optional()
    .isIn(['volunteer', 'organizer'])
    .withMessage('Geçersiz rol. Sadece "volunteer" veya "organizer" seçilebilir.'),

  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Şehir en fazla 100 karakter olabilir.'),

  body('interests')
    .optional()
    .isArray()
    .withMessage('İlgi alanları bir dizi olmalıdır.'),

  // Organizatör alanları
  body('organizationName')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Topluluk adı en fazla 200 karakter olabilir.'),

  body('organizationDescription')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Topluluk açıklaması en fazla 1000 karakter olabilir.'),
];

/**
 * Giriş (Login) doğrulama kuralları
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('E-posta alanı zorunludur.')
    .isEmail()
    .withMessage('Geçerli bir e-posta adresi giriniz.')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Şifre alanı zorunludur.'),
];

/**
 * Profil güncelleme doğrulama kuralları
 */
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('İsim 2-50 karakter arasında olmalıdır.'),

  body('surname')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Soyisim 2-50 karakter arasında olmalıdır.'),

  body('phone')
    .optional()
    .trim()
    .matches(/^(\+90|0)?[0-9]{10}$/)
    .withMessage('Geçerli bir telefon numarası giriniz.'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Biyografi en fazla 500 karakter olabilir.'),

  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Şehir en fazla 100 karakter olabilir.'),

  body('interests')
    .optional()
    .isArray()
    .withMessage('İlgi alanları bir dizi olmalıdır.'),
];

/**
 * Şifre değiştirme doğrulama kuralları
 */
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mevcut şifre alanı zorunludur.'),

  body('newPassword')
    .notEmpty()
    .withMessage('Yeni şifre alanı zorunludur.')
    .isLength({ min: 6 })
    .withMessage('Yeni şifre en az 6 karakter olmalıdır.')
    .matches(/\d/)
    .withMessage('Yeni şifre en az bir rakam içermelidir.'),
];

/**
 * Etkinlik oluşturma doğrulama kuralları
 */
const createEventValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Etkinlik başlığı zorunludur.')
    .isLength({ min: 5, max: 100 })
    .withMessage('Başlık 5-100 karakter arasında olmalıdır.'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Etkinlik açıklaması zorunludur.')
    .isLength({ min: 20, max: 2000 })
    .withMessage('Açıklama 20-2000 karakter arasında olmalıdır.'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Kategori alanı zorunludur.'),

  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('Şehir alanı zorunludur.'),

  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('Açık adres zorunludur.'),

  body('date.start')
    .notEmpty()
    .withMessage('Başlangıç tarihi zorunludur.')
    .isISO8601()
    .withMessage('Geçerli bir tarih giriniz.'),

  body('date.end')
    .optional()
    .isISO8601()
    .withMessage('Geçerli bir bitiş tarihi giriniz.')
    .custom((value, { req }) => {
      if (value && new Date(value) <= new Date(req.body.date.start)) {
        throw new Error('Bitiş tarihi başlangıç tarihinden sonra olmalıdır.');
      }
      return true;
    }),

  body('quota')
    .notEmpty()
    .withMessage('Kontenjan zorunludur.')
    .isInt({ min: 1 })
    .withMessage('Kontenjan en az 1 olmalıdır.'),
];

/**
 * Admin etkinlik onay / ret doğrulama kuralları
 */
const updateEventStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Durum alanı zorunludur.')
    .isIn(['approved', 'rejected'])
    .withMessage('Durum sadece approved veya rejected olabilir.'),
  
  body('adminMessage')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Admin notu en fazla 500 karakter olabilir.'),
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  createEventValidation,
  updateEventStatusValidation,
};
