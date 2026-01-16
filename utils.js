/* ========================================
   SCORTA - Utility Functions
   Helpers for common operations
======================================== */

const Utils = {
    // Debounce function for search/filter inputs
    debounce: function (func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function for scroll events
    throttle: function (func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Format date
    formatDate: function (dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInMinutes = Math.floor(diffInMs / 60000);
        const diffInHours = Math.floor(diffInMs / 3600000);
        const diffInDays = Math.floor(diffInMs / 86400000);

        if (diffInMinutes < 1) return 'Ahora';
        if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
        if (diffInHours < 24) return `Hace ${diffInHours}h`;
        if (diffInDays < 7) return `Hace ${diffInDays} días`;

        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short'
        });
    },

    // Format price
    formatPrice: function (price) {
        return `$${parseFloat(price).toFixed(2)}`;
    },

    // Calculate distance between two coordinates (Haversine formula)
    calculateDistance: function (lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of Earth in km
        const dLat = this._toRad(lat2 - lat1);
        const dLon = this._toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this._toRad(lat1)) * Math.cos(this._toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },

    _toRad: function (degrees) {
        return degrees * (Math.PI / 180);
    },

    // Compress image before upload
    compressImage: function (file, maxWidth = 800, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = function (event) {
                const img = new Image();
                img.src = event.target.result;

                img.onload = function () {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            resolve(blob);
                        },
                        'image/jpeg',
                        quality
                    );
                };

                img.onerror = reject;
            };

            reader.onerror = reject;
        });
    },

    // Convert file to base64
    fileToBase64: function (file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    },

    // Validate email
    validateEmail: function (email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Validate phone (Ecuador format)
    validatePhone: function (phone) {
        // Remove spaces and special characters
        const cleaned = phone.replace(/[\s\-\(\)]/g, '');
        // Ecuador phone: +593 or 0 followed by 9 digits
        const re = /^(\+593|0)?[0-9]{9,10}$/;
        return re.test(cleaned);
    },

    // Validate credit card number (Luhn algorithm)
    validateCreditCard: function (cardNumber) {
        const cleaned = cardNumber.replace(/\s/g, '');
        if (!/^\d{13,19}$/.test(cleaned)) return false;

        let sum = 0;
        let isEven = false;

        for (let i = cleaned.length - 1; i >= 0; i--) {
            let digit = parseInt(cleaned.charAt(i), 10);

            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }

            sum += digit;
            isEven = !isEven;
        }

        return (sum % 10) === 0;
    },

    // Format credit card number with spaces
    formatCreditCard: function (value) {
        const cleaned = value.replace(/\s/g, '');
        const match = cleaned.match(/.{1,4}/g);
        return match ? match.join(' ') : cleaned;
    },

    // Get card type from number
    getCardType: function (cardNumber) {
        const cleaned = cardNumber.replace(/\s/g, '');
        if (/^4/.test(cleaned)) return 'visa';
        if (/^5[1-5]/.test(cleaned)) return 'mastercard';
        if (/^3[47]/.test(cleaned)) return 'amex';
        if (/^6(?:011|5)/.test(cleaned)) return 'discover';
        return 'unknown';
    },

    // Generate random ID
    generateId: function (prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    // Lazy load images with IntersectionObserver
    lazyLoadImages: function (selector = '.lazy-image') {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.getAttribute('data-src');
                        if (src) {
                            img.src = src;
                            img.classList.add('loaded');
                            observer.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll(selector).forEach(img => {
                imageObserver.observe(img);
            });
        }
    },

    // Create skeleton loader
    createSkeleton: function (type = 'card') {
        const skeletons = {
            card: `
                <div class="skeleton-card">
                    <div class="skeleton-image"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text short"></div>
                </div>
            `,
            list: `
                <div class="skeleton-list-item">
                    <div class="skeleton-avatar"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-text"></div>
                        <div class="skeleton-text short"></div>
                    </div>
                </div>
            `
        };
        return skeletons[type] || skeletons.card;
    },

    // Show loading state
    showLoading: function (container, count = 3, type = 'card') {
        const skeletons = Array(count).fill(this.createSkeleton(type)).join('');
        if (container) container.innerHTML = skeletons;
    },

    // Sanitize HTML to prevent XSS
    sanitizeHTML: function (str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    // Copy to clipboard
    copyToClipboard: function (text) {
        return navigator.clipboard.writeText(text).then(
            () => true,
            () => false
        );
    },

    // Check if online
    isOnline: function () {
        return navigator.onLine;
    },

    // Format file size
    formatFileSize: function (bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}
