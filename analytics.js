/* ========================================
   SCORTA - Analytics Module
   Privacy-friendly analytics tracking
======================================== */

const Analytics = {
    /**
     * Track a custom event
     * @param {string} eventName - Name of the event
     * @param {object} props - Event properties
     */
    trackEvent(eventName, props = {}) {
        try {
            if (window.plausible) {
                window.plausible(eventName, { props });
                console.log(`📊 Analytics: ${eventName}`, props);
            }
        } catch (error) {
            console.error('Analytics error:', error);
        }
    },

    /**
     * Track profile view
     * @param {string} profileId - Profile ID
     * @param {string} profileName - Profile name
     */
    trackProfileView(profileId, profileName = '') {
        this.trackEvent('Profile View', {
            profileId,
            profileName
        });
    },

    /**
     * Track favorite addition
     * @param {string} profileId - Profile ID
     */
    trackFavoriteAdd(profileId) {
        this.trackEvent('Favorite Added', {
            profileId
        });
    },

    /**
     * Track favorite removal
     * @param {string} profileId - Profile ID
     */
    trackFavoriteRemove(profileId) {
        this.trackEvent('Favorite Removed', {
            profileId
        });
    },

    /**
     * Track user login
     * @param {string} method - Login method (email, google, etc.)
     */
    trackLogin(method = 'email') {
        this.trackEvent('Login', {
            method
        });
    },

    /**
     * Track user registration
     * @param {string} role - User role (client, provider)
     */
    trackRegistration(role) {
        this.trackEvent('Registration', {
            role
        });
    },

    /**
     * Track logout
     */
    trackLogout() {
        this.trackEvent('Logout');
    },

    /**
     * Track search
     * @param {string} query - Search query
     * @param {number} resultsCount - Number of results
     */
    trackSearch(query, resultsCount = 0) {
        this.trackEvent('Search', {
            query,
            resultsCount
        });
    },

    /**
     * Track filter usage
     * @param {string} filterType - Type of filter (verified, location, etc.)
     * @param {string} filterValue - Filter value
     */
    trackFilter(filterType, filterValue) {
        this.trackEvent('Filter Applied', {
            filterType,
            filterValue
        });
    },

    /**
     * Track message sent
     * @param {string} recipientId - Recipient profile ID
     */
    trackMessageSent(recipientId) {
        this.trackEvent('Message Sent', {
            recipientId
        });
    },

    /**
     * Track message conversation viewed
     * @param {string} conversationId - Conversation ID
     */
    trackConversationView(conversationId) {
        this.trackEvent('Conversation Viewed', {
            conversationId
        });
    },

    /**
     * Track PWA installation
     */
    trackInstall() {
        this.trackEvent('PWA Installed');
    },

    /**
     * Track review submission
     * @param {string} profileId - Profile ID
     * @param {number} rating - Rating value
     */
    trackReviewSubmitted(profileId, rating) {
        this.trackEvent('Review Submitted', {
            profileId,
            rating
        });
    },

    /**
     * Track error
     * @param {string} errorType - Type of error
     * @param {string} errorMessage - Error message
     */
    trackError(errorType, errorMessage) {
        this.trackEvent('Error', {
            errorType,
            errorMessage
        });
    },

    /**
     * Track payment initiated
     * @param {string} amount - Payment amount
     * @param {string} method - Payment method
     */
    trackPaymentInitiated(amount, method) {
        this.trackEvent('Payment Initiated', {
            amount,
            method
        });
    },

    /**
     * Track payment completed
     * @param {string} transactionId - Transaction ID
     * @param {string} amount - Payment amount
     */
    trackPaymentCompleted(transactionId, amount) {
        this.trackEvent('Payment Completed', {
            transactionId,
            amount
        });
    },

    /**
     * Track profile completion
     */
    trackProfileCompleted() {
        this.trackEvent('Profile Completed');
    },

    /**
     * Track verification request
     */
    trackVerificationRequested() {
        this.trackEvent('Verification Requested');
    },

    /**
     * Track age gate acceptance
     */
    trackAgeGateAccepted() {
        this.trackEvent('Age Gate Accepted');
    },

    /**
     * Track age gate rejection
     */
    trackAgeGateRejected() {
        this.trackEvent('Age Gate Rejected');
    }
};

// Make Analytics available globally
if (typeof window !== 'undefined') {
    window.Analytics = Analytics;
}
