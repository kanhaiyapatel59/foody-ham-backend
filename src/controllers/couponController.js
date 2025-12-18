const Coupon = require('../models/Coupon');

// Create coupon (Admin only)
const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minimumOrderAmount, maxDiscountAmount, usageLimit, expiryDate } = req.body;
    
    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minimumOrderAmount,
      maxDiscountAmount,
      usageLimit,
      expiryDate,
      createdBy: req.user.id
    });

    await coupon.save();
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Validate coupon
const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true,
      expiryDate: { $gt: new Date() }
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit exceeded' });
    }

    if (orderAmount < coupon.minimumOrderAmount) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum order amount of $${coupon.minimumOrderAmount} required` 
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({ 
      success: true, 
      coupon: {
        code: coupon.code,
        discountAmount: Math.min(discountAmount, orderAmount),
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Apply coupon (increment usage count)
const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    
    const coupon = await Coupon.findOneAndUpdate(
      { code: code.toUpperCase(), isActive: true },
      { $inc: { usedCount: 1 } },
      { new: true }
    );

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    res.json({ success: true, message: 'Coupon applied successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all coupons (Admin only)
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().populate('createdBy', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete coupon (Admin only)
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCoupon,
  validateCoupon,
  applyCoupon,
  getAllCoupons,
  deleteCoupon
};