const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: 0
    },
    type: {
        type: String,
        enum: ['boost', 'premium', 'wallet_topup', 'verification'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: {
            type: String,
            enum: ['card', 'wallet', 'paypal'],
            required: true
        },
        last4: String,
        cardType: String
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    refundReason: String,
    refundedAt: Date
}, {
    timestamps: true
});

// Index for user transaction history
transactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
