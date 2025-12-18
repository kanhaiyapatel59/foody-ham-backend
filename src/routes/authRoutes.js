const express = require('express');
const router = express.Router();
// ✅ Import the new changePassword controller function
const { 
    register, 
    login, 
    getProfile, 
    updateProfile, 
    changePassword,
    googleAuth,
    socialAuth 
} = require('../controllers/authController'); 
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/social', socialAuth);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword); 

module.exports = router;