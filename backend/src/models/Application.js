const mongoose = require('mongoose');
const { APPLICATION_STATUS } = require('../config/constants');

const ApplicationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Etkinlik alanı zorunludur'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Kullanıcı alanı zorunludur'],
    },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.PENDING,
    },
    note: {
      type: String,
      maxlength: [500, 'Not en fazla 500 karakter olabilir'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Aynı kullanıcının aynı etkinliğe iki kez başvurmasını önle
ApplicationSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
