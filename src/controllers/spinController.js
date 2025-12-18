const SpinWheel = require('../models/SpinWheel');
const SpinConfig = require('../models/SpinConfig');
const Coupon = require('../models/Coupon');

// Check if user can spin
const canSpin = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastSpin = await SpinWheel.findOne({
      user: userId,
      lastSpinDate: { $gte: today }
    });

    res.json({ canSpin: !lastSpin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Spin the wheel
const spinWheel = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already spun today
    const lastSpin = await SpinWheel.findOne({
      user: userId,
      lastSpinDate: { $gte: today }
    });

    if (lastSpin) {
      return res.status(400).json({ message: 'Already spun today. Try again tomorrow!' });
    }

    // Get spin configuration
    let config = await SpinConfig.findOne();
    if (!config) {
      config = new SpinConfig();
      await config.save();
    }

    if (!config.isEnabled) {
      return res.status(400).json({ message: 'Spin & Win is currently disabled' });
    }

    // Calculate random reward based on weights
    const rewards = [];
    if (config.rewards.freeDelivery.enabled) {
      for (let i = 0; i < config.rewards.freeDelivery.weight; i++) {
        rewards.push({ type: 'freeDelivery', value: 0, name: 'Free Delivery' });
      }
    }
    if (config.rewards.discount10.enabled) {
      for (let i = 0; i < config.rewards.discount10.weight; i++) {
        rewards.push({ type: 'discount', value: 10, name: '10% Discount' });
      }
    }
    if (config.rewards.discount20.enabled) {
      for (let i = 0; i < config.rewards.discount20.weight; i++) {
        rewards.push({ type: 'discount', value: 20, name: '20% Discount' });
      }
    }
    if (config.rewards.discount30.enabled) {
      for (let i = 0; i < config.rewards.discount30.weight; i++) {
        rewards.push({ type: 'discount', value: 30, name: '30% Discount' });
      }
    }
    if (config.rewards.freeItem.enabled) {
      for (let i = 0; i < config.rewards.freeItem.weight; i++) {
        rewards.push({ 
          type: 'freeItem', 
          value: config.rewards.freeItem.itemValue, 
          name: config.rewards.freeItem.itemName 
        });
      }
    }

    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];

    // Generate coupon code
    const couponCode = `SPIN${randomReward.type.toUpperCase()}${Date.now().toString().slice(-4)}`;

    // Create actual coupon in the existing coupon system
    let discountType, discountValue;
    if (randomReward.type === 'freeDelivery') {
      discountType = 'fixed';
      discountValue = 5; // Assuming delivery cost is $5
    } else if (randomReward.type === 'discount') {
      discountType = 'percentage';
      discountValue = randomReward.value;
    } else if (randomReward.type === 'freeItem') {
      discountType = 'fixed';
      discountValue = randomReward.value;
    }

    const coupon = new Coupon({
      code: couponCode,
      discountType,
      discountValue,
      minimumOrderAmount: 0,
      usageLimit: 1,
      isActive: true,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      createdBy: userId
    });

    await coupon.save();

    // Save spin result
    const spinResult = new SpinWheel({
      user: userId,
      lastSpinDate: new Date(),
      reward: randomReward.name,
      rewardValue: randomReward.value,
      couponCode
    });

    await spinResult.save();

    res.json({
      reward: randomReward.name,
      value: randomReward.value,
      couponCode,
      message: `Congratulations! You won ${randomReward.name}!`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's spin history
const getSpinHistory = async (req, res) => {
  try {
    const history = await SpinWheel.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get spin configuration
const getSpinConfig = async (req, res) => {
  try {
    let config = await SpinConfig.findOne();
    if (!config) {
      config = new SpinConfig();
      await config.save();
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update spin configuration
const updateSpinConfig = async (req, res) => {
  try {
    let config = await SpinConfig.findOne();
    if (!config) {
      config = new SpinConfig();
    }

    Object.assign(config, req.body);
    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  canSpin,
  spinWheel,
  getSpinHistory,
  getSpinConfig,
  updateSpinConfig
};