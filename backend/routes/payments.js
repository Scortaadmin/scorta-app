const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Transaction = require('../models/Transaction');
const Profile = require('../models/Profile');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// @route   POST /api/payments/process
// @desc    Process a payment (boost, premium, etc.)
// @access  Private
router.post('/process',
    protect,
    [
        body('type').isIn(['boost', 'premium', 'verification', 'wallet_topup']).withMessage('Tipo de pago inválido'),
        body('amount').isNumeric().withMessage('Monto debe ser numérico'),
        body('paymentMethod').notEmpty().withMessage('Método de pago es requerido')
    ],
    validate,
    async (req, res, next) => {
        try {
            const { type, amount, paymentMethod, profileId, duration } = req.body;

            // Validate amount
            if (amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El monto debe ser mayor a 0'
                });
            }

            // If boosting a profile, verify it exists and user owns it
            if (type === 'boost' && profileId) {
                const profile = await Profile.findById(profileId);
                if (!profile) {
                    return res.status(404).json({
                        success: false,
                        message: 'Perfil no encontrado'
                    });
                }

                if (profile.user.toString() !== req.user._id.toString()) {
                    return res.status(403).json({
                        success: false,
                        message: 'No tienes permiso para impulsar este perfil'
                    });
                }

                // Calculate boost end date
                const boostDays = duration || 7;
                const boostedUntil = new Date();
                boostedUntil.setDate(boostedUntil.getDate() + boostDays);

                profile.boostedUntil = boostedUntil;
                await profile.save();
            }

            // Create transaction (in production, integrate with real payment gateway)
            const transaction = await Transaction.create({
                user: req.user._id,
                amount,
                type,
                status: 'completed', // Mock: instant approval
                paymentMethod: {
                    type: paymentMethod.type || 'card',
                    last4: paymentMethod.last4 || '****',
                    cardType: paymentMethod.cardType || 'visa'
                },
                metadata: {
                    profileId,
                    duration
                }
            });

            res.status(201).json({
                success: true,
                message: 'Pago procesado exitosamente',
                data: { transaction }
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   GET /api/payments/transactions
// @desc    Get user's transaction history
// @access  Private
router.get('/transactions', protect, async (req, res, next) => {
    try {
        const { limit = 50 } = req.query;

        const transactions = await Transaction.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        // Calculate total spent
        const totalSpent = transactions
            .filter(t => t.status === 'completed')
            .reduce((sum, t) => sum + t.amount, 0);

        res.json({
            success: true,
            count: transactions.length,
            totalSpent,
            data: { transactions }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/payments/transactions/:id
// @desc    Get specific transaction
// @access  Private
router.get('/transactions/:id', protect, async (req, res, next) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transacción no encontrada'
            });
        }

        // Verify ownership
        if (transaction.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para ver esta transacción'
            });
        }

        res.json({
            success: true,
            data: { transaction }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/payments/refund/:id
// @desc    Request refund for a transaction
// @access  Private
router.post('/refund/:id',
    protect,
    [
        body('reason').optional().trim().isLength({ max: 500 })
    ],
    validate,
    async (req, res, next) => {
        try {
            const { reason } = req.body;
            const transaction = await Transaction.findById(req.params.id);

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Transacción no encontrada'
                });
            }

            // Verify ownership
            if (transaction.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para solicitar reembolso de esta transacción'
                });
            }

            if (transaction.status === 'refunded') {
                return res.status(400).json({
                    success: false,
                    message: 'Esta transacción ya fue reembolsada'
                });
            }

            if (transaction.status !== 'completed') {
                return res.status(400).json({
                    success: false,
                    message: 'Solo se pueden reembolsar transacciones completadas'
                });
            }

            // Update transaction
            transaction.status = 'refunded';
            transaction.refundReason = reason;
            transaction.refundedAt = new Date();
            await transaction.save();

            res.json({
                success: true,
                message: 'Reembolso procesado exitosamente',
                data: { transaction }
            });
        } catch (error) {
            next(error);
        }
    }
);

// ================================
// STRIPE INTEGRATION
// ================================

const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;

// @route   POST /api/payments/create-payment-intent
// @desc    Create Stripe payment intent for Boost Elite
// @access  Private (Provider only)
router.post('/create-payment-intent',
    protect,
    async (req, res, next) => {
        try {
            if (!stripe) {
                return res.status(503).json({
                    success: false,
                    message: 'Stripe not configured. Please contact support.'
                });
            }

            const { planType, amount, duration } = req.body;

            if (!planType || !amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Plan type and amount are required'
                });
            }

            // Validate amount matches plan
            const validAmounts = {
                'weekly': 1999,      // $19.99
                'monthly': 4999,     // $49.99
                'quarterly': 12999   // $129.99
            };

            if (validAmounts[planType] !== parseInt(amount)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid amount for plan type'
                });
            }

            // Create payment intent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                metadata: {
                    userId: req.user._id.toString(),
                    planType: planType,
                    duration: duration || 7
                },
                description: `Boost Elite - ${planType}`,
                automatic_payment_methods: {
                    enabled: true
                }
            });

            res.json({
                success: true,
                data: {
                    clientSecret: paymentIntent.client_secret,
                    paymentIntentId: paymentIntent.id
                }
            });
        } catch (error) {
            console.error('Stripe error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating payment: ' + error.message
            });
        }
    }
);

