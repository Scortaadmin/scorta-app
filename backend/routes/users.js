const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
    res.json({
        success: true,
        data: { user: req.user }
    });
});

// @route   PUT /api/users/me
// @desc    Update current user profile
// @access  Private
router.put('/me',
    protect,
    [
        body('email').optional().isEmail().withMessage('Email inválido'),
        body('name').optional().trim().notEmpty().withMessage('Nombre no puede estar vacío'),
        body('phone').optional().trim(),
        body('city').optional().trim()
    ],
    validate,
    async (req, res, next) => {
        try {
            const { email, name, phone, city } = req.body;

            // Check if email is being changed and if it's already taken
            if (email && email !== req.user.email) {
                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        message: 'Este email ya está en uso'
                    });
                }
            }

            // Update user
            const updateFields = {};
            if (email) updateFields.email = email;
            if (name) updateFields.name = name;
            if (phone !== undefined) updateFields.phone = phone;
            if (city) updateFields.city = city;

            const user = await User.findByIdAndUpdate(
                req.user._id,
                updateFields,
                { new: true, runValidators: true }
            );

            // Check if profile is complete
            user.profileComplete = user.isProfileComplete();
            await user.save();

            res.json({
                success: true,
                message: 'Perfil actualizado exitosamente',
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   DELETE /api/users/me
// @desc    Delete current user account
// @access  Private
router.delete('/me', protect, async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.user._id);

        res.json({
            success: true,
            message: 'Cuenta eliminada exitosamente'
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin only)
router.get('/:id', protect, authorize('admin'), async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), async (req, res, next) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            data: { users }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
