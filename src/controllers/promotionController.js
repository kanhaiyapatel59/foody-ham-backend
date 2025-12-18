const Promotion = require('../models/Promotion');
const Product = require('../models/Product');

// Create promotion
exports.createPromotion = async (req, res) => {
  try {
    const promotion = new Promotion(req.body);
    await promotion.save();
    await promotion.populate('applicableProducts');
    
    res.status(201).json({
      success: true,
      data: promotion
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all promotions
exports.getPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find()
      .populate('applicableProducts')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: promotions
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get active promotions
exports.getActivePromotions = async (req, res) => {
  try {
    const now = new Date();
    const promotions = await Promotion.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate('applicableProducts');

    res.json({
      success: true,
      data: promotions
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update promotion
exports.updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('applicableProducts');

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    res.json({
      success: true,
      data: promotion
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete promotion
exports.deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    res.json({
      success: true,
      message: 'Promotion deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Apply promotion to order
exports.applyPromotion = async (req, res) => {
  try {
    const { promotionId, orderAmount, products } = req.body;
    
    const promotion = await Promotion.findById(promotionId);
    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    const now = new Date();
    if (!promotion.isActive || promotion.startDate > now || promotion.endDate < now) {
      return res.status(400).json({
        success: false,
        message: 'Promotion is not active'
      });
    }

    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Promotion usage limit reached'
      });
    }

    if (orderAmount < promotion.minimumOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is $${promotion.minimumOrderAmount}`
      });
    }

    let discount = 0;
    switch (promotion.type) {
      case 'percentage':
        discount = (orderAmount * promotion.value) / 100;
        break;
      case 'fixed_amount':
        discount = promotion.value;
        break;
      case 'bogo':
        // Buy one get one logic would be handled in frontend
        discount = 0;
        break;
      case 'flash_sale':
        discount = (orderAmount * promotion.value) / 100;
        break;
    }

    // Update usage count
    promotion.usageCount += 1;
    await promotion.save();

    res.json({
      success: true,
      data: {
        discount: Math.min(discount, orderAmount),
        promotion
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};