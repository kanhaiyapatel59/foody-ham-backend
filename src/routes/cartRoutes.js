const express = require('express');
const router = express.Router();

const {
    getCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
} = require('../controllers/cartController'); 

const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getCart);

router.post('/', protect, addToCart); 

router.put('/:productId', protect, updateQuantity);

router.delete('/clear', protect, clearCart);

router.delete('/:productId', protect, removeFromCart);

module.exports = router;