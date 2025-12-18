const express = require('express');
const { 
  canSpin, 
  spinWheel, 
  getSpinHistory, 
  getSpinConfig, 
  updateSpinConfig 
} = require('../controllers/spinController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// User routes
router.get('/can-spin', protect, canSpin);
router.post('/spin', protect, spinWheel);
router.get('/history', protect, getSpinHistory);

// Admin routes
router.get('/admin/config', protect, admin, getSpinConfig);
router.put('/admin/config', protect, admin, updateSpinConfig);

module.exports = router;