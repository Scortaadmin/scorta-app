/* ========================================
   SCORTA - API Service Layer
   Centralized HTTP client for backend communication
======================================== */

class APIService {
    constructor() {
        // Use config if available, fallback to localhost
        this.baseURL = (typeof SCORTA_CONFIG !== 'undefined' && SCORTA_CONFIG.API_BASE_URL)
            ? SCORTA_CONFIG.API_BASE_URL
            : 'http://localhost:3001/api';
        this.token = localStorage.getItem('scorta_token');
    }

    // Set authorization token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('scorta_token', token);
        } else {
            localStorage.removeItem('scorta_token');
        }
    }

    // Get authorization token
    getToken() {
        return this.token || localStorage.getItem('scorta_token');
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Add auth token if available
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async register(userData) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }

        return response;
    }

    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }

        return response;
    }

    async logout() {
        const response = await this.request('/auth/logout', {
            method: 'POST'
        });
        this.setToken(null);
        return response;
    }

    async getCurrentUser() {
        return await this.request('/auth/me');
    }

    // Profile endpoints
    async getProfiles(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = queryParams ? `/profiles?${queryParams}` : '/profiles';
        return await this.request(endpoint);
    }

    async getProfile(id) {
        return await this.request(`/profiles/${id}`);
    }

    async createProfile(profileData) {
        return await this.request('/profiles', {
            method: 'POST',
            body: JSON.stringify(profileData)
        });
    }

    async updateProfile(id, profileData) {
        return await this.request(`/profiles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async incrementProfileView(id) {
        return await this.request(`/profiles/${id}/view`, {
            method: 'POST'
        });
    }

    // Favorites endpoints
    async getFavorites() {
        return await this.request('/favorites');
    }

    async addFavorite(profileId) {
        return await this.request(`/favorites/${profileId}`, {
            method: 'POST'
        });
    }

    async removeFavorite(profileId) {
        return await this.request(`/favorites/${profileId}`, {
            method: 'DELETE'
        });
    }

    // Reviews endpoints
    async getReviews(profileId) {
        return await this.request(`/reviews/${profileId}`);
    }

    async createReview(profileId, reviewData) {
        return await this.request(`/reviews/${profileId}`, {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    }

    async markReviewHelpful(reviewId, helpful) {
        return await this.request(`/reviews/${reviewId}/helpful`, {
            method: 'POST',
            body: JSON.stringify({ helpful })
        });
    }

    // Messages endpoints
    async getConversations() {
        return await this.request('/messages/conversations');
    }

    async getMessages(userId) {
        return await this.request(`/messages/${userId}`);
    }

    async sendMessage(recipientId, text) {
        return await this.request('/messages', {
            method: 'POST',
            body: JSON.stringify({ recipient: recipientId, text })
        });
    }

    // Payments endpoints
    async processPayment(paymentData) {
        return await this.request('/payments/process', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    }

    async getTransactions() {
        return await this.request('/payments/transactions');
    }

    // Upload endpoints
    async uploadAvatar(file) {
        const formData = new FormData();
        formData.append('avatar', file);

        return await fetch(`${this.baseURL}/upload/avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.getToken()}`
            },
            body: formData
        }).then(res => res.json());
    }

    async uploadProfilePhotos(files) {
        const formData = new FormData();
        files.forEach(file => formData.append('photos', file));

        return await fetch(`${this.baseURL}/upload/profile-photos`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.getToken()}`
            },
            body: formData
        }).then(res => res.json());
    }
}

// Create singleton instance
const api = new APIService();

// Export for use in other files
if (typeof window !== 'undefined') {
    window.API = api;
}
