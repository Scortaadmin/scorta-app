const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },
    role: {
        type: String,
        enum: ['client', 'provider', 'admin'],
        default: 'client'
    },
    name: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        default: ''
    },
    verified: {
        type: Boolean,
        default: false
    },
    profileComplete: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    refreshToken: {
        type: String,
        select: false
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if profile is complete
userSchema.methods.isProfileComplete = function () {
    return !!(this.name && this.phone && this.city);
};

module.exports = mongoose.model('User', userSchema);
