const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

// Initialize Firebase Admin
try {
    const { initializeFirebase } = require('./src/config/firebase');
    initializeFirebase();
} catch (error) {
    console.log('⚠️  Firebase initialization skipped:', error.message);
}


const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const feedbackRoutes = require('./src/routes/feedbackRoutes');
const wishlistRoutes = require('./src/routes/wishlistRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const couponRoutes = require('./src/routes/couponRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const groupOrderRoutes = require('./src/routes/groupOrderRoutes');
const reservationRoutes = require('./src/routes/reservationRoutes');
const foodDiaryRoutes = require('./src/routes/foodDiaryRoutes');
const promotionRoutes = require('./src/routes/promotionRoutes');
const loyaltyRoutes = require('./src/routes/loyaltyRoutes');
const spinRoutes = require('./src/routes/spinRoutes');

// Routes
app.get('/', (req, res) => {
    res.json({ 
        message: 'Welcome to Foody-Ham API',
        status: 'Server is running',
        version: '1.0.0'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/group-orders', groupOrderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/food-diary', foodDiaryRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/spin', spinRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!',
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route not found' 
    });
});

// Server port
const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 API available at: http://localhost:${PORT}`);
});