// @route   POST /api/payments/confirm-boost
// @desc    Confirm payment and activate boost
// @access  Private (Provider only)
router.post('/confirm-boost',
    protect,
    async (req, res, next) => {
        try {
            const { paymentIntentId, planType, duration } = req.body;

            if (!paymentIntentId) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment intent ID required'
                });
            }

            // If Stripe is configured, verify payment
            if (stripe) {
                const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

                if (paymentIntent.status !== 'succeeded') {
                    return res.status(400).json({
                        success: false,
                        message: 'Payment not completed'
                    });
                }
            }

            // Find user's profile
            const profile = await Profile.findOne({ user: req.user._id });

            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: 'Profile not found'
                });
            }

            // Calculate boost duration
            const durationDays = parseInt(duration) || 7;
            const boostEndDate = new Date();
            boostEndDate.setDate(boostEndDate.getDate() + durationDays);

            // Activate boost
            profile.boostedUntil = boostEndDate;
            profile.elite = true;
            await profile.save();

            // Create transaction record
            await Transaction.create({
                user: req.user._id,
                amount: req.body.amount || 1999,
                type: 'boost',
                status: 'completed',
                paymentMethod: {
                    type: 'stripe',
                    last4: '****'
                },
                metadata: {
                    profileId: profile._id,
                    planType: planType,
                    duration: durationDays,
                    paymentIntentId: paymentIntentId
                }
            });

            res.json({
                success: true,
                message: 'Boost activated successfully!',
                data: {
                    boostedUntil: boostEndDate,
                    isElite: true
                }
            });
        } catch (error) {
            console.error('Error confirming boost:', error);
            res.status(500).json({
                success: false,
                message: 'Error activating boost: ' + error.message
            });
        }
    }
);

// @route   GET /api/payments/boost-status
// @desc    Get current boost status
// @access  Private (Provider only)
router.get('/boost-status',
    protect,
    async (req, res, next) => {
        try {
            const profile = await Profile.findOne({ user: req.user._id });

            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: 'Profile not found'
                });
            }

            const isActive = profile.boostedUntil && profile.boostedUntil > new Date();

            res.json({
                success: true,
                data: {
                    isActive: isActive,
                    boostedUntil: profile.boostedUntil,
                    elite: profile.elite,
                    daysRemaining: isActive
                        ? Math.ceil((profile.boostedUntil - new Date()) / (1000 * 60 * 60 * 24))
                        : 0
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
