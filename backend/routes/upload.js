const express = require('express');
const router = express.Router();
const { upload, setUploadType } = require('../config/upload');
const { protect } = require('../middleware/auth');

// @route   POST /api/upload/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar',
    protect,
    setUploadType('avatars'),
    upload.single('avatar'),
    (req, res) => {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se recibió ningún archivo'
            });
        }

        const fileUrl = `/uploads/avatars/${req.file.filename}`;

        res.json({
            success: true,
            message: 'Avatar subido exitosamente',
            data: {
                filename: req.file.filename,
                url: fileUrl,
                size: req.file.size
            }
        });
    }
);

// @route   POST /api/upload/profile-photos
// @desc    Upload profile photos (up to 5)
// @access  Private
router.post('/profile-photos',
    protect,
    setUploadType('profiles'),
    upload.array('photos', 5),
    (req, res) => {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se recibieron archivos'
            });
        }

        const fileUrls = req.files.map(file => ({
            filename: file.filename,
            url: `/uploads/profiles/${file.filename}`,
            size: file.size
        }));

        res.json({
            success: true,
            message: `${req.files.length} foto(s) subida(s) exitosamente`,
            data: { photos: fileUrls }
        });
    }
);

// @route   POST /api/upload/review-photos
// @desc    Upload review photos (up to 3)
// @access  Private
router.post('/review-photos',
    protect,
    setUploadType('reviews'),
    upload.array('photos', 3),
    (req, res) => {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se recibieron archivos'
            });
        }

        const fileUrls = req.files.map(file => ({
            filename: file.filename,
            url: `/uploads/reviews/${file.filename}`,
            size: file.size
        }));

        res.json({
            success: true,
            message: `${req.files.length} foto(s) subida(s) exitosamente`,
            data: { photos: fileUrls }
        });
    }
);

module.exports = router;
