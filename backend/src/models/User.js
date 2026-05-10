const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ROLES } = require('../config/constants');

const UserSchema = new mongoose.Schema(
  {
    // Temel Bilgiler
    name: {
      type: String,
      required: [true, 'İsim alanı zorunludur'],
      trim: true,
      minlength: [2, 'İsim en az 2 karakter olmalıdır'],
      maxlength: [50, 'İsim en fazla 50 karakter olabilir'],
    },
    surname: {
      type: String,
      required: [true, 'Soyisim alanı zorunludur'],
      trim: true,
      minlength: [2, 'Soyisim en az 2 karakter olmalıdır'],
      maxlength: [50, 'Soyisim en fazla 50 karakter olabilir'],
    },
    email: {
      type: String,
      required: [true, 'E-posta alanı zorunludur'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Geçerli bir e-posta adresi giriniz',
      ],
    },
    password: {
      type: String,
      required: [true, 'Şifre alanı zorunludur'],
      minlength: [6, 'Şifre en az 6 karakter olmalıdır'],
      select: false, // Sorgularda şifre varsayılan olarak dönmez
    },
    phone: {
      type: String,
      trim: true,
      match: [/^(\+90|0)?[0-9]{10}$/, 'Geçerli bir telefon numarası giriniz'],
    },

    // Rol ve Yetki
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.VOLUNTEER,
    },

    // Profil Bilgileri
    bio: {
      type: String,
      maxlength: [500, 'Biyografi en fazla 500 karakter olabilir'],
    },
    avatar: {
      type: String,
      default: '',
    },
    interests: [
      {
        type: String,
        trim: true,
      },
    ],
    city: {
      type: String,
      trim: true,
    },

    // Oyunlaştırma
    completedEventsCount: {
      type: Number,
      default: 0,
    },
    badges: [
      {
        name: String,
        icon: String,
        earnedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    currentRank: {
      type: String,
      default: 'Çaylak Gönüllü',
    },

    // Organizatör Bilgileri (sadece organizer rolü için)
    organizationName: {
      type: String,
      trim: true,
    },
    organizationDescription: {
      type: String,
      maxlength: [1000, 'Topluluk açıklaması en fazla 1000 karakter olabilir'],
    },

    // Hesap Durumu
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt otomatik eklenir
  }
);

// ---------- MIDDLEWARE ----------

// Kayıt öncesi şifreyi hashle
UserSchema.pre('save', async function (next) {
  // Şifre değişmediyse hashleme
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ---------- METHODS ----------

// Girilen şifreyi veritabanındaki hash ile karşılaştır
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// JWT Token üret
UserSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      email: this.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Kullanıcı bilgilerini güvenli şekilde döndür (şifresiz)
UserSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    surname: this.surname,
    email: this.email,
    phone: this.phone,
    role: this.role,
    bio: this.bio,
    avatar: this.avatar,
    interests: this.interests,
    city: this.city,
    completedEventsCount: this.completedEventsCount,
    badges: this.badges,
    currentRank: this.currentRank,
    organizationName: this.organizationName,
    organizationDescription: this.organizationDescription,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', UserSchema);
