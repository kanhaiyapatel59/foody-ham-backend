const mongoose = require('mongoose');

const loyaltyPointsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  availablePoints: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    default: 'Bronze'
  },
  badges: [{
    name: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  transactions: [{
    type: { type: String, enum: ['earned', 'redeemed'] },
    points: Number,
    reason: String,
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

loyaltyPointsSchema.methods.addPoints = function(points, reason, orderId = null) {
  this.totalPoints += points;
  this.availablePoints += points;
  this.transactions.push({
    type: 'earned',
    points,
    reason,
    orderId
  });
  this.updateLevel();
  this.checkBadges();
};

loyaltyPointsSchema.methods.redeemPoints = function(points, reason) {
  if (this.availablePoints >= points) {
    this.availablePoints -= points;
    this.transactions.push({
      type: 'redeemed',
      points: -points,
      reason
    });
    return true;
  }
  return false;
};

loyaltyPointsSchema.methods.updateLevel = function() {
  if (this.totalPoints >= 5000) this.level = 'Platinum';
  else if (this.totalPoints >= 2000) this.level = 'Gold';
  else if (this.totalPoints >= 500) this.level = 'Silver';
  else this.level = 'Bronze';
};

loyaltyPointsSchema.methods.checkBadges = function() {
  const badges = [];
  
  if (this.totalPoints >= 100 && !this.badges.find(b => b.name === 'First Century')) {
    badges.push({ name: 'First Century', icon: '🎯' });
  }
  if (this.totalPoints >= 1000 && !this.badges.find(b => b.name === 'Point Master')) {
    badges.push({ name: 'Point Master', icon: '👑' });
  }
  if (this.transactions.filter(t => t.type === 'earned').length >= 10 && !this.badges.find(b => b.name === 'Frequent Diner')) {
    badges.push({ name: 'Frequent Diner', icon: '🍽️' });
  }
  
  this.badges.push(...badges);
};

module.exports = mongoose.model('LoyaltyPoints', loyaltyPointsSchema);