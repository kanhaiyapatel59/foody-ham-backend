const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
    },
    name: {
        type: String,
        default: 'Anonymous',
        trim: true,
        maxlength: 100,
    },
    email: {
        type: String,
        trim: true,
    },
    submissionDate: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Feedback', feedbackSchema);