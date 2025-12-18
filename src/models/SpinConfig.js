const mongoose = require('mongoose');

const spinConfigSchema = new mongoose.Schema({
  isEnabled: {
    type: Boolean,
    default: true
  },
  rewards: {
    freeDelivery: {
      enabled: { type: Boolean, default: true },
      weight: { type: Number, default: 20 }
    },
    discount10: {
      enabled: { type: Boolean, default: true },
      weight: { type: Number, default: 25 }
    },
    discount20: {
      enabled: { type: Boolean, default: true },
      weight: { type: Number, default: 20 }
    },
    discount30: {
      enabled: { type: Boolean, default: true },
      weight: { type: Number, default: 15 }
    },
    freeItem: {
      enabled: { type: Boolean, default: true },
      weight: { type: Number, default: 20 },
      itemName: { type: String, default: 'Free Dessert' },
      itemValue: { type: Number, default: 5.99 }
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SpinConfig', spinConfigSchema);