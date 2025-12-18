const express = require('express');
const { getUserLoyalty, addPoints, redeemPoints, getRewards } = require('../controllers/loyaltyController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getUserLoyalty);
router.post('/add-points', protect, addPoints);
router.post('/redeem', protect, redeemPoints);
router.get('/rewards', protect, getRewards);

module.exports = router;