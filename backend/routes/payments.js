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

module.exports = router;
