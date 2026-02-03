const express = require('express');
const {
  createSubscription,
  getUserSubscriptions,
  updateSubscriptionStatus,
  getSubscriptionById,
  updateSubscription
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); 

router.post('/', createSubscription);
router.get('/', getUserSubscriptions);
router.get('/:id', getSubscriptionById);
router.put('/:id', updateSubscription);
router.patch('/:id/status', updateSubscriptionStatus);

module.exports = router;