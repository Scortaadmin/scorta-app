/* ========================================
   SCORTA - Authentication Module
   Handles user authentication and session management
======================================== */

// Authentication State
const AuthModule = {
    // Check if user is logged in
    isAuthenticated: function () {
        return localStorage.getItem('scorta_auth_token') !== null;
    },

    // Get current user data
    getCurrentUser: function () {
        const userStr = localStorage.getItem('scorta_current_user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Get user role (client, provider, or admin)
    getUserRole: function () {
        const user = this.getCurrentUser();
        return user ? user.role : null;
    },

    // Check if current user is admin
    isAdmin: function () {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    },

    // Check if current user is client
    isClient: function () {
        const user = this.getCurrentUser();
        return user && user.role === 'client';
    },

    // Check if current user is provider
    isProvider: function () {
        const user = this.getCurrentUser();
        return user && user.role === 'provider';
    },

    // Login user
    loginUser: function (email, password, rememberMe = false) {
        // Get all users from storage
        const users = JSON.parse(localStorage.getItem('scorta_users')) || [];

        // Find user by email
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        // Verify password (in production, use proper hashing)
        if (user.password !== password) {
            return { success: false, message: 'Contraseña incorrecta' };
        }

        // Create session
        const token = this._generateToken();
        localStorage.setItem('scorta_auth_token', token);
        localStorage.setItem('scorta_current_user', JSON.stringify(user));

        if (rememberMe) {
            localStorage.setItem('scorta_remember_me', 'true');
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        const userIndex = users.findIndex(u => u.email === email);
        users[userIndex] = user;
        localStorage.setItem('scorta_users', JSON.stringify(users));

        return { success: true, user: user };
    },

    // Register new user
    registerUser: function (userData) {
        const users = JSON.parse(localStorage.getItem('scorta_users')) || [];

        // Check if email already exists
        if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
            return { success: false, message: 'Este email ya está registrado' };
        }

        // Create new user
        const newUser = {
            id: 'user_' + Date.now(),
            email: userData.email,
            password: userData.password, // In production, hash this!
            role: userData.role || 'client',
            name: userData.name || '',
            phone: userData.phone || '',
            city: userData.city || '',
            verified: false,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            profileComplete: false
        };

        users.push(newUser);
        localStorage.setItem('scorta_users', JSON.stringify(users));

        // Auto-login after registration
        const token = this._generateToken();
        localStorage.setItem('scorta_auth_token', token);
        localStorage.setItem('scorta_current_user', JSON.stringify(newUser));

        return { success: true, user: newUser };
    },

    // Logout user
    logoutUser: function () {
        localStorage.removeItem('scorta_auth_token');
        localStorage.removeItem('scorta_current_user');

        // Clear remember me if not set
        if (!localStorage.getItem('scorta_remember_me')) {
            localStorage.removeItem('scorta_last_email');
        }
    },

    // Update user profile
    updateUserProfile: function (updates) {
        const user = this.getCurrentUser();
        if (!user) return { success: false, message: 'No hay sesión activa' };

        const users = JSON.parse(localStorage.getItem('scorta_users')) || [];
        const userIndex = users.findIndex(u => u.id === user.id);

        if (userIndex === -1) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        // Update user data
        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem('scorta_users', JSON.stringify(users));
        localStorage.setItem('scorta_current_user', JSON.stringify(users[userIndex]));

        return { success: true, user: users[userIndex] };
    },

    // Check if profile is complete
    isProfileComplete: function () {
        const user = this.getCurrentUser();
        if (!user) return false;

        const requiredFields = ['name', 'phone', 'city'];
        return requiredFields.every(field => user[field] && user[field].trim() !== '');
    },

    // Mark profile as complete
    completeProfile: function (profileData) {
        return this.updateUserProfile({
            ...profileData,
            profileComplete: true
        });
    },

    // Request password reset (simulation)
    requestPasswordReset: function (email) {
        const users = JSON.parse(localStorage.getItem('scorta_users')) || [];
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            return { success: false, message: 'Email no registrado' };
        }

        // In production, send actual reset email
        // For now, just generate a reset token
        const resetToken = this._generateToken();
        localStorage.setItem('scorta_reset_token_' + email, resetToken);

        return {
            success: true,
            message: 'Se ha enviado un enlace de recuperación a tu email',
            token: resetToken // Only for demo purposes
        };
    },

    // Reset password
    resetPassword: function (email, token, newPassword) {
        const savedToken = localStorage.getItem('scorta_reset_token_' + email);

        if (!savedToken || savedToken !== token) {
            return { success: false, message: 'Token inválido o expirado' };
        }

        const users = JSON.parse(localStorage.getItem('scorta_users')) || [];
        const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

        if (userIndex === -1) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        users[userIndex].password = newPassword;
        localStorage.setItem('scorta_users', JSON.stringify(users));
        localStorage.removeItem('scorta_reset_token_' + email);

        return { success: true, message: 'Contraseña actualizada correctamente' };
    },

    // Generate random token
    _generateToken: function () {
        return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Initialize with demo accounts
    initializeDemoAccounts: function () {
        const users = JSON.parse(localStorage.getItem('scorta_users')) || [];

        if (users.length === 0) {
            const demoUsers = [
                {
                    id: 'demo_client',
                    email: 'cliente@demo.com',
                    password: 'demo123',
                    role: 'client',
                    name: 'Carlos Mendoza',
                    phone: '+593 99 123 4567',
                    city: 'Quito',
                    verified: true,
                    createdAt: new Date().toISOString(),
                    profileComplete: true
                },
                {
                    id: 'demo_provider',
                    email: 'proveedor@demo.com',
                    password: 'demo123',
                    role: 'provider',
                    name: 'Valeria',
                    phone: '+593 99 765 4321',
                    city: 'Quito',
                    verified: true,
                    createdAt: new Date().toISOString(),
                    profileComplete: true
                },
                {
                    id: 'demo_admin',
                    email: 'admin@scorta.com',
                    password: 'admin123',
                    role: 'admin',
                    name: 'Administrador SCORTA',
                    phone: '+593 99 000 0000',
                    city: 'Quito',
                    verified: true,
                    createdAt: new Date().toISOString(),
                    profileComplete: true
                }
            ];

            localStorage.setItem('scorta_users', JSON.stringify(demoUsers));
        }
    }
};

// Initialize demo accounts on load
if (typeof window !== 'undefined') {
    AuthModule.initializeDemoAccounts();
}
