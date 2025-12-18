const Product = require('../models/Product');
const mongoose = require('mongoose');

// ==========================================================
// 1. GET ALL PRODUCTS (Includes featured, category, and search filters)
// (No change here)
// ==========================================================
exports.getProducts = async (req, res) => {
    try {
        const { 
            category, 
            search, 
            featured, 
            minPrice, 
            maxPrice, 
            ingredients, 
            sortBy, 
            sortOrder = 'asc',
            limit,
            page = 1
        } = req.query;
        
        let query = {};
        
        // Category filter
        if (category && category !== 'all') {
            query.category = category;
        }
        
        // Enhanced search - name, description, and ingredients
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { ingredients: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        
        // Ingredients filter
        if (ingredients) {
            const ingredientList = ingredients.split(',').map(ing => ing.trim());
            query.ingredients = { $in: ingredientList.map(ing => new RegExp(ing, 'i')) };
        }
        
        // Featured filter
        if (featured === 'true') {
            query.isFeatured = true;
        }
        
        // Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }
        
        // Build sort object
        let sortObj = {};
        if (sortBy) {
            switch (sortBy) {
                case 'price':
                    sortObj.price = 1; // Low to high
                    break;
                case 'price-desc':
                    sortObj.price = -1; // High to low
                    break;
                case 'name':
                    sortObj.name = 1;
                    break;
                case 'newest':
                    sortObj.createdAt = -1;
                    break;
                case 'featured':
                    sortObj.isFeatured = -1;
                    break;
                default:
                    sortObj.createdAt = -1;
            }
        } else {
            sortObj.createdAt = -1; // Default sort by newest
        }
        
        // Pagination
        const pageNum = parseInt(page);
        const limitNum = limit ? parseInt(limit) : 0;
        const skip = limitNum > 0 ? (pageNum - 1) * limitNum : 0;
        
        let productsQuery = Product.find(query).sort(sortObj);
        
        if (limitNum > 0) {
            productsQuery = productsQuery.skip(skip).limit(limitNum);
        }
        
        const products = await productsQuery;
        const totalProducts = await Product.countDocuments(query);
        
        res.status(200).json({
            success: true,
            count: products.length,
            total: totalProducts,
            page: pageNum,
            pages: limitNum > 0 ? Math.ceil(totalProducts / limitNum) : 1,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching products',
            error: error.message
        });
    }
};

// ==========================================================
// 2. GET SINGLE PRODUCT
// (No change here)
// ==========================================================
exports.getProduct = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: 'Product not found (Invalid ID format)'
            });
        }
        
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching single product',
            error: error.message
        });
    }
};

// ==========================================================
// 3. CREATE PRODUCT
// 🚨 FIX APPLIED HERE 🚨
// ==========================================================
exports.createProduct = async (req, res) => {
    try {
        // This is the line that was causing the crash if data was invalid
        const product = await Product.create(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        // --- FIX: Check for Mongoose Validation Errors (Bad Request) ---
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            
            // Return 400 Bad Request to the frontend with detailed error messages
            return res.status(400).json({
                success: false,
                message: messages.join('; ') || 'Validation failed for product data.',
                errors: messages // Send the array of errors
            });
        }
        
        // --- Handle all other true server errors (500) ---
        console.error("Product Creation Server Crash:", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during product creation',
            error: error.message
        });
    }
};

// ==========================================================
// 4. UPDATE PRODUCT
// (No change here)
// ==========================================================
exports.updateProduct = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: 'Product not found (Invalid ID format)'
            });
        }
        
        let product = await Product.findById(req.params.id);
        // ... (rest of the code for updateProduct)
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during product update',
            error: error.message
        });
    }
};

// ==========================================================
// 5. DELETE PRODUCT
// (No change here)
// ==========================================================
exports.deleteProduct = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: 'Product not found (Invalid ID format)'
            });
        }
        
        const product = await Product.findById(req.params.id);
        // ... (rest of the code for deleteProduct)
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        await product.deleteOne();
        
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during product deletion',
            error: error.message
        });
    }
};

// ==========================================================
// 6. TOGGLE FEATURE STATUS
// (No change here)
// ==========================================================
exports.toggleFeatureStatus = async (req, res) => {
    try {
        const productId = req.params.id;
        // ... (rest of the code for toggleFeatureStatus)
        const { isFeatured } = req.body; 

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: 'Invalid product ID' });
        }

        const product = await Product.findByIdAndUpdate(
            productId,
            { $set: { isFeatured: isFeatured } },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({
            success: true,
            message: `Product feature status updated to ${isFeatured}`,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while updating feature status',
            error: error.message
        });
    }
};