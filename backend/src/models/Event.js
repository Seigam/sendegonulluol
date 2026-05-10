const mongoose = require('mongoose');
const { EVENT_STATUS } = require('../config/constants');

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Etkinlik başlığı zorunludur'],
      trim: true,
      minlength: [5, 'Başlık en az 5 karakter olmalıdır'],
      maxlength: [100, 'Başlık en fazla 100 karakter olabilir'],
    },
    description: {
      type: String,
      required: [true, 'Etkinlik açıklaması zorunludur'],
      trim: true,
      minlength: [20, 'Açıklama en az 20 karakter olmalıdır'],
      maxlength: [2000, 'Açıklama en fazla 2000 karakter olabilir'],
    },
    category: {
      type: String,
      required: [true, 'Etkinlik kategorisi zorunludur'],
      trim: true,
    },
    location: {
      city: {
        type: String,
        required: [true, 'Şehir alanı zorunludur'],
        trim: true,
      },
      address: {
        type: String,
        required: [true, 'Açık adres zorunludur'],
        trim: true,
      },
    },
    date: {
      start: {
        type: Date,
        required: [true, 'Başlangıç tarihi zorunludur'],
      },
      end: {
        type: Date,
        required: false,
      },
    },
    quota: {
      type: Number,
      required: [true, 'Kontenjan alanı zorunludur'],
      min: [1, 'Kontenjan en az 1 kişi olmalıdır'],
    },
    appliedCount: {
      type: Number,
      default: 0,
    },
    coverImage: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(EVENT_STATUS),
      default: EVENT_STATUS.PENDING, // Varsayılan olarak Admin onayı bekler
    },
    adminMessage: {
      type: String, // Etkinlik reddedildiğinde admin'in bıraktığı not
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Güvenli döndürülecek veri (admin notlarını duruma göre gizlemek için)
EventSchema.methods.toSafeObject = function (isAdminOrOrganizer = false) {
  const eventObj = this.toObject();

  if (!isAdminOrOrganizer) {
    // Normal kullanıcılardan gizlenecek alanlar
    delete eventObj.adminMessage;
    // Eğer bekleyen veya reddedilen bir etkinliği biri doğrudan çağırırsa
    // yine gizli kalması için önlemler controller'da alınır.
  }

  return eventObj;
};

module.exports = mongoose.model('Event', EventSchema);
