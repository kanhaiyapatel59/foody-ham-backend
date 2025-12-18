const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const { getSalesAnalytics } = require('../controllers/analyticsController');

const router = express.Router();

router.get('/sales', protect, admin, getSalesAnalytics);

module.exports = router;