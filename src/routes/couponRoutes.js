const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createCoupon,
  validateCoupon,
  applyCoupon,
  getAllCoupons,
  deleteCoupon
} = require('../controllers/couponController');

const router = express.Router();

router.post('/create', protect, admin, createCoupon);
router.post('/validate', protect, validateCoupon);
router.post('/apply', protect, applyCoupon);
router.get('/', protect, admin, getAllCoupons);
router.delete('/:id', protect, admin, deleteCoupon);

module.exports = router;