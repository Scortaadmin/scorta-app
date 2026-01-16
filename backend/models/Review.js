const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5
    },
    text: {
        type: String,
        required: [true, 'Review text is required'],
        minlength: 10,
        maxlength: 1000
    },
    photos: [{
        type: String
    }],
    helpful: {
        type: Number,
        default: 0
    },
    notHelpful: {
        type: Number,
        default: 0
    },
    helpfulBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    notHelpfulBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

// Prevent duplicate reviews from same user for same profile
reviewSchema.index({ profile: 1, author: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
