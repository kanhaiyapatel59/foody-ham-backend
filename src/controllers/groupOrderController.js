const GroupOrder = require('../models/GroupOrder');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Create group order
exports.createGroupOrder = async (req, res) => {
  try {
    const { name, description, orderDeadline, deliveryAddress } = req.body;
    
    const groupOrder = new GroupOrder({
      name,
      description,
      creator: req.user.id,
      orderDeadline: new Date(orderDeadline),
      deliveryAddress,
      participants: [{
        user: req.user.id,
        name: req.user.name,
        items: [],
        totalAmount: 0
      }]
    });

    await groupOrder.save();
    await groupOrder.populate('creator', 'name email');
    
    res.status(201).json({
      success: true,
      data: groupOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Join group order
exports.joinGroupOrder = async (req, res) => {
  try {
    const { groupOrderId } = req.params;
    
    const groupOrder = await GroupOrder.findById(groupOrderId);
    if (!groupOrder) {
      return res.status(404).json({
        success: false,
        message: 'Group order not found'
      });
    }

    const existingParticipant = groupOrder.participants.find(
      p => p.user.toString() === req.user.id
    );

    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        message: 'Already joined this group order'
      });
    }

    groupOrder.participants.push({
      user: req.user.id,
      name: req.user.name,
      items: [],
      totalAmount: 0
    });

    await groupOrder.save();
    
    res.json({
      success: true,
      data: groupOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Add item to group order
exports.addItemToGroupOrder = async (req, res) => {
  try {
    const { groupOrderId } = req.params;
    const { productId, quantity } = req.body;

    const groupOrder = await GroupOrder.findById(groupOrderId);
    const product = await Product.findById(productId);

    if (!groupOrder || !product) {
      return res.status(404).json({
        success: false,
        message: 'Group order or product not found'
      });
    }

    const participant = groupOrder.participants.find(
      p => p.user.toString() === req.user.id
    );

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: 'Not a participant in this group order'
      });
    }

    const existingItem = participant.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      participant.items.push({
        product: productId,
        quantity,
        price: product.price
      });
    }

    participant.totalAmount = participant.items.reduce(
      (total, item) => total + (item.price * item.quantity), 0
    );

    groupOrder.totalAmount = groupOrder.participants.reduce(
      (total, p) => total + p.totalAmount, 0
    );

    await groupOrder.save();
    
    res.json({
      success: true,
      data: groupOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Add voting item
exports.addVotingItem = async (req, res) => {
  try {
    const { groupOrderId } = req.params;
    const { productId } = req.body;

    const groupOrder = await GroupOrder.findById(groupOrderId);
    if (!groupOrder) {
      return res.status(404).json({
        success: false,
        message: 'Group order not found'
      });
    }

    const existingVotingItem = groupOrder.votingItems.find(
      item => item.product.toString() === productId
    );

    if (existingVotingItem) {
      return res.status(400).json({
        success: false,
        message: 'Item already in voting list'
      });
    }

    groupOrder.votingItems.push({
      product: productId,
      votes: [],
      addedBy: req.user.id
    });

    await groupOrder.save();
    
    res.json({
      success: true,
      data: groupOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Vote on item
exports.voteOnItem = async (req, res) => {
  try {
    const { groupOrderId, votingItemId } = req.params;
    const { vote } = req.body;

    const groupOrder = await GroupOrder.findById(groupOrderId);
    if (!groupOrder) {
      return res.status(404).json({
        success: false,
        message: 'Group order not found'
      });
    }

    const votingItem = groupOrder.votingItems.id(votingItemId);
    if (!votingItem) {
      return res.status(404).json({
        success: false,
        message: 'Voting item not found'
      });
    }

    const existingVote = votingItem.votes.find(
      v => v.user.toString() === req.user.id
    );

    if (existingVote) {
      existingVote.vote = vote;
    } else {
      votingItem.votes.push({
        user: req.user.id,
        vote
      });
    }

    await groupOrder.save();
    
    res.json({
      success: true,
      data: groupOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get group orders
exports.getGroupOrders = async (req, res) => {
  try {
    const groupOrders = await GroupOrder.find({
      $or: [
        { creator: req.user.id },
        { 'participants.user': req.user.id }
      ]
    })
    .populate('creator', 'name email')
    .populate('participants.user', 'name email')
    .populate('votingItems.product')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: groupOrders
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get single group order
exports.getGroupOrder = async (req, res) => {
  try {
    const groupOrder = await GroupOrder.findById(req.params.groupOrderId)
      .populate('creator', 'name email')
      .populate('participants.user', 'name email')
      .populate('participants.items.product')
      .populate('votingItems.product')
      .populate('votingItems.addedBy', 'name');

    if (!groupOrder) {
      return res.status(404).json({
        success: false,
        message: 'Group order not found'
      });
    }

    res.json({
      success: true,
      data: groupOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};