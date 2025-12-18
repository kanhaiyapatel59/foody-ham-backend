const LoyaltyPoints = require('../models/LoyaltyPoints');

// Get user loyalty points
const getUserLoyalty = async (req, res) => {
  try {
    let loyalty = await LoyaltyPoints.findOne({ user: req.user.id });
    
    if (!loyalty) {
      loyalty = new LoyaltyPoints({ user: req.user.id });
      await loyalty.save();
    }
    
    res.json(loyalty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add points (called after order completion)
const addPoints = async (req, res) => {
  try {
    const { points, reason, orderId } = req.body;
    
    let loyalty = await LoyaltyPoints.findOne({ user: req.user.id });
    if (!loyalty) {
      loyalty = new LoyaltyPoints({ user: req.user.id });
    }
    
    loyalty.addPoints(points, reason, orderId);
    await loyalty.save();
    
    res.json(loyalty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Redeem points
const redeemPoints = async (req, res) => {
  try {
    const { points, reason } = req.body;
    
    const loyalty = await LoyaltyPoints.findOne({ user: req.user.id });
    if (!loyalty) {
      return res.status(404).json({ message: 'Loyalty account not found' });
    }
    
    const success = loyalty.redeemPoints(points, reason);
    if (!success) {
      return res.status(400).json({ message: 'Insufficient points' });
    }
    
    await loyalty.save();
    res.json(loyalty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get rewards catalog
const getRewards = async (req, res) => {
  try {
    const rewards = [
      { id: 1, name: '10% Off Next Order', points: 100, type: 'discount' },
      { id: 2, name: 'Free Dessert', points: 200, type: 'item' },
      { id: 3, name: 'Free Delivery', points: 150, type: 'service' },
      { id: 4, name: '20% Off Next Order', points: 300, type: 'discount' },
      { id: 5, name: 'Free Appetizer', points: 250, type: 'item' }
    ];
    
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserLoyalty,
  addPoints,
  redeemPoints,
  getRewards
};