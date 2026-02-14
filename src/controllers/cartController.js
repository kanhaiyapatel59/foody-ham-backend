const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// ✅ Helper: get or create cart (NO populate)
const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
    }

    return cart;
};

// ===============================
// GET CART
// ===============================
exports.getCart = async (req, res) => {
    try {
        const cart = await getOrCreateCart(req.user.id);

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ===============================
// ADD TO CART  ✅ FIXED
// ===============================
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const userId = req.user.id;
        console.log('AddToCart called:', { productId, quantity, userId });

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const cart = await getOrCreateCart(userId);

        const existingItem = cart.items.find(
            item => item.product.toString() === productId
        );

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > 10) {
                return res.status(400).json({
                    success: false,
                    message: '⚠️ Maximum quantity limit reached! You can only add up to 10 items of this product.'
                });
            }
            existingItem.quantity = newQuantity;
        } else {
            if (quantity > 10) {
                return res.status(400).json({
                    success: false,
                    message: '⚠️ Maximum quantity limit is 10 items per product.'
                });
            }
            cart.items.push({
                product: product._id,
                name: product.name,       
                image: product.image,     
                price: product.price,     
                quantity
            });
        }

        console.log('About to save cart:', cart.toObject());
        const savedCart = await cart.save();
        console.log('Cart saved to DB:', savedCart._id, 'Items count:', savedCart.items.length);
        
        // Verify it's actually in the database
        const verifyCart = await Cart.findById(savedCart._id);
        console.log('Verification - Cart exists in DB:', !!verifyCart, verifyCart ? verifyCart.items.length : 0);

        res.status(200).json({
            success: true,
            data: savedCart
        });

    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (quantity > 10) {
            return res.status(400).json({
                success: false,
                message: '⚠️ Maximum quantity limit is 10 items per product.'
            });
        }

        const cart = await getOrCreateCart(req.user.id);

        const item = cart.items.find(
            item => item.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        item.quantity = quantity;
        await cart.save();

        res.status(200).json({
            success: true,
            data: cart
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const cart = await getOrCreateCart(req.user.id);

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        await cart.save();

        res.status(200).json({
            success: true,
            data: cart
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ===============================
// CLEAR CART
// ===============================
exports.clearCart = async (req, res) => {
    try {
        const cart = await getOrCreateCart(req.user.id);

        cart.items = [];
        await cart.save();

        res.status(200).json({
            success: true,
            data: cart
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
