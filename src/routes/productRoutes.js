const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleFeatureStatus 
} = require('../controllers/productController'); 
const { protect, admin } = require('../middleware/authMiddleware'); 

router.get('/', getProducts);
router.get('/:id', getProduct);

// Admin Routes (Authenticated and Admin Role required)
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.put(
    '/feature/:id', 
    protect, 
    admin, 
   toggleFeatureStatus 
); 

module.exports = router;