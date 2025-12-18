const mongoose = require('mongoose');

const shareSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  platform: {
    type: String,
    enum: ['facebook', 'twitter', 'instagram', 'whatsapp', 'email', 'copy'],
    required: true
  },
  message: String,
  sharedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Share', shareSchema);