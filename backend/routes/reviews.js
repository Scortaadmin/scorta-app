const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const Review = require('../models/Review');
const Profile = require('../models/Profile');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// @route   GET /api/profiles/:profileId/reviews
// @desc    Get reviews for a profile
// @access  Public
router.get('/:profileId',
    async (req, res, next) => {
        try {
            const reviews = await Review.find({ profile: req.params.profileId })
                .populate('author', 'name avatar')
                .sort({ createdAt: -1 });

            // Calculate average rating
            const avgRating = reviews.length > 0
                ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
                : 0;

            res.json({
                success: true,
                count: reviews.length,
                averageRating: avgRating.toFixed(1),
                data: { reviews }
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   POST /api/profiles/:profileId/reviews
// @desc    Create a review
// @access  Private
router.post('/:profileId',
    protect,
    [
        body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating debe ser entre 1 y 5'),
        body('text').trim().isLength({ min: 10, max: 1000 }).withMessage('El comentario debe tener entre 10 y 1000 caracteres')
    ],
    validate,
    async (req, res, next) => {
        try {
            const { profileId } = req.params;
            const { rating, text, photos } = req.body;

            // Check if profile exists
            const profile = await Profile.findById(profileId);
            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: 'Perfil no encontrado'
                });
            }

            // Check if user already reviewed this profile
            const existing = await Review.findOne({
                profile: profileId,
                author: req.user._id
            });

            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya has dejado una reseña para este perfil'
                });
            }

            const review = await Review.create({
                profile: profileId,
                author: req.user._id,
                rating,
                text,
                photos: photos || []
            });

            await review.populate('author', 'name avatar');

            res.status(201).json({
                success: true,
                message: 'Reseña publicada exitosamente',
                data: { review }
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private (Author only)
router.put('/:id',
    protect,
    [
        body('rating').optional().isInt({ min: 1, max: 5 }),
        body('text').optional().trim().isLength({ min: 10, max: 1000 })
    ],
    validate,
    async (req, res, next) => {
        try {
            const review = await Review.findById(req.params.id);

            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: 'Reseña no encontrada'
                });
            }

            // Check if user is the author
            if (review.author.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para editar esta reseña'
                });
            }

            const { rating, text } = req.body;
            if (rating) review.rating = rating;
            if (text) review.text = text;

            await review.save();

            res.json({
                success: true,
                message: 'Reseña actualizada',
                data: { review }
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private (Author or Admin)
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Reseña no encontrada'
            });
        }

        // Check if user is the author or admin
        if (review.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar esta reseña'
            });
        }

        await Review.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Reseña eliminada'
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/reviews/:id/helpful
// @desc    Mark review as helpful or not helpful
// @access  Private
router.post('/:id/helpful',
    protect,
    [
        body('helpful').isBoolean().withMessage('Campo "helpful" es requerido')
    ],
    validate,
    async (req, res, next) => {
        try {
            const review = await Review.findById(req.params.id);

            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: 'Reseña no encontrada'
                });
            }

            const { helpful } = req.body;
            const userId = req.user._id;

            // Remove from both arrays if already marked
            review.helpfulBy = review.helpfulBy.filter(id => id.toString() !== userId.toString());
            review.notHelpfulBy = review.notHelpfulBy.filter(id => id.toString() !== userId.toString());

            // Add to appropriate array
            if (helpful) {
                review.helpfulBy.push(userId);
                review.helpful = review.helpfulBy.length;
            } else {
                review.notHelpfulBy.push(userId);
                review.notHelpful = review.notHelpfulBy.length;
            }

            await review.save();

            res.json({
                success: true,
                message: helpful ? 'Marcado como útil' : 'Marcado como no útil',
                data: {
                    helpful: review.helpful,
                    notHelpful: review.notHelpful
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
