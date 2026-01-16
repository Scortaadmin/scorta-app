const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
exports.generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Generate refresh token
exports.generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE
    });
};

// Protect routes - verify token
exports.protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No autorizado. Token no proporcionado.'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};

// Role-based authorization
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `El rol ${req.user.role} no tiene autorización para esta acción`
            });
        }
        next();
    };
};

// Check if user owns resource
exports.isOwner = (resourceUserField = 'user') => {
    return (req, res, next) => {
        // This middleware should be used after loading the resource
        if (!req.resource) {
            return res.status(500).json({
                success: false,
                message: 'Recurso no cargado'
            });
        }

        const resourceUserId = req.resource[resourceUserField].toString();
        const currentUserId = req.user._id.toString();

        if (resourceUserId !== currentUserId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para modificar este recurso'
            });
        }

        next();
    };
};
