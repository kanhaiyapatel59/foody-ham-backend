const express = require('express');
const { createReview, getProductReviews, markHelpful, upload } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, upload.array('photos', 5), createReview);
router.get('/product/:productId', getProductReviews);
router.put('/:reviewId/helpful', protect, markHelpful);

module.exports = router;