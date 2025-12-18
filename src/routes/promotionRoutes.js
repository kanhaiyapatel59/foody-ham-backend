const express = require('express');
const router = express.Router();
const {
  createPromotion,
  getPromotions,
  getActivePromotions,
  updatePromotion,
  deletePromotion,
  applyPromotion
} = require('../controllers/promotionController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/active', getActivePromotions);
router.post('/apply', protect, applyPromotion);

// Admin routes
router.use(protect);
router.use(admin);

router.route('/')
  .get(getPromotions)
  .post(createPromotion);

router.route('/:id')
  .put(updatePromotion)
  .delete(deletePromotion);

module.exports = router;