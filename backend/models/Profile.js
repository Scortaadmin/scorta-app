const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    age: {
        type: Number,
        required: [true, 'Age is required'],
        min: 18,
        max: 100
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    price: {
        type: Number,
        min: 0
    },
    photos: [{
        type: String
    }],
    ethnicity: {
        type: String,
        trim: true
    },
    nationality: {
        type: String,
        trim: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    elite: {
        type: Boolean,
        default: false
    },
    coordinates: {
        lat: {
            type: Number,
            required: false
        },
        lng: {
            type: Number,
            required: false
        }
    },
    description: {
        type: String,
        maxlength: 1000
    },
    active: {
        type: Boolean,
        default: true
    },
    views: {
        type: Number,
        default: 0
    },
    clicks: {
        type: Number,
        default: 0
    },
    boostedUntil: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for geospatial queries
profileSchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 });

// Index for search
profileSchema.index({ name: 'text', city: 'text', ethnicity: 'text', nationality: 'text' });

// Method to check if profile is boosted
profileSchema.methods.isBoosted = function () {
    return this.boostedUntil && this.boostedUntil > new Date();
};

module.exports = mongoose.model('Profile', profileSchema);
