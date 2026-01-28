/* ========================================
   SCORTA - Authentication Module
   Handles user authentication and session management
   Connected to Railway backend API
======================================== */

// Authentication State
const AuthModule = {
    _userCache: null,
    _cacheExpiry: 0,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes

    // Check if user is logged in
    isAuthenticated: function () {
        return localStorage.getItem('scorta_auth_token') !== null;
    },

    // Get current user data
    getCurrentUser: function () {
        // Return cached user if available and not expired
        if (this._userCache && Date.now() < this._cacheExpiry) {
            return this._userCache;
        }

        // Try to get from localStorage first
        const userStr = localStorage.getItem('scorta_current_user');
        if (userStr) {
            try {
                this._userCache = JSON.parse(userStr);
                this._cacheExpiry = Date.now() + this.CACHE_DURATION;
                return this._userCache;
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }

        return null;
    },

    // Fetch current user from API
    fetchCurrentUser: async function () {
        if (!this.isAuthenticated()) {
            return null;
        }

        try {
            const response = await window.API.getCurrentUser();
            if (response.success && response.data) {
                const user = response.data.user;
                localStorage.setItem('scorta_current_user', JSON.stringify(user));
                this._userCache = user;
                this._cacheExpiry = Date.now() + this.CACHE_DURATION;
                return user;
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            // If token is invalid, clear auth
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                this.logoutUser();
            }
        }
        return null;
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

    // Login user - now uses backend API
    loginUser: async function (email, password, rememberMe = false) {
        try {
            const response = await window.API.login(email, password);

            if (response.success && response.data) {
                // Store tokens
                localStorage.setItem('scorta_auth_token', response.data.token);
                if (response.data.refreshToken) {
                    localStorage.setItem('scorta_refresh_token', response.data.refreshToken);
                }

                // Store user data
                localStorage.setItem('scorta_current_user', JSON.stringify(response.data.user));
                this._userCache = response.data.user;
                this._cacheExpiry = Date.now() + this.CACHE_DURATION;

                if (rememberMe) {
                    localStorage.setItem('scorta_remember_me', 'true');
                }

                return { success: true, user: response.data.user };
            }

            return { success: false, message: response.message || 'Error al iniciar sesión' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: error.message || 'Error de conexión' };
        }
    },

    // Register new user - now uses backend API
    registerUser: async function (userData) {
        try {
            const response = await window.API.register(userData);

            if (response.success && response.data) {
                // Store tokens
                localStorage.setItem('scorta_auth_token', response.data.token);
                if (response.data.refreshToken) {
                    localStorage.setItem('scorta_refresh_token', response.data.refreshToken);
                }

                // Store user data
                localStorage.setItem('scorta_current_user', JSON.stringify(response.data.user));
                this._userCache = response.data.user;
                this._cacheExpiry = Date.now() + this.CACHE_DURATION;

                return { success: true, user: response.data.user };
            }

            return { success: false, message: response.message || 'Error al registrar usuario' };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: error.message || 'Error de conexión' };
        }
    },

    // Logout user - now calls backend API
    logoutUser: async function () {
        try {
            if (this.isAuthenticated() && window.API) {
                await window.API.logout();
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage regardless of API call result
            localStorage.removeItem('scorta_auth_token');
            localStorage.removeItem('scorta_refresh_token');
            localStorage.removeItem('scorta_current_user');
            this._userCache = null;
            this._cacheExpiry = 0;

            // Clear remember me if not set
            if (!localStorage.getItem('scorta_remember_me')) {
                localStorage.removeItem('scorta_last_email');
            }
        }
    },

    // Update user profile
    updateUserProfile: function (updates) {
        const user = this.getCurrentUser();
        if (!user) return { success: false, message: 'No hay sesión activa' };

        // Update cached user
        const updatedUser = { ...user, ...updates };
        localStorage.setItem('scorta_current_user', JSON.stringify(updatedUser));
        this._userCache = updatedUser;
        this._cacheExpiry = Date.now() + this.CACHE_DURATION;

        return { success: true, user: updatedUser };
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

    // Clear user cache (useful after updates)
    clearCache: function () {
        this._userCache = null;
        this._cacheExpiry = 0;
    }
};

// Make AuthModule available globally
if (typeof window !== 'undefined') {
    window.AuthModule = AuthModule;
}
