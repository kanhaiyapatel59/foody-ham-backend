const Subscription = require('../models/Subscription');
const Product = require('../models/Product');


const createSubscription = async (req, res) => {
  try {
    console.log('Creating subscription with data:', req.body);
    
    const {
      planType,
      planName,
      items,
      deliveryAddress,
      deliveryTime,
      paymentMethod
    } = req.body;

    // Validate required fields
    if (!planType || !planName || !items || !deliveryAddress || !deliveryTime || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Calculate total price
    let totalPrice = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (product) {
        totalPrice += product.price * item.quantity;
      }
    }

    // Apply subscription discount (10% off for weekly, 15% off for monthly)
    const discount = planType === 'weekly' ? 0.1 : 0.15;
    totalPrice = totalPrice * (1 - discount);

    const subscription = new Subscription({
      user: req.user.id,
      planType,
      planName,
      items,
      deliveryAddress,
      deliveryTime,
      totalPrice,
      paymentMethod
    });

    subscription.calculateNextDelivery();
    await subscription.save();
    await subscription.populate('items.product', 'name price image');

    res.status(201).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user subscriptions
const getUserSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id })
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update subscription status
const updateSubscriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const subscription = await Subscription.findOne({
      _id: id,
      user: req.user.id
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    subscription.status = status;
    if (status === 'cancelled') {
      subscription.endDate = new Date();
    }

    await subscription.save();

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get subscription by ID
const getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('items.product', 'name price image description');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update subscription
const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const subscription = await Subscription.findOne({
      _id: id,
      user: req.user.id
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Recalculate total if items changed
    if (updates.items) {
      let totalPrice = 0;
      for (const item of updates.items) {
        const product = await Product.findById(item.product);
        if (product) {
          totalPrice += product.price * item.quantity;
        }
      }
      const discount = subscription.planType === 'weekly' ? 0.1 : 0.15;
      updates.totalPrice = totalPrice * (1 - discount);
    }

    Object.assign(subscription, updates);
    await subscription.save();
    await subscription.populate('items.product', 'name price image');

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createSubscription,
  getUserSubscriptions,
  updateSubscriptionStatus,
  getSubscriptionById,
  updateSubscription
};