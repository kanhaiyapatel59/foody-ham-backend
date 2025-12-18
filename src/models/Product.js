const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop'
    },
    category: {
        type: String,
        required: true,
        enum: ['burgers', 'pizza', 'pasta', 'salads', 'desserts', 'appetizers', 'seafood', 'beverages', 'chicken', 'steaks', 'sandwiches', 'soups', 'breakfast', 'healthy', 'other']
    },
    ingredients: [String],
    nutritionalInfo: {
        calories: Number,
        protein: String,
        carbs: String,
        fat: String
    },
    availability: {
        type: Boolean,
        default: true
    },
    stock: {
        type: Number,
        default: 100,
        min: 0
    },
    lowStockThreshold: {
        type: Number,
        default: 10
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;