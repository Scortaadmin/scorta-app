const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const Profile = require('../models/Profile');
const { protect } = require('../middleware/auth');

// @route   GET /api/favorites
// @desc    Get user's favorites
// @access  Private
router.get('/', protect, async (req, res, next) => {
    try {
        const favorites = await Favorite.find({ user: req.user._id })
            .populate({
                path: 'profile',
                populate: { path: 'user', select: 'name verified' }
            })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: favorites.length,
            data: { favorites }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/favorites/:profileId
// @desc    Add profile to favorites
// @access  Private
router.post('/:profileId', protect, async (req, res, next) => {
    try {
        const { profileId } = req.params;

        // Check if profile exists
        const profile = await Profile.findById(profileId);
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Perfil no encontrado'
            });
        }

        // Check if already favorited
        const existing = await Favorite.findOne({
            user: req.user._id,
            profile: profileId
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Este perfil ya está en tus favoritos'
            });
        }

        const favorite = await Favorite.create({
            user: req.user._id,
            profile: profileId
        });

        res.status(201).json({
            success: true,
            message: 'Agregado a favoritos',
            data: { favorite }
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/favorites/:profileId
// @desc    Remove profile from favorites
// @access  Private
router.delete('/:profileId', protect, async (req, res, next) => {
    try {
        const { profileId } = req.params;

        const favorite = await Favorite.findOneAndDelete({
            user: req.user._id,
            profile: profileId
        });

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: 'Favorito no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Eliminado de favoritos'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
