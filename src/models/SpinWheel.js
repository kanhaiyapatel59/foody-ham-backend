const mongoose = require('mongoose');

const spinWheelSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastSpinDate: {
    type: Date,
    required: true
  },
  reward: {
    type: String,
    required: true
  },
  rewardValue: {
    type: Number,
    default: 0
  },
  couponCode: {
    type: String
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SpinWheel', spinWheelSchema);