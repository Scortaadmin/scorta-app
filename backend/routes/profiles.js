const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const Profile = require('../models/Profile');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// @route   GET /api/profiles
// @desc    Get all profiles with filtering
// @access  Public
router.get('/',
    [
        query('city').optional().trim(),
        query('minPrice').optional().isNumeric(),
        query('maxPrice').optional().isNumeric(),
        query('ethnicity').optional().trim(),
        query('nationality').optional().trim(),
        query('verified').optional().isBoolean()
    ],
    async (req, res, next) => {
        try {
            const { city, minPrice, maxPrice, ethnicity, nationality, verified, search } = req.query;

            // Build query
            const query = { active: true };

            if (city && city !== 'all') query.city = city;
            if (ethnicity && ethnicity !== 'all') query.ethnicity = ethnicity;
            if (nationality && nationality !== 'all') query.nationality = nationality;
            if (verified === 'true') query.verified = true;

            if (minPrice || maxPrice) {
                query.price = {};
                if (minPrice) query.price.$gte = parseFloat(minPrice);
                if (maxPrice) query.price.$lte = parseFloat(maxPrice);
            }

            // Text search if provided
            if (search) {
                query.$text = { $search: search };
            }

            const profiles = await Profile.find(query)
                .populate('user', 'name email verified')
                .sort({ boostedUntil: -1, createdAt: -1 })
                .lean();

            res.json({
                success: true,
                count: profiles.length,
                data: { profiles }
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   GET /api/profiles/:id
// @desc    Get single profile
// @access  Public
router.get('/:id', async (req, res, next) => {
    try {
        const profile = await Profile.findById(req.params.id)
            .populate('user', 'name verified');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Perfil no encontrado'
            });
        }

        res.json({
            success: true,
            data: { profile }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/profiles
// @desc    Create new profile
// @access  Private (Provider only)
router.post('/',
    protect,
    authorize('provider', 'admin'),
    [
        body('name').trim().notEmpty().withMessage('Nombre es requerido'),
        body('age').isInt({ min: 18, max: 100 }).withMessage('Edad debe estar entre 18 y 100'),
        body('city').trim().notEmpty().withMessage('Ciudad es requerida'),
        body('price').optional().isNumeric().withMessage('Precio debe ser numérico')
    ],
    validate,
    async (req, res, next) => {
        try {
            const { name, age, city, price, ethnicity, nationality, description, coordinates } = req.body;

            // Check if user already has a profile
            const existingProfile = await Profile.findOne({ user: req.user._id });
            if (existingProfile) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya tienes un perfil creado. Usa la opción de editar.'
                });
            }

            const profile = await Profile.create({
                user: req.user._id,
                name,
                age,
                city,
                price,
                ethnicity,
                nationality,
                description,
                coordinates
            });

            res.status(201).json({
                success: true,
                message: 'Perfil creado exitosamente',
                data: { profile }
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   PUT /api/profiles/:id
// @desc    Update profile
// @access  Private (Owner or Admin)
router.put('/:id',
    protect,
    async (req, res, next) => {
        try {
            const profile = await Profile.findById(req.params.id);

            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: 'Perfil no encontrado'
                });
            }

            // Check ownership
            if (profile.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para modificar este perfil'
                });
            }

            const allowedUpdates = ['name', 'age', 'city', 'price', 'ethnicity', 'nationality', 'description', 'coordinates', 'active'];
            const updates = {};

            allowedUpdates.forEach(field => {
                if (req.body[field] !== undefined) {
                    updates[field] = req.body[field];
                }
            });

            const updatedProfile = await Profile.findByIdAndUpdate(
                req.params.id,
                updates,
                { new: true, runValidators: true }
            );

            res.json({
                success: true,
                message: 'Perfil actualizado exitosamente',
                data: { profile: updatedProfile }
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   DELETE /api/profiles/:id
// @desc    Delete profile
// @access  Private (Owner or Admin)
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const profile = await Profile.findById(req.params.id);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Perfil no encontrado'
            });
        }

        // Check ownership
        if (profile.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar este perfil'
            });
        }

        await Profile.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Perfil eliminado exitosamente'
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/profiles/:id/view
// @desc    Increment profile view count
// @access  Public
router.post('/:id/view', async (req, res, next) => {
    try {
        const profile = await Profile.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Perfil no encontrado'
            });
        }

        res.json({
            success: true,
            data: { views: profile.views }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
