/* ========================================
   SCORTA - Authentication Module (Backend-Integrated Version)
   Handles user authentication and session management with real API calls
======================================== */

// Authentication Module
const AuthModule = {
    // Check if user is authenticated
    isAuthenticated: function () {
        return API.getToken() !== null;
    },

    // Get current user data
    getCurrentUser: function () {
        const userStr = localStorage.getItem('scorta_current_user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Get user role
    getUserRole: function () {
        const user = this.getCurrentUser();
        return user ? user.role : null;
    },

    // Check roles
    isAdmin: function () {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    },

    isClient: function () {
        const user = this.getCurrentUser();
        return user && user.role === 'client';
    },

    isProvider: function () {
        const user = this.getCurrentUser();
        return user && user.role === 'provider';
    },

    // Login user with backend API
    loginUser: async function (email, password, rememberMe = false) {
        try {
            const response = await API.login(email, password);

            if (response.success && response.data.user) {
                // Store user data locally
                localStorage.setItem('scorta_current_user', JSON.stringify(response.data.user));

                if (rememberMe) {
                    localStorage.setItem('scorta_remember_me', 'true');
                }

                return { success: true, user: response.data.user };
            }

            return { success: false, message: response.message || 'Login failed' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: error.message || 'Error al iniciar sesión' };
        }
    },

    // Register new user with backend API
    registerUser: async function (userData) {
        try {
            const response = await API.register({
                email: userData.email,
                password: userData.password,
                role: userData.role || 'client',
                name: userData.name || '',
                phone: userData.phone || '',
                city: userData.city || ''
            });

            if (response.success && response.data.user) {
                //Store user data locally
                localStorage.setItem('scorta_current_user', JSON.stringify(response.data.user));

                return { success: true, user: response.data.user };
            }

            return { success: false, message: response.message || 'Registration failed' };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: error.message || 'Error al registrar usuario' };
        }
    },

    // Logout user
    logoutUser: async function () {
        try {
            await API.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local data regardless of API response
            localStorage.removeItem('scorta_auth_token');
            localStorage.removeItem('scorta_token');
            localStorage.removeItem('scorta_current_user');
            localStorage.removeItem('scorta_remember_me');
            API.setToken(null);
        }
    },

    // Update user profile
    updateUserProfile: async function (profileData) {
        try {
            const user = this.getCurrentUser();
            if (!user) {
                return { success: false, message: 'No user logged in' };
            }

            const response = await API.request('/users/me', {
                method: 'PUT',
                body: JSON.stringify(profileData)
            });

            if (response.success && response.data.user) {
                // Update local user data
                localStorage.setItem('scorta_current_user', JSON.stringify(response.data.user));
                return { success: true, user: response.data.user };
            }

            return { success: false, message: response.message || 'Update failed' };
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, message: error.message || 'Error al actualizar perfil' };
        }
    },

    //Fetch current user from backend
    fetchCurrentUser: async function () {
        try {
            const response = await API.getCurrentUser();

            if (response.success && response.data.user) {
                localStorage.setItem('scorta_current_user', JSON.stringify(response.data.user));
                return { success: true, user: response.data.user };
            }

            return { success: false, message: 'User not found' };
        } catch (error) {
            console.error('Fetch user error:', error);
            return { success: false, message: error.message };
        }
    },

    // Initialize demo users (for testing - can be removed in production)
    _initializeDemoUsers: function () {
        // This is no longer needed with backend
        console.log('Demo users handled by backend seeding');
    },

    // Generate token (no longer needed, handled by backend)
    _generateToken: function () {
        return 'token_' + Math.random().toString(36).substr(2, 9);
    }
};

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if user has valid token
    if (AuthModule.isAuthenticated()) {
        // Optionally fetch fresh user data from backend
        AuthModule.fetchCurrentUser().catch(err => {
            console.error('Failed to fetch user:', err);
        });
    }
});
