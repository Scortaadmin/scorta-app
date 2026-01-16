const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// @route   GET /api/messages/conversations
// @desc    Get all user's conversations
// @access  Private
router.get('/conversations', protect, async (req, res, next) => {
    try {
        // Get unique conversation partners
        const messages = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: req.user._id },
                        { recipient: req.user._id }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$sender', req.user._id] },
                            '$recipient',
                            '$sender'
                        ]
                    },
                    lastMessage: { $first: '$$ROOT' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$recipient', req.user._id] },
                                        { $eq: ['$read', false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        // Populate user details
        const conversations = await User.populate(messages, {
            path: '_id',
            select: 'name avatar email'
        });

        res.json({
            success: true,
            count: conversations.length,
            data: { conversations }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/messages/:userId
// @desc    Get messages with a specific user
// @access  Private
router.get('/:userId', protect, async (req, res, next) => {
    try {
        const { userId } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: req.user._id, recipient: userId },
                { sender: userId, recipient: req.user._id }
            ]
        })
            .sort({ createdAt: 1 })
            .populate('sender', 'name avatar')
            .populate('recipient', 'name avatar');

        // Mark messages as read
        await Message.updateMany(
            {
                sender: userId,
                recipient: req.user._id,
                read: false
            },
            {
                $set: { read: true, readAt: new Date() }
            }
        );

        res.json({
            success: true,
            count: messages.length,
            data: { messages }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/',
    protect,
    [
        body('recipient').notEmpty().withMessage('Destinatario es requerido'),
        body('text').trim().isLength({ min: 1, max: 2000 }).withMessage('El mensaje debe tener entre 1 y 2000 caracteres')
    ],
    validate,
    async (req, res, next) => {
        try {
            const { recipient, text } = req.body;

            // Check if recipient exists
            const recipientUser = await User.findById(recipient);
            if (!recipientUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario destinatario no encontrado'
                });
            }

            // Cannot send message to yourself
            if (recipient === req.user._id.toString()) {
                return res.status(400).json({
                    success: false,
                    message: 'No puedes enviarte mensajes a ti mismo'
                });
            }

            const message = await Message.create({
                sender: req.user._id,
                recipient,
                text
            });

            await message.populate('sender', 'name avatar');
            await message.populate('recipient', 'name avatar');

            res.status(201).json({
                success: true,
                message: 'Mensaje enviado',
                data: { message }
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read', protect, async (req, res, next) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Mensaje no encontrado'
            });
        }

        // Only recipient can mark as read
        if (message.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para marcar este mensaje'
            });
        }

        message.read = true;
        message.readAt = new Date();
        await message.save();

        res.json({
            success: true,
            message: 'Mensaje marcado como leído',
            data: { message }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
