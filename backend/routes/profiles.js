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

// @route   GET /api/profiles/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', protect, async (req, res, next) => {
    try {
        const profile = await Profile.findOne({ user: req.user._id })
            .populate('user', 'name email verified');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'No tienes un perfil creado'
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

            const allowedUpdates = ['name', 'age', 'city', 'price', 'ethnicity', 'nationality', 'description', 'coordinates', 'active', 'phone'];
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

// @route   PUT /api/profiles/:id/description
// @desc    Update profile description
// @access  Private (Owner only)
router.put('/:id/description',
    protect,
    [
        body('description')
            .trim()
            .isLength({ min: 50, max: 1000 })
            .withMessage('La descripción debe tener entre 50 y 1000 caracteres')
    ],
    validate,
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

            profile.description = req.body.description;
            await profile.save();

            res.json({
                success: true,
                message: 'Descripción actualizada exitosamente',
                data: { description: profile.description }
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   PUT /api/profiles/:id/photos
// @desc    Add photos to profile
// @access  Private (Owner only)
router.put('/:id/photos',
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

            const { photos } = req.body;

            if (!Array.isArray(photos)) {
                return res.status(400).json({
                    success: false,
                    message: 'Photos debe ser un array'
                });
            }

            // Add new photos (max 10 total)
            profile.photos = [...new Set([...profile.photos, ...photos])].slice(0, 10);
            await profile.save();

            res.json({
                success: true,
                message: 'Fotos actualizadas exitosamente',
                data: { photos: profile.photos }
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   DELETE /api/profiles/:id/photos/:photoIndex
// @desc    Remove photo from profile
// @access  Private (Owner only)
router.delete('/:id/photos/:photoIndex',
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

            const index = parseInt(req.params.photoIndex);

            if (isNaN(index) || index < 0 || index >= profile.photos.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Índice de foto inválido'
                });
            }

            profile.photos.splice(index, 1);
            await profile.save();

            res.json({
                success: true,
                message: 'Foto eliminada exitosamente',
                data: { photos: profile.photos }
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
