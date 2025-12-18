const express = require('express');
const router = express.Router();
const Feedback = require('../models/FeedbackModel'); 
// Assuming the middleware path is correct. You MUST import them here:
const { protect, admin } = require('../middleware/authMiddleware'); 

// =========================================================
// 1. POST /api/feedback (SUBMISSION - Already functional)
// =========================================================
router.post('/', async (req, res) => {
    const { rating, comment, name, email } = req.body;
    if (!rating || !comment) {
        return res.status(400).json({ success: false, message: 'Rating and comment are required.' });
    }

    try {
        const newFeedback = new Feedback({
            rating: parseInt(rating),
            comment,
            name,
            email,
        });

        await newFeedback.save();
        res.status(201).json({ 
            success: true, 
            message: 'Feedback received successfully!', 
            data: { id: newFeedback._id } 
        });

    } catch (error) {
        console.error('Error saving feedback:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Internal server error during submission.' });
    }
});


// =========================================================
// 2. GET /api/feedback (RETRIEVAL - NEW ROUTE FOR ADMIN)
// =========================================================
router.get('/', protect, admin, async (req, res) => {
    try {
        // Find all feedback documents, sorted by creation date (newest first)
        const feedbackList = await Feedback.find({})
            .sort({ createdAt: -1 })
            .select('-__v'); 

        res.status(200).json({
            success: true,
            count: feedbackList.length,
            data: feedbackList,
        });
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ success: false, message: 'Server error while fetching feedback.' });
    }
});


module.exports = router;