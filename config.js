/* ========================================
   SCORTA - Configuration
   Environment-aware settings
======================================== */

const SCORTA_CONFIG = {
    // API Base URL - automatically switches based on environment
    API_BASE_URL: (function () {
        const hostname = window.location.hostname;

        // Development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3001/api';
        }

        // Production - UPDATE THIS after Railway deployment
        return 'https://YOUR_RAILWAY_APP.up.railway.app/api';
    })(),

    // App version
    VERSION: '1.0.0-MVP',

    // Feature flags
    FEATURES: {
        REAL_TIME_CHAT: false,  // Not available in MVP
        PAYMENTS: false,         // Not available in MVP
        AUTO_VERIFICATION: false // Manual verification only
    },

    // Storage keys
    STORAGE_KEYS: {
        TOKEN: 'scorta_token',
        USER: 'scorta_user',
        AGE_VERIFIED: 'scorta_age_verified_18'
    },

    // Contact info
    CONTACT: {
        SUPPORT_EMAIL: 'info@scorta.com',
        LEGAL_EMAIL: 'legal@scorta.com',
        PRIVACY_EMAIL: 'privacy@scorta.com'
    }
};

// Make config globally available
if (typeof window !== 'undefined') {
    window.SCORTA_CONFIG = SCORTA_CONFIG;

    console.log(`
╔════════════════════════════════════════╗
║   🚀 SCORTA ${SCORTA_CONFIG.VERSION}              ║
║   API: ${SCORTA_CONFIG.API_BASE_URL.substring(0, 30)}...  ║
╚════════════════════════════════════════╝
    `);
}
