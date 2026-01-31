const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planType: {
    type: String,
    enum: ['weekly', 'monthly'],
    required: true
  },
  planName: {
    type: String,
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    dayOfWeek: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    }
  }],
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'USA' }
  },
  deliveryTime: {
    type: String,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled'],
    default: 'active'
  },
  nextDelivery: {
    type: Date,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

subscriptionSchema.methods.calculateNextDelivery = function() {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  if (this.planType === 'weekly') {
    this.nextDelivery = nextWeek;
  } else if (this.planType === 'monthly') {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    this.nextDelivery = nextMonth;
  }
};

module.exports = mongoose.model('Subscription', subscriptionSchema);