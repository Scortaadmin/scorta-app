const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const User = require('../models/User');
const { generateToken, generateRefreshToken, protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register',
    authLimiter,
    [
        body('email').isEmail().withMessage('Proporciona un email válido'),
        body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
        body('role').optional().isIn(['client', 'provider']).withMessage('Rol inválido')
    ],
    validate,
    async (req, res, next) => {
        try {
            const { email, password, role, name, phone, city } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Este email ya está registrado'
                });
            }

            // Create user
            const user = await User.create({
                email,
                password,
                role: role || 'client',
                name,
                phone,
                city
            });

            // Generate tokens
            const token = generateToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            // Save refresh token
            user.refreshToken = refreshToken;
            await user.save();

            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        role: user.role,
                        name: user.name,
                        profileComplete: user.isProfileComplete()
                    },
                    token,
                    refreshToken
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login',
    authLimiter,
    [
        body('email').isEmail().withMessage('Proporciona un email válido'),
        body('password').notEmpty().withMessage('La contraseña es requerida')
    ],
    validate,
    async (req, res, next) => {
        try {
            const { email, password } = req.body;

            // Find user and include password field
            const user = await User.findOne({ email }).select('+password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Check password
            const isMatch = await user.matchPassword(password);

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Update last login
            user.lastLogin = Date.now();

            // Generate tokens
            const token = generateToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            // Save refresh token
            user.refreshToken = refreshToken;
            await user.save();

            res.json({
                success: true,
                message: 'Inicio de sesión exitoso',
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        role: user.role,
                        name: user.name,
                        phone: user.phone,
                        city: user.city,
                        avatar: user.avatar,
                        verified: user.verified,
                        profileComplete: user.isProfileComplete()
                    },
                    token,
                    refreshToken
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   POST /api/auth/logout
// @desc    Logout user (invalidate refresh token)
// @access  Private
router.post('/logout', protect, async (req, res, next) => {
    try {
        // Remove refresh token
        req.user.refreshToken = undefined;
        await req.user.save();

        res.json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private
router.get('/me', protect, async (req, res) => {
    res.json({
        success: true,
        data: {
            user: {
                id: req.user._id,
                email: req.user.email,
                role: req.user.role,
                name: req.user.name,
                phone: req.user.phone,
                city: req.user.city,
                avatar: req.user.avatar,
                verified: req.user.verified,
                profileComplete: req.user.isProfileComplete()
            }
        }
    });
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password',
    [
        body('email').isEmail().withMessage('Proporciona un email válido')
    ],
    validate,
    async (req, res, next) => {
        try {
            const { email } = req.body;

            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'No existe una cuenta con este email'
                });
            }

            // In production, send actual email with reset link
            // For now, just generate a token (this is a mock implementation)
            const resetToken = generateToken(user._id);

            res.json({
                success: true,
                message: 'Se ha enviado un enlace de recuperación a tu email',
                // Only for demo - remove in production
                resetToken
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
