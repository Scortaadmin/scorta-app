/* ========================================
   SCORTA - App Logic
   "Connecting Safely"
======================================== */

// Core States
let currentProfileData = null;
let favorites = JSON.parse(localStorage.getItem('scorta_favorites')) || [];
let customAds = JSON.parse(localStorage.getItem('scorta_custom_ads')) || [];
let selectedRating = 0;
let currentAdStep = 1;
let currentAdPhoto = null;
let map = null;
let advancedFilters = {
    price: 300,
    city: 'all',
    ethnicity: 'all',
    nationality: 'all'
};

// Default Profiles Base
const defaultProfiles = [
    { id: 'valeria', name: 'Valeria', age: 24, city: 'Quito', verified: true, elite: false, price: 60, ethnicity: 'Latina', nationality: 'Ecuatoriana', lat: -0.1807, lng: -78.4678, img: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80' },
    { id: 'camila', name: 'Camila', age: 22, city: 'Guayaquil', verified: false, elite: true, price: 80, ethnicity: 'Latina', nationality: 'Colombiana', lat: -2.1708, lng: -79.9224, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80' },
    { id: 'isabella', name: 'Isabella', age: 26, city: 'Manta', verified: true, elite: false, price: 50, ethnicity: 'Caucásica', nationality: 'Espanola', lat: -0.9677, lng: -80.7089, img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
    { id: 'elena', name: 'Elena', age: 25, city: 'Quito', verified: true, elite: true, price: 100, ethnicity: 'Europea', nationality: 'Rusa', lat: -0.1750, lng: -78.4800, img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80' },
    { id: 'sofia', name: 'Sofia', age: 23, city: 'Cuenca', verified: true, elite: false, price: 70, ethnicity: 'Latina', nationality: 'Ecuatoriana', lat: -2.9001, lng: -79.0059, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
    { id: 'gabriela', name: 'Gabriela', age: 27, city: 'Machala', verified: false, elite: false, price: 55, ethnicity: 'Latina', nationality: 'Ecuatoriana', lat: -3.2581, lng: -79.9553, img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80' }
];

// Age Verification Functions - BUG #5 FIX
function checkAgeVerification() {
    return localStorage.getItem('scorta_age_verified') === 'true';
}

function confirmAge() {
    localStorage.setItem('scorta_age_verified', 'true');
    localStorage.setItem('scorta_age_verified_date', new Date().toISOString());
    showToast('✅ Bienvenido a SCORTA');
    navigateTo('screen-explore');
}

function denyAge() {
    showToast('⚠️ Debes ser mayor de 18 años para acceder');
    setTimeout(() => {
        window.location.href = 'https://www.google.com';
    }, 2000);
}

// Expose for HTML onclick handlers
window.confirmAge = confirmAge;
window.denyAge = denyAge;

// Screen Navigation
async function navigateTo(screenId) {
    // BUG #5 FIX: Check age verification for certain screens if not authenticated
    const protectedScreensForAnonymous = ['screen-favorites', 'screen-messages', 'screen-dashboard', 'screen-plans', 'screen-checkout', 'screen-settings'];
    const isAuthenticated = AuthModule.isAuthenticated();
    const isAgeVerified = checkAgeVerification();

    // If user is not authenticated and trying to access protected screens, show login
    if (!isAuthenticated && protectedScreensForAnonymous.includes(screenId)) {
        showToast('❌ Debes iniciar sesión para acceder a esta función');
        navigateTo('screen-login');
        return;
    }

    // If not age verified and trying to access explore, show age gate
    if (!isAgeVerified && screenId === 'screen-explore') {
        navigateTo('screen-gate');
        return;
    }

    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');

        // Manage Bottom Nav visibility
        const nav = document.querySelector('.bottom-nav');
        if (nav) {
            const visibleScreens = ['screen-explore', 'screen-dashboard', 'screen-favorites', 'screen-messages', 'screen-plans', 'screen-checkout', 'screen-chat'];
            if (visibleScreens.includes(screenId)) {
                nav.style.display = 'flex';

                // Special case: hide bottom nav on individual chat screen to avoid clutter
                if (screenId === 'screen-chat') nav.style.display = 'none';

                // Update active state in nav
                document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                const navMap = {
                    'screen-explore': 'nav-explore',
                    'screen-dashboard': 'nav-dashboard',
                    'screen-favorites': 'nav-favorites',
                    'screen-messages': 'nav-messages'
                };
                const activeBtnId = navMap[screenId];
                if (activeBtnId) {
                    const activeBtn = document.getElementById(activeBtnId);
                    if (activeBtn) activeBtn.classList.add('active');
                }
            } else {
                nav.style.display = 'none';
            }
        }
    }

    // Data handling for specific screens
    if (screenId === 'screen-favorites') renderFavorites();
    if (screenId === 'screen-explore') renderMarketplace();
    if (screenId === 'screen-settings') loadSettingsFields();
    if (screenId === 'screen-dashboard') {
        // Ensure profile is loaded before accessing dashboard
        await ensureProviderProfileLoaded();
        updateDynamicMetrics();
        renderDashboardProfile();
        loadProviderDescription();
        loadProviderPhotos(); // NEW: Load photos
        loadProviderPhone(); // NEW: Load phone
    }
    if (screenId === 'screen-client-profile') {
        loadClientProfile();
    }
    if (screenId === 'screen-map') {
        initMap();
    }
    if (screenId === 'screen-wallet') {
        updateWalletDisplay();
        PaymentModule.initializeDemoWallet();
    }
    if (screenId === 'screen-payment-methods') {
        loadPaymentMethods();
    }
    if (screenId === 'screen-messages') {
        loadConversations(); // NEW: Load conversations
    }

    window.scrollTo(0, 0);

    // Role-based UI visibility
    updateUIForRole();
}

// Update UI elements based on user role - FIX BUGS #3 and #6
function updateUIForRole() {
    const isAuthenticated = AuthModule.isAuthenticated();
    const role = AuthModule.getUserRole();
    const user = AuthModule.getCurrentUser();

    // Get UI elements
    const publishBtn = document.getElementById('nav-publish');
    const dashboardNavItem = document.getElementById('nav-dashboard');
    const headerLoginBtn = document.getElementById('header-login-btn');

    if (!isAuthenticated) {
        // Hide all provider-specific features for non-authenticated users
        if (publishBtn) publishBtn.style.display = 'none';
        if (dashboardNavItem) dashboardNavItem.style.display = 'none';

        // Show login button in header for non-authenticated users
        if (headerLoginBtn) headerLoginBtn.style.display = '';
        return;
    }

    // Hide login button for authenticated users
    if (headerLoginBtn) headerLoginBtn.style.display = 'none';

    // Authenticated users
    if (role === 'client') {
        // Hide provider-specific features for clients (FIX BUG #3)
        if (publishBtn) publishBtn.style.display = 'none';
        if (dashboardNavItem) dashboardNavItem.style.display = 'none';
    } else if (role === 'provider') {
        // Check if profile is complete before showing dashboard/panel (FIX BUG #6)
        const profileComplete = user?.profileCompleted || false;

        // Show create ad button only for providers
        if (publishBtn) publishBtn.style.display = '';

        // Show dashboard/panel only if profile is complete
        if (dashboardNavItem) {
            dashboardNavItem.style.display = profileComplete ? '' : 'none';
        }
    }
}

// Logout function - FIX BUG #2
async function logout() {
    if (confirm('¿Estás seguro que quieres cerrar sesión?')) {
        await AuthModule.logoutUser();

        // Clear all cached data
        favorites = [];
        currentProfileData = null;
        localStorage.removeItem('scorta_favorites');
        localStorage.removeItem('scorta_custom_ads');
        localStorage.removeItem('scorta_boost_active');

        // Redirect to age gate screen
        navigateTo('screen-gate');
        showToast('✅ Sesión cerrada exitosamente');

        // Update UI for logged-out state
        updateUIForRole();
    }
}

window.logout = logout;

// Marketplace Logic
let activeFilter = 'all';
let searchQuery = '';

async function renderMarketplace() {
    const grid = document.getElementById('main-listings-grid');
    if (!grid) return;

    // Show loading state
    grid.innerHTML = '<div style="grid-column: span 2; text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin"></i> Cargando perfiles...</div>';

    try {
        // BUG #5 FIX: Allow anonymous browsing - use default profiles if not authenticated
        const isAuthenticated = AuthModule.isAuthenticated();

        if (!isAuthenticated) {
            // Use default profiles for anonymous users
            const allProfiles = defaultProfiles;

            // Apply local filtering for anonymous users
            let filtered = allProfiles;
            if (activeFilter === 'verified') {
                filtered = filtered.filter(p => p.verified);
            }
            if (searchQuery && searchQuery.trim() !== '') {
                const query = searchQuery.toLowerCase();
                filtered = filtered.filter(p =>
                    p.name.toLowerCase().includes(query) ||
                    p.city.toLowerCase().includes(query)
                );
            }
            if (advancedFilters.city !== 'all') {
                filtered = filtered.filter(p => p.city === advancedFilters.city);
            }
            if (advancedFilters.ethnicity !== 'all') {
                filtered = filtered.filter(p => p.ethnicity === advancedFilters.ethnicity);
            }
            if (advancedFilters.nationality !== 'all') {
                filtered = filtered.filter(p => p.nationality === advancedFilters.nationality);
            }
            if (advancedFilters.price !== 300) {
                filtered = filtered.filter(p => p.price <= advancedFilters.price);
            }

            renderProfileGrid(filtered, grid);
            return; // Exit early for anonymous users
        }

        // FOR AUTHENTICATED USERS: Use API
        // Build filter object for API
        const filters = {};
        if (searchQuery && searchQuery.trim() !== '') filters.search = searchQuery.trim();
        if (activeFilter === 'verified') filters.verified = true;
        if (advancedFilters.city !== 'all') filters.city = advancedFilters.city;
        if (advancedFilters.price !== 300) filters.maxPrice = advancedFilters.price;
        if (advancedFilters.ethnicity !== 'all') filters.ethnicity = advancedFilters.ethnicity;
        if (advancedFilters.nationality !== 'all') filters.nationality = advancedFilters.nationality;

        // ROLE-BASED FILTERING - FIX BUGS #7 and #8
        // For providers: show clients with whom they've had contact
        // For clients: show providers (service providers)
        const user = AuthModule.getCurrentUser();
        const userRole = user?.role;

        if (userRole === 'provider') {
            // Providers see only clients they've contacted
            filters.role = 'client';
            filters.hasContact = true; // Only clients with previous contact

            // Bug #7: "Verificados" filter shows only VERIFIED clients with contact
            // Bug #8: "Todos" filter shows ALL clients with contact (verified or not)
            // The activeFilter 'verified' is already handled above
        } else {
            // Clients see providers
            filters.role = 'provider';
        }

        const response = await API.getProfiles(filters);
        const allProfiles = response.success ? response.data.profiles : [];

        if (allProfiles.length === 0) {
            const emptyMessage = userRole === 'provider'
                ? 'No se encontraron clientes aún.'
                : 'No se encontraron resultados.';
            grid.innerHTML = `<div style="grid-column: span 2; text-align: center; padding: 40px; color: var(--text-secondary);">${emptyMessage}</div>`;
            return;
        }

        renderProfileGrid(allProfiles, grid);
    } catch (error) {
        console.error('Error loading profiles:', error);
        grid.innerHTML = '<div style="grid-column: span 2; text-align: center; padding: 40px; color: var(--error);">Error al cargar perfiles. <button class="btn-outline" onclick="renderMarketplace()" style="margin-top: 10px;">Reintentar</button></div>';
    }
}

// Helper function to render profile grid - BUG #5 FIX
function renderProfileGrid(allProfiles, grid) {
    grid.innerHTML = allProfiles.map((p, profileIndex) => {
        const photos = p.photos && p.photos.length > 0
            ? p.photos
            : [p.avatar || p.img || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'];

        return `
        <div class="profile-card" data-profile-id="${p._id || p.id}" onclick="openProfile('${p._id || p.id}')">
            <div class="profile-carousel-container">
                ${photos.map((photo, idx) => `
                    <div class="profile-img carousel-slide ${idx === 0 ? 'active' : ''}" 
                         style="background-image: url('${photo}')"
                         data-slide="${idx}">
                    </div>
                `).join('')}
                
                ${photos.length > 1 ? `
                    <div class="carousel-dots">
                        ${photos.map((_, idx) => `
                            <span class="dot ${idx === 0 ? 'active' : ''}" data-dot="${idx}"></span>
                        `).join('')}
                    </div>
                    <button class="carousel-nav prev" onclick="event.stopPropagation(); navigateCarouselByCard(this, -1)">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="carousel-nav next" onclick="event.stopPropagation(); navigateCarouselByCard(this, 1)">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                ` : ''}
                
                <div class="badge-row">
                    ${p.verified ? '<span class="badge verified"><i class="fas fa-certificate"></i> Verificada</span>' : ''}
                    ${p.isPremium || p.elite ? '<span class="badge top-ad"><i class="fas fa-crown"></i> Elite</span>' : ''}
                </div>
                <div class="profile-info-overlay" onclick="openProfile('${p._id || p.id}')">
                    <h3>${p.name || 'Usuario'}, ${p.age || '25'} <span class="status-dot"></span></h3>
                    <p><i class="fas fa-map-marker-alt"></i> ${p.city || 'Ecuador'}${p.pricing && p.pricing.hourly ? ' · $' + p.pricing.hourly : (p.price ? ' · $' + p.price : '')}</p>
                </div>
            </div>
        </div>
    `;
    }).join('') + `
        <div id="pwa-install-tile" class="profile-card glass-card pwa-banner-card" onclick="triggerPWAInstall()" style="display: none; background: linear-gradient(135deg, var(--surface) 0%, var(--bg-dark) 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px;">
            <i class="fas fa-mobile-alt" style="font-size: 2.5rem; color: var(--accent); margin-bottom: 15px;"></i>
            <h4 style="margin-bottom: 5px;">Instalar App</h4>
            <p style="font-size: 0.75rem; color: var(--text-secondary);">Acceso rápido y seguro desde tu pantalla de inicio.</p>
        </div>
    `;
}


function handleSearch(val) {
    searchQuery = val;
    renderMarketplace();

    // Track search if query is not empty
    if (val && val.trim() && window.Analytics) {
        window.Analytics.trackSearch(val.trim());
    }
}

// Carousel Navigation Function - FIX BUG #1
function navigateCarouselByCard(button, direction) {
    const card = button.closest('.profile-card');
    if (!card) return;

    const slides = card.querySelectorAll('.carousel-slide');
    const dots = card.querySelectorAll('.dot');

    if (slides.length === 0) return;

    let currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains('active'));
    if (currentIndex === -1) currentIndex = 0;

    // Remove active class from current
    slides[currentIndex].classList.remove('active');
    if (dots[currentIndex]) dots[currentIndex].classList.remove('active');

    // Calculate new index
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = slides.length - 1;
    if (newIndex >= slides.length) newIndex = 0;

    // Add active class to new
    slides[newIndex].classList.add('active');
    if (dots[newIndex]) dots[newIndex].classList.add('active');
}

function filterBy(type) {
    activeFilter = type;
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    event.target.classList.add('active');
    renderMarketplace();

    // Track filter usage
    if (window.Analytics) {
        window.Analytics.trackEvent('Filter Applied', { filterType: type });
    }
}

function openProfileFromData(data) {
    currentProfileData = data;
    const detailImg = document.getElementById('detail-img');
    const detailName = document.getElementById('detail-name');
    const favBtn = document.getElementById('fav-btn');

    if (detailImg && detailName) {
        const profileImage = data.photos && data.photos.length > 0 ? data.photos[0] : (data.avatar || data.img || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600');
        detailImg.style.backgroundImage = `url('${profileImage}')`;
        detailName.textContent = `${data.name || 'Usuario'}, ${data.age || '25'}`;
    }

    if (favBtn) {
        const isFav = favorites.some(f => f._id === data._id || f.name === data.name);
        if (isFav) favBtn.classList.add('active');
        else favBtn.classList.remove('active');
    }

    renderReviews(data._id || data.id);
    navigateTo('screen-profile');
}

// Profile Detail Logic - Fetch from API
async function openProfile(profileId) {
    try {
        console.log('Opening profile with ID:', profileId);
        showToast('Cargando perfil...');
        const response = await API.getProfile(profileId);

        console.log('Profile API response:', response);

        if (response.success && response.data.profile) {
            // Increment view count in background
            API.incrementProfileView(profileId).catch(console.error);

            // Track profile view
            if (window.Analytics) {
                window.Analytics.trackProfileView(profileId);
            }

            // Open profile detail page with data
            openProfileFromData(response.data.profile);
        } else {
            // Try to find in default profiles (demo profiles)
            const demoProfile = defaultProfiles.find(p => p.id === profileId || p._id === profileId);

            if (demoProfile) {
                console.log('Profile not found in API, using demo profile:', demoProfile);
                showToast('📋 Mostrando perfil de demostración');
                openProfileFromData(demoProfile);
            } else {
                console.error('Failed to load profile. Response:', response);
                showToast('❌ Error al cargar perfil: ' + (response.message || 'Perfil no encontrado'));
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error);

        // Try to find in default profiles as fallback
        const demoProfile = defaultProfiles.find(p => p.id === profileId || p._id === profileId);

        if (demoProfile) {
            console.log('API error, using demo profile as fallback:', demoProfile);
            showToast('📋 Mostrando perfil de demostración');
            openProfileFromData(demoProfile);
        } else {
            showToast('❌ Error al cargar perfil: ' + error.message);
        }
    }
}

// Favorites System - API Version
async function toggleFavorite() {
    if (!currentProfileData) return;

    if (!AuthModule.isAuthenticated()) {
        showToast('❌ Debes iniciar sesión para guardar favoritos');
        return;
    }

    const btn = document.getElementById('fav-btn');
    const profileId = currentProfileData._id || currentProfileData.id;
    const isFavorited = btn?.classList.contains('active');

    try {
        if (isFavorited) {
            await API.removeFavorite(profileId);
            showToast('Eliminado de favoritos');
            if (btn) btn.classList.remove('active');
            // Remove from local array
            favorites = favorites.filter(f => (f._id || f.id) !== profileId);
        } else {
            await API.addFavorite(profileId);
            showToast('❤️ Guardado en favoritos');
            if (btn) btn.classList.add('active');
            // Add to local array
            favorites.push(currentProfileData);

            // Track favorite addition
            if (window.Analytics) {
                window.Analytics.trackFavoriteAdd(profileId);
            }
        }

        // Update favorites list if currently viewing it
        if (document.getElementById('screen-favorites')?.classList.contains('active')) {
            renderFavorites();
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        showToast('❌ Error al actualizar favoritos');
    }
}

// Render Favorites - FIX BUG #4
async function renderFavorites() {
    const list = document.getElementById('favorites-list');
    if (!list) return;

    if (!AuthModule.isAuthenticated()) {
        list.innerHTML = `
            <div class="empty-state" style="text-align: center; padding-top: 80px; width: 100%; grid-column: span 2;">
                <i class="fas fa-heart" style="font-size: 3rem; color: var(--accent); opacity: 0.3; margin-bottom: 20px;"></i>
                <p style="color: var(--text-secondary);">Inicia sesión para ver tus favoritos.</p>
            </div>`;
        return;
    }

    try {
        // Show loading state
        list.innerHTML = '<div style="grid-column: span 2; text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin"></i> Cargando favoritos...</div>';

        const response = await API.getFavorites();

        // Ensure favorites is always an array
        if (response.success && Array.isArray(response.data.favorites)) {
            favorites = response.data.favorites;
        } else {
            console.warn('Invalid favorites response:', response);
            favorites = [];
        }

        if (favorites.length === 0) {
            list.innerHTML = `
                <div class="empty-state" style="text-align: center; padding-top: 80px; width: 100%; grid-column: span 2;">
                    <i class="fas fa-heart" style="font-size: 3rem; color: var(--accent); opacity: 0.3; margin-bottom: 20px;"></i>
                    <p style="color: var(--text-secondary);">Aún no tienes favoritos. <br>Guarda perfiles para verlos aquí.</p>
                </div>`;
            return;
        }

        list.innerHTML = favorites.map(profile => {
            const profileId = profile._id || profile.id;
            const profileImage = profile.photos && profile.photos.length > 0
                ? profile.photos[0]
                : (profile.avatar || profile.img || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400');

            return `
            <div class="profile-card glass-card" onclick="openProfile('${profileId}')">
                <div class="badge-featured">Favorito</div>
                <img src="${profileImage}" alt="${profile.name || 'Usuario'}">
                <div class="profile-info">
                    <div class="profile-name">
                        ${profile.name || 'Usuario'}, ${profile.age || '25'} ${profile.verified ? '<i class="fas fa-certificate verified-check"></i>' : ''}
                    </div>
                    <div class="profile-location">
                        <i class="fas fa-map-marker-alt"></i> ${profile.city || 'Ecuador'}
                    </div>
                </div>
            </div>
        `;
        }).join('');
    } catch (error) {
        console.error('Error loading favorites:', error);
        favorites = []; // Clear on error
        list.innerHTML = `
            <div style="grid-column: span 2; text-align: center; padding: 40px; color: var(--error);">
                ❌ Error al cargar favoritos. 
                <button class="btn-outline" onclick="renderFavorites()" style="margin-top: 10px;">Reintentar</button>
            </div>`;
    }
}

// Review System
function toggleReviewForm() {
    const form = document.getElementById('review-form');
    if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function setRating(stars) {
    selectedRating = stars;
    const icons = document.querySelectorAll('.rating-input i');
    icons.forEach((icon, idx) => {
        if (idx < stars) {
            icon.classList.replace('far', 'fas');
        } else {
            icon.classList.replace('fas', 'far');
        }
    });
}

async function submitReview() {
    const text = document.getElementById('review-text').value;
    if (!text || selectedRating === 0) {
        showToast('Por favor elige una puntuación y escribe un comentario.');
        return;
    }

    if (!AuthModule.isAuthenticated()) {
        showToast('❌ Debes iniciar sesión para publicar una reseña');
        return;
    }

    const profileId = currentProfileData?._id || currentProfileData?.id;
    if (!profileId) {
        showToast('❌ Error: No se puede identificar el perfil');
        return;
    }

    showToast('🚀 Publicando reseña...');

    try {
        const response = await API.createReview(profileId, {
            rating: selectedRating,
            text: text
        });

        if (response.success) {
            renderReviews(profileId);

            document.getElementById('review-text').value = '';
            selectedRating = 0;
            reviewPhotos = []; // Clear photos
            const preview = document.getElementById('review-photos-preview');
            if (preview) preview.innerHTML = '';
            setRating(0);
            toggleReviewForm();
            showToast('✅ Reseña publicada con éxito.');
        } else {
            showToast('❌ ' + (response.message || 'Error al publicar reseña'));
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        showToast('❌ Error de conexión al publicar reseña');
    }
}

async function renderReviews(profileId) {
    if (!profileId) return;

    try {
        const response = await API.getReviews(profileId);
        const reviews = response.success ? response.data.reviews : [];

        renderReviewsList(reviews);

        const countLabel = document.getElementById('review-count-label');
        if (countLabel) countLabel.textContent = `Reseñas de Usuarios (${reviews.length})`;
    } catch (error) {
        console.error('Error loading reviews:', error);
        // Show default message or error in UI
    }
}

// Interactive Chat
function openChat(name) {
    document.getElementById('chat-with-name').textContent = name;
    navigateTo('screen-chat');
    renderChat(name);
}

async function renderChat(userId) {
    const box = document.getElementById('chat-box');
    if (!box) return;

    if (!AuthModule.isAuthenticated()) {
        box.innerHTML = '<div class="message received">Inicia sesión para enviar mensajes</div>';
        return;
    }

    try {
        // Show loading
        box.innerHTML = '<div style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i></div>';

        const response = await API.getMessages(userId);
        const messages = response.success ? response.data.messages : [];

        if (messages.length === 0) {
            box.innerHTML = '<div class="message received" style="opacity: 0.6;">No hay mensajes aún. ¡Inicia la conversación!</div>';
        } else {
            const currentUser = AuthModule.getCurrentUser();
            box.innerHTML = messages.map(m => {
                const isSent = m.sender === currentUser?._id;
                return `<div class="message ${isSent ? 'sent' : 'received'}">${m.text}</div>`;
            }).join('');
        }

        box.scrollTop = box.scrollHeight;
    } catch (error) {
        console.error('Error loading messages:', error);
        box.innerHTML = '<div class="message received" style="color: var(--error);">Error al cargar mensajes</div>';
    }
}

async function sendMessage() {
    const input = document.getElementById('chat-input-field');
    const msg = input?.value.trim();

    if (!msg) return;

    if (!AuthModule.isAuthenticated()) {
        showToast('❌ Debes iniciar sesión para enviar mensajes');
        return;
    }

    // Get recipient from chat header or profile data
    const recipientId = currentProfileData?._id || currentProfileData?.id;
    if (!recipientId) {
        showToast('❌ Error: No se puede enviar el mensaje');
        return;
    }

    try {
        input.value = ''; // Clear immediately for better UX

        const response = await API.sendMessage(recipientId, msg);

        if (response.success) {
            // Reload messages
            await renderChat(recipientId);
        } else {
            showToast('❌ Error al enviar mensaje');
            input.value = msg; // Restore message on error
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showToast('❌ Error al enviar mensaje');
        input.value = msg; // Restore message on error
    }
}

// Monetization Logic
function openCheckout(planName, price, duration) {
    const pName = document.getElementById('checkout-plan-name');
    const pDuration = document.getElementById('checkout-plan-duration');
    const pTotal = document.getElementById('checkout-total');

    if (pName && pDuration && pTotal) {
        pName.textContent = planName;
        pDuration.textContent = duration;
        pTotal.textContent = `$${price.toFixed(2)} `;
    }

    navigateTo('screen-checkout');
}

function processPayment() {
    showToast('<i class="fas fa-shield-alt"></i> Procesando pago seguro...');

    setTimeout(() => {
        showToast('✅ Pago aprobado exitosamente.');
        setTimeout(() => {
            navigateTo('screen-dashboard');
            // Update UI to reflect active boost
            localStorage.setItem('scorta_boost_active', 'true');
            const statusBadge = document.querySelector('.ad-status-badge');
            if (statusBadge) {
                statusBadge.textContent = 'Boost Active';
                statusBadge.style.background = 'var(--accent)';
                statusBadge.style.color = 'var(--bg-dark)';
            }
            updateDynamicMetrics();
        }, 1500);
    }, 2500);
}

// Verification Flow Simulation
function startVerification() {
    const vBox = document.getElementById('verification-box');
    if (vBox) {
        vBox.innerHTML = `
    < div class="v-icon-box" style = "background: var(--success)" >
        <i class="fas fa-spinner fa-spin"></i>
            </div >
    <div class="v-text">
        <h4 style="color: var(--success)">Procesando solicitud...</h4>
        <p>Estamos validando tus documentos. Te avisaremos cuando tu insignia esté lista.</p>
        <div class="factor-bar" style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; margin-top: 10px;">
            <div class="factor-progress" style="width: 45%; height: 100%; background: var(--success); transition: width 3s ease;"></div>
        </div>
    </div>
`;

        setTimeout(() => {
            const progress = vBox.querySelector('.factor-progress');
            if (progress) progress.style.width = '100%';
        }, 100);

        setTimeout(() => {
            showToast('✅ Solicitud de verificación enviada con éxito.');
        }, 2000);
    }
}

// Dashboard Helper
function renderDashboardProfile() {
    const name = localStorage.getItem('scorta_user_name') || "Valeria";
    const age = localStorage.getItem('scorta_user_age') || "24";
    const adTitle = document.querySelector('.ad-details h4');
    if (adTitle) adTitle.textContent = `${name}, ${age} (Quito)`;
}

// User Settings Persistence
function loadSettingsFields() {
    const nameInput = document.getElementById('settings-name');
    const ageInput = document.getElementById('settings-age');
    const citySelect = document.getElementById('settings-city');

    if (nameInput) nameInput.value = localStorage.getItem('scorta_user_name') || "Valeria";
    if (ageInput) ageInput.value = localStorage.getItem('scorta_user_age') || "24";
    if (citySelect) citySelect.value = localStorage.getItem('scorta_user_city') || "Quito";
}

function saveUserSettings() {
    const name = document.getElementById('settings-name').value;
    const age = document.getElementById('settings-age').value;
    const city = document.getElementById('settings-city').value;

    if (!name || !age) {
        showToast('Completa todos los campos.');
        return;
    }

    localStorage.setItem('scorta_user_name', name);
    localStorage.setItem('scorta_user_age', age);
    localStorage.setItem('scorta_user_city', city);

    renderDashboardProfile();
    showToast('✅ Perfil actualizado.');
    navigateTo('screen-dashboard');
}

// Dynamic Metrics
function updateDynamicMetrics() {
    const isBoosted = localStorage.getItem('scorta_boost_active') === 'true';
    const viewsValue = document.querySelector('.metrics-grid .metric-card:first-child .metric-value');
    const clicksValue = document.querySelector('.metrics-grid .metric-card:last-child .metric-value');

    if (viewsValue && clicksValue) {
        let baseViews = parseInt(localStorage.getItem('scorta_base_views')) || 1240;
        let baseClicks = parseInt(localStorage.getItem('scorta_base_clicks')) || 42;

        // Daily increment simulation
        baseViews += Math.floor(Math.random() * 5);
        baseClicks += Math.floor(Math.random() * 2);

        let displayViews = baseViews;
        let displayClicks = baseClicks;

        if (isBoosted) {
            displayViews = Math.floor(baseViews * 2.5);
            displayClicks = Math.floor(baseClicks * 3.2);
        }

        viewsValue.textContent = displayViews.toLocaleString();
        clicksValue.textContent = displayClicks.toLocaleString();

        localStorage.setItem('scorta_base_views', baseViews);
        localStorage.setItem('scorta_base_clicks', baseClicks);
    }
}

// Photo Preview
function handlePhotoPreview(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            currentAdPhoto = e.target.result;
            const preview1 = document.getElementById('photo-preview-1');
            if (preview1) {
                preview1.style.backgroundImage = `url('${currentAdPhoto}')`;
                preview1.style.backgroundSize = 'cover';
                preview1.style.border = 'none';
                preview1.innerHTML = '';
            }
            showToast('📸 Foto cargada con éxito');
        };
        reader.readAsDataURL(file);
    }
}

// PWA Install Logic
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installTile = document.getElementById('pwa-install-tile');
    if (installTile) installTile.style.display = 'flex';
});

function triggerPWAInstall() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
                const installTile = document.getElementById('pwa-install-tile');
                if (installTile) installTile.style.display = 'none';
            }
            deferredPrompt = null;
        });
    } else {
        showToast('Instalación ya procesada o no soportada.');
    }
}

// Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // BUG #5 FIX: Check age verification on load and skip gate if verified
    const isAgeVerified = checkAgeVerification();
    const gate = document.getElementById('screen-gate');
    const nav = document.querySelector('.bottom-nav');

    if (isAgeVerified && gate && gate.classList.contains('active')) {
        // User already verified age, go directly to explore
        navigateTo('screen-explore');
    } else if (gate && gate.classList.contains('active')) {
        // Age gate is active, hide bottom nav
        if (nav) nav.style.display = 'none';
    }

    // Update auth UI state on page load
    updateAuthUI();
    updateUIForRole();

    // Render marketplace
    renderMarketplace();

    // Dashboard Interactivity
    const visibilityToggle = document.getElementById('visibility-toggle');
    if (visibilityToggle) {
        visibilityToggle.addEventListener('change', (e) => {
            const statusBadge = document.querySelector('.ad-status-badge');
            if (e.target.checked) {
                if (statusBadge) {
                    statusBadge.textContent = 'Publicado';
                    statusBadge.style.background = 'rgba(16, 185, 129, 0.15)';
                    statusBadge.style.color = 'var(--success)';
                }
                showToast('Anuncio visible para clientes.');
                localStorage.setItem('scorta_ad_visible', 'true');
            } else {
                if (statusBadge) {
                    statusBadge.textContent = 'Oculto';
                    statusBadge.style.background = 'rgba(239, 68, 68, 0.15)';
                    statusBadge.style.color = 'var(--danger)';
                }
                showToast('Anuncio oculto del marketplace.');
                localStorage.setItem('scorta_ad_visible', 'false');
            }
        });

        // Initial state from localStorage
        const isVisible = localStorage.getItem('scorta_ad_visible') !== 'false';
        visibilityToggle.checked = isVisible;
        const statusBadge = document.querySelector('.ad-status-badge');
        if (statusBadge) {
            statusBadge.textContent = isVisible ? 'Publicado' : 'Oculto';
            statusBadge.style.background = isVisible ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
            statusBadge.style.color = isVisible ? 'var(--success)' : 'var(--danger)';
        }
    }

    // Profile Settings persistence
    const settingsBtn = document.querySelector('.header-top .icon-btn i.fa-cog');
    if (settingsBtn) {
        settingsBtn.parentElement.addEventListener('click', () => {
            const newName = prompt("Editar Nombre:", localStorage.getItem('scorta_user_name') || "Valeria");
            const newAge = prompt("Editar Edad:", localStorage.getItem('scorta_user_age') || "24");
            if (newName && newAge) {
                localStorage.setItem('scorta_user_name', newName);
                localStorage.setItem('scorta_user_age', newAge);
                renderDashboardProfile();
                showToast('Perfil actualizado correctamente.');
            }
        });
    }
    renderDashboardProfile();

    const boostBtn = document.querySelector('.btn-boost');
    if (boostBtn) {
        boostBtn.addEventListener('click', () => {
            navigateTo('screen-plans');
        });
    }

    // Buttons simulation
    const whatsappBtn = document.querySelector('.btn-whatsapp');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            showToast('Abriendo chat seguro de WhatsApp...');
        });
    }

    const callBtn = document.querySelector('.btn-primary-sc');
    if (callBtn) {
        callBtn.addEventListener('click', () => {
            showToast('Llamada enmascarada iniciada...');
        });
    }

    // Publish-btn now handled by navigateTo('screen-create-ad') in HTML

    const panicBtn = document.querySelector('.btn-panic');
    if (panicBtn) {
        panicBtn.addEventListener('click', () => {
            alert('🚨 ALERTA DE SEGURIDAD ENVIADA: Tu ubicación y datos están siendo compartidos con el equipo de respuesta inmediata.');
        });
    }

    // Filter interaction
    const filterPills = document.querySelectorAll('.filter-pill');
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            showToast(`Filtrando por: ${pill.textContent} `);
        });
    });

    // Story interaction
    const stories = document.querySelectorAll('.story-item');
    stories.forEach(story => {
        story.addEventListener('click', () => {
            showToast('Viendo historia efímera...');
        });
    });

    // Chat Enter Key
    const chatInput = document.getElementById('chat-input-field');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('SW Registered!', reg))
                .catch(err => console.log('SW Registration Failed', err));
        });
    }
});

// Ad Creation Flow
function adNextStep(step) {
    const name = document.getElementById('ad-name').value;
    const age = document.getElementById('ad-age').value;

    if (step === 2 && (!name || !age)) {
        showToast('Completa el nombre y la edad.');
        return;
    }

    document.querySelectorAll('.ad-step').forEach(s => s.classList.remove('active'));
    document.getElementById(`ad-step-${step}`).classList.add('active');
    document.getElementById('step-indicator').textContent = `Paso ${step}/3`;
    currentAdStep = step;
}

function finalizeAd() {
    const name = document.getElementById('ad-name').value;
    const age = document.getElementById('ad-age').value;
    const city = document.getElementById('ad-city').value;
    const price = document.getElementById('ad-price').value;

    if (!price) {
        showToast('Por favor ingresa una tarifa.');
        return;
    }

    showToast('🚀 Publicando anuncio premium...');

    setTimeout(() => {
        const newAd = {
            id: 'custom_' + Date.now(),
            name: name,
            age: parseInt(age),
            city: city,
            price: price,
            verified: false,
            elite: false,
            img: currentAdPhoto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'
        };

        customAds.push(newAd);
        localStorage.setItem('scorta_custom_ads', JSON.stringify(customAds));

        // Reset and navigate
        resetAdForm();
        navigateTo('screen-explore');
        showToast('✅ ¡Anuncio publicado con éxito!');
    }, 2000);
}

function resetAdForm() {
    document.getElementById('ad-name').value = '';
    document.getElementById('ad-age').value = '';
    document.getElementById('ad-price').value = '';
    adNextStep(1);
}

/* ========================================
   AUTHENTICATION HANDLERS
======================================== */
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('login-remember').checked;

    showToast('Verificando credenciales...');

    try {
        const result = await AuthModule.loginUser(email, password, rememberMe);

        if (result.success) {
            showToast('✅ Bienvenido a SCORTA!');

            // Track login event
            if (window.Analytics) {
                window.Analytics.trackLogin('email');
            }

            // Initialize provider profile if user is a provider
            await initializeUserProfile();

            // Update auth UI
            updateAuthUI();

            setTimeout(() => navigateTo('screen-explore'), 1000);
        } else {
            showToast('❌ ' + result.message);
        }
    } catch (error) {
        showToast('❌ Error al iniciar sesión');
        console.error(error);
    }
}

async function handleRegister(event) {
    event.preventDefault();

    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;
    const role = document.getElementById('register-role').value;

    if (password !== passwordConfirm) {
        showToast('❌ Las contraseñas no coinciden');
        return;
    }

    if (!Utils.validateEmail(email)) {
        showToast('❌ Email inválido');
        return;
    }

    showToast('Creando tu cuenta...');

    try {
        const result = await AuthModule.registerUser({ email, password, role });

        if (result.success) {
            showToast('✅ Cuenta creada exitosamente!');

            // Track registration event
            if (window.Analytics) {
                window.Analytics.trackRegistration(role);
            }

            // Update auth UI
            updateAuthUI();

            setTimeout(() => navigateTo('screen-explore'), 1000);
        } else {
            showToast('❌ ' + result.message);
        }
    } catch (error) {
        showToast('❌ Error al registrar usuario');
        console.error(error);
    }
}

async function handleForgotPassword(event) {
    event.preventDefault();

    const email = document.getElementById('forgot-email').value;

    if (!Utils.validateEmail(email)) {
        showToast('❌ Email inválido');
        return;
    }

    showToast('Enviando enlace de recuperación...');

    try {
        // Simulation for now
        setTimeout(() => {
            showToast('✅ Si el correo está registrado, recibirás un enlace de recuperación pronto.');
            navigateTo('screen-gate');
        }, 1500);
    } catch (error) {
        showToast('❌ Error al solicitar recuperación');
        console.error(error);
    }
}

async function handleCompleteProfile(event) {
    event.preventDefault();

    const name = document.getElementById('profile-name').value;
    const phone = document.getElementById('profile-phone').value;
    const city = document.getElementById('profile-city').value;

    if (!Utils.validatePhone(phone)) {
        showToast('❌ Número de teléfono inválido');
        return;
    }

    showToast('Actualizando perfil...');

    try {
        const result = await AuthModule.updateUserProfile({ name, phone, city });

        if (result.success) {
            showToast('✅ Perfil completado!');
            setTimeout(() => navigateTo('screen-explore'), 1000);
        } else {
            showToast('❌ ' + result.message);
        }
    } catch (error) {
        showToast('❌ Error al actualizar perfil');
        console.error(error);
    }
}

/* ========================================
   WALLET & PAYMENT HANDLERS
======================================== */
let reviewPhotos = [];

function showAddFundsModal() {
    const modal = document.getElementById('add-funds-modal');
    if (modal) {
        modal.style.display = 'flex';
        loadPaymentMethodsDropdown();
    }
}

function closeAddFundsModal() {
    const modal = document.getElementById('add-funds-modal');
    if (modal) modal.style.display = 'none';
}

function setFundsAmount(amount) {
    const input = document.getElementById('add-funds-amount');
    if (input) input.value = amount;
}

function loadPaymentMethodsDropdown() {
    const select = document.getElementById('add-funds-payment-method');
    if (!select) return;

    const methods = PaymentModule.getPaymentMethods();

    select.innerHTML = '<option value="">Seleccionar método</option>';
    methods.forEach(method => {
        const option = document.createElement('option');
        option.value = method.id;
        option.textContent = `${method.cardType} •••• ${method.last4}`;
        if (method.isDefault) option.selected = true;
        select.appendChild(option);
    });
}

function processAddFunds() {
    const amount = parseFloat(document.getElementById('add-funds-amount').value);
    const methodId = document.getElementById('add-funds-payment-method').value;

    if (!amount || amount < 10) {
        showToast('❌ Monto mínimo: $10');
        return;
    }

    if (!methodId) {
        showToast('❌ Selecciona un método de pago');
        return;
    }

    const methods = PaymentModule.getPaymentMethods();
    const method = methods.find(m => m.id === methodId);

    showToast('Procesando pago...');
    closeAddFundsModal();

    PaymentModule.processPayment(amount, method, {
        type: 'wallet_topup',
        description: 'Recarga de billetera'
    }).then(result => {
        if (result.success) {
            PaymentModule._updateWalletBalance(amount);
            updateWalletDisplay();
            showToast('✅ Fondos agregados exitosamente!');
        }
    }).catch(error => {
        showToast('❌ ' + error.message);
    });
}

function updateWalletDisplay() {
    const balanceEl = document.getElementById('wallet-balance');
    if (balanceEl) {
        const balance = PaymentModule.getWalletBalance();
        balanceEl.textContent = Utils.formatPrice(balance);
    }
    loadRecentTransactions();
}

function loadRecentTransactions() {
    const list = document.getElementById('recent-transactions-list');
    if (!list) return;

    const transactions = PaymentModule.getTransactionHistory(5);

    if (transactions.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No hay transacciones recientes</p>';
        return;
    }

    list.innerHTML = transactions.map(t => `
        <div class="transaction-item glass-card" style="padding: 15px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${t.metadata.description || 'Transacción'}</strong>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 3px;">
                        ${Utils.formatDate(t.createdAt)}
                    </p>
                </div>
                <div style="text-align: right;">
                    <strong style="color: ${t.status === 'completed' ? 'var(--success)' : 'var(--danger)'};">
                        ${Utils.formatPrice(t.amount)}
                    </strong>
                    <p style="font-size: 0.7rem; text-transform: capitalize;">${t.status}</p>
                </div>
            </div>
        </div>
    `).join('');
}

function showAddPaymentMethodModal() {
    closeAddFundsModal(); // Close add funds modal if open
    const modal = document.getElementById('add-payment-method-modal');
    if (modal) modal.style.display = 'flex';
}

function closeAddPaymentMethodModal() {
    const modal = document.getElementById('add-payment-method-modal');
    if (modal) modal.style.display = 'none';
}

function formatCardNumberInput(input) {
    input.value = Utils.formatCreditCard(input.value);

    const cardType = Utils.getCardType(input.value);
    const indicator = document.getElementById('card-type-indicator');
    if (indicator) {
        if (cardType !== 'unknown') {
            indicator.textContent = `💳 ${cardType.toUpperCase()}`;
            indicator.style.color = 'var(--accent)';
        } else {
            indicator.textContent = '';
        }
    }
}

function formatExpiryInput(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    input.value = value;
}

function handleAddPaymentMethod(event) {
    event.preventDefault();

    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const holderName = document.getElementById('card-holder-name').value;
    const expiry = document.getElementById('card-expiry').value;
    const cvv = document.getElementById('card-cvv').value;

    if (!Utils.validateCreditCard(cardNumber)) {
        showToast('❌ Número de tarjeta inválido');
        return;
    }

    const [month, year] = expiry.split('/');

    const result = PaymentModule.addPaymentMethod({
        number: cardNumber,
        holderName: holderName,
        expiryMonth: month,
        expiryYear: year,
        cvv: cvv
    });

    if (result.success) {
        showToast('✅ Tarjeta agregada exitosamente');
        closeAddPaymentMethodModal();
        loadPaymentMethods();
        // Clear form
        document.getElementById('add-payment-method-form').reset();
    } else {
        showToast('❌ ' + result.message);
    }
}

function loadPaymentMethods() {
    const list = document.getElementById('payment-methods-list');
    const emptyState = document.getElementById('payment-methods-empty');
    if (!list) return;

    const methods = PaymentModule.getPaymentMethods();

    if (methods.length === 0) {
        if (list) list.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    list.innerHTML = methods.map(method => `
        <div class="payment-method-card glass-card" style="padding: 20px; margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                        <i class="fas fa-credit-card" style="color: var(--accent);"></i>
                        <strong>${method.cardType.toUpperCase()}</strong>
                        ${method.isDefault ? '<span class="badge" style="font-size: 0.7rem; padding: 2px 8px;">Principal</span>' : ''}
                    </div>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">
                        •••• •••• •••• ${method.last4}
                    </p>
                    <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 3px;">
                        Vence: ${method.expiryMonth}/${method.expiryYear}
                    </p>
                </div>
                <div style="display:flex; flex-direction: column; gap: 8px;">
                    ${!method.isDefault ? `
                        <button class="btn-outline" style="padding: 6px 12px; font-size: 0.8rem;" onclick="setDefaultPaymentMethod('${method.id}')">
                            Hacer principal
                        </button>
                    ` : ''}
                    <button class="text-link" style="color: var(--danger);" onclick="removePaymentMethod('${method.id}')">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function setDefaultPaymentMethod(methodId) {
    const result = PaymentModule.setDefaultPaymentMethod(methodId);
    if (result.success) {
        showToast('✅ Metodo actualizado');
        loadPaymentMethods();
    }
}

function removePaymentMethod(methodId) {
    if (confirm('¿Estás seguro de que deseas eliminar este método de pago?')) {
        const result = PaymentModule.removePaymentMethod(methodId);
        if (result.success) {
            showToast('✅ Método eliminado');
            loadPaymentMethods();
        }
    }
}

/* ========================================
   ENHANCED REVIEWS WITH PHOTOS
======================================== */
function handleReviewPhotosUpload(event) {
    const files = Array.from(event.target.files);

    if (files.length + reviewPhotos.length > 4) {
        showToast('❌ Máximo 4 fotos por reseña');
        return;
    }

    const preview = document.getElementById('review-photos-preview');

    files.forEach(file => {
        Utils.compressImage(file, 600, 0.8).then(blob => {
            Utils.fileToBase64(blob).then(base64 => {
                reviewPhotos.push(base64);

                const photoEl = document.createElement('div');
                photoEl.className = 'review-photo-item';
                photoEl.innerHTML = `
                    <img src="${base64}" alt="Review photo">
                    <button class="remove-photo-btn" onclick="removeReviewPhoto(${reviewPhotos.length - 1})">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                preview.appendChild(photoEl);
            });
        });
    });
}

function removeReviewPhoto(index) {
    reviewPhotos.splice(index, 1);
    const preview = document.getElementById('review-photos-preview');
    if (preview) {
        preview.innerHTML = '';
        reviewPhotos.forEach((photo, i) => {
            const photoEl = document.createElement('div');
            photoEl.className = 'review-photo-item';
            photoEl.innerHTML = `
                <img src="${photo}" alt="Review photo">
                <button class="remove-photo-btn" onclick="removeReviewPhoto(${i})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            preview.appendChild(photoEl);
        });
    }
}

function sortReviews(criteria) {
    if (!currentProfileData) return;

    let allReviews = JSON.parse(localStorage.getItem('scorta_reviews')) || {};
    let reviews = allReviews[currentProfileData.id] || [];

    switch (criteria) {
        case 'newest':
            reviews.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
            break;
        case 'highest':
            reviews.sort((a, b) => b.rating - a.rating);
            break;
        case 'lowest':
            reviews.sort((a, b) => a.rating - b.rating);
            break;
        case 'helpful':
            reviews.sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
            break;
    }

    renderReviewsList(reviews);
}

function renderReviewsList(reviews) {
    const list = document.getElementById('reviews-list');
    if (!list) return;

    if (reviews.length === 0) {
        list.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 40px;">
                <p style="color: var(--text-secondary);">Aún no hay reseñas</p>
            </div>
        `;
        return;
    }

    list.innerHTML = reviews.map(r => `
        <div class="review-mini glass-card">
            <div class="review-header">
                <span class="rating-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                <span class="review-date">${Utils.formatDate(r.date || Date.now())}</span>
            </div>
            <p>"${r.text}"</p>
            ${r.photos && r.photos.length > 0 ? `
                <div class="review-photos-gallery">
                    ${r.photos.map(photo => `
                        <img src="${photo}" alt="Review photo" class="review-photo" onclick="viewPhotoFullscreen('${photo}')">
                    `).join('')}
                </div>
            ` : ''}
            <div class="review-actions" style="margin-top: 10px; display: flex; gap: 15px; font-size: 0.85rem;">
                <button class="review-vote-btn" onclick="voteReview('${currentProfileData.id}', '${r.id || Date.now()}', 'helpful')">
                    <i class="fas fa-thumbs-up"></i> Útil (${r.helpful || 0})
                </button>
                <button class="review-vote-btn" onclick="voteReview('${currentProfileData.id}', '${r.id || Date.now()}', 'not-helpful')">
                    <i class="fas fa-thumbs-down"></i> No útil (${r.notHelpful || 0})
                </button>
            </div>
        </div>
    `).join('');
}

function voteReview(profileId, reviewId, voteType) {
    let allReviews = JSON.parse(localStorage.getItem('scorta_reviews')) || {};
    let reviews = allReviews[profileId] || [];

    const review = reviews.find(r => (r.id || r.date) == reviewId);
    if (!review) return;

    if (voteType === 'helpful') {
        review.helpful = (review.helpful || 0) + 1;
        showToast('¡Gracias por tu voto!');
    } else {
        review.notHelpful = (review.notHelpful || 0) + 1;
        showToast('Voto registrado');
    }

    localStorage.setItem('scorta_reviews', JSON.stringify(allReviews));
    renderReviews(profileId);
}

function viewPhotoFullscreen(photoUrl) {
    // Simple fullscreen photo viewer
    const viewer = document.createElement('div');
    viewer.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 10000; display: flex; align-items: center; justify-content: center;';
    viewer.innerHTML = `
        <img src="${photoUrl}" style="max-width: 90%; max-height: 90%; object-fit: contain;">
        <button onclick="this.parentElement.remove()" style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.2); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer;">
            <i class="fas fa-times"></i>
        </button>
    `;
    document.body.appendChild(viewer);
}

/* ========================================
   ENHANCED VERIFICATION
======================================== */
let verificationData = {
    docFront: null,
    docBack: null,
    selfie: null,
    currentStep: 1
};

function handleDocumentUpload(event, side) {
    const file = event.target.files[0];
    if (!file) return;

    Utils.compressImage(file, 1200, 0.9).then(blob => {
        Utils.fileToBase64(blob).then(base64 => {
            if (side === 'front') {
                verificationData.docFront = base64;
                const preview = document.getElementById('doc-front-preview');
                if (preview) preview.innerHTML = `<img src="${base64}" style="width: 100%; border-radius: 8px;">`;
            } else {
                verificationData.docBack = base64;
                const preview = document.getElementById('doc-back-preview');
                if (preview) preview.innerHTML = `<img src="${base64}" style="width: 100%; border-radius: 8px;">`;
            }
            showToast('📄 Documento cargado');
        });
    });
}

function handleSelfieUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    Utils.compressImage(file, 800, 0.9).then(blob => {
        Utils.fileToBase64(blob).then(base64 => {
            verificationData.selfie = base64;
            const preview = document.getElementById('selfie-preview');
            if (preview) preview.innerHTML = `<img src="${base64}" style="width: 100%; border-radius: 8px;">`;
            showToast('📸 Selfie capturada');
        });
    });
}

function nextVerificationStep(step) {
    // Validate current step
    if (step === 2 && (!verificationData.docFront || !verificationData.docBack)) {
        showToast('❌ Sube ambos lados del documento');
        return;
    }

    if (step === 3 && !verificationData.selfie) {
        showToast('❌ Toma una selfie para continuar');
        return;
    }

    // Hide all steps
    document.querySelectorAll('.verification-step').forEach(s => s.classList.remove('active'));

    // Show target step
    const targetStep = document.getElementById(`verification-step-${step}`);
    if (targetStep) targetStep.classList.add('active');

    // Update indicator
    const indicator = document.getElementById('verification-step-indicator');
    if (indicator) indicator.textContent = `Paso ${step}/3`;

    verificationData.currentStep = step;

    // If step 3, show summary
    if (step === 3) {
        showVerificationSummary();
    }
}

function showVerificationSummary() {
    const summary = document.getElementById('verification-summary');
    if (!summary) return;

    summary.innerHTML = `
        <div style="display: grid; gap: 15px;">
            <div class="glass-card" style="padding: 15px;">
                <h4 style="margin-bottom: 10px;">Documentos Subidos</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    ${verificationData.docFront ? `<img src="${verificationData.docFront}" style="width: 100%; border-radius: 8px;">` : ''}
                    ${verificationData.docBack ? `<img src="${verificationData.docBack}" style="width: 100%; border-radius: 8px;">` : ''}
                </div>
            </div>
            <div class="glass-card" style="padding: 15px;">
                <h4 style="margin-bottom: 10px;">Selfie de Verificación</h4>
                ${verificationData.selfie ? `<img src="${verificationData.selfie}" style="width: 100%; max-width: 200px; border-radius: 8px;">` : ''}
            </div>
        </div>
    `;
}

function submitVerification() {
    showToast('Enviando verificación...');

    setTimeout(() => {
        // Save verification request
        const verificationRequest = {
            id: 'verify_' + Date.now(),
            userId: AuthModule.getCurrentUser()?.id,
            documents: {
                front: verificationData.docFront,
                back: verificationData.docBack,
                selfie: verificationData.selfie
            },
            status: 'pending',
            submittedAt: new Date().toISOString()
        };

        localStorage.setItem('scorta_verification_request', JSON.stringify(verificationRequest));

        showToast('✅ Verificación enviada con éxito!');

        // Reset verification data
        verificationData = { docFront: null, docBack: null, selfie: null, currentStep: 1 };

        setTimeout(() => navigateTo('screen-dashboard'), 2000);
    }, 2000);
}

// Expose new global functions
// Map Logic
function initMap() {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) {
        console.error('Map container not found');
        return;
    }

    if (map) {
        setTimeout(() => map.invalidateSize(), 100);
        return;
    }

    // Default center in Quito
    map = L.map('map-container', {
        zoomControl: false,
        attributionControl: false
    }).setView([-0.1807, -78.4678], 13); // Quito center

    // Add tile layer - OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    renderMapMarkers();
}

function renderMapMarkers() {
    if (!map) return;

    // Clear existing markers (if any simple way)
    // For this prototype we'll just add them once for simplicity

    const allProfiles = [...defaultProfiles, ...customAds];
    allProfiles.forEach(p => {
        if (p.lat && p.lng) {
            const customIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-image: url('${p.img}'); width: 40px; height: 40px; background-size: cover; border-radius: 50%;"></div>`,
                iconSize: [44, 44],
                iconAnchor: [22, 22]
            });

            L.marker([p.lat, p.lng], { icon: customIcon })
                .addTo(map)
                .bindPopup(`
                    <div style="text-align: center;">
                        <img src="${p.img}" style="width: 100px; height: 100px; border-radius: 10px; object-fit: cover;">
                        <h4>${p.name}, ${p.age}</h4>
                        <p>${p.city} - $${p.price}</p>
                        <button class="btn-primary-sc btn-small" onclick="openProfileFromData(${JSON.stringify(p).replace(/"/g, '&quot;')})">Ver Perfil</button>
                    </div>
                `);
        }
    });
}

// Advanced Filters Logic
function toggleFilterModal() {
    const modal = document.getElementById('filter-modal');
    modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
}

function applyAdvancedFilters() {
    advancedFilters = {
        price: parseInt(document.getElementById('filter-price').value),
        city: document.getElementById('filter-city').value,
        ethnicity: document.getElementById('filter-ethnicity').value,
        nationality: document.getElementById('filter-nationality').value
    };

    toggleFilterModal();
    renderMarketplace();
    showToast('Filtros aplicados con éxito');
}

window.navigateTo = navigateTo;
window.openProfile = openProfile;
window.showToast = showToast;
window.startVerification = startVerification;
window.openCheckout = openCheckout;
window.processPayment = processPayment;
window.toggleFavorite = toggleFavorite;
window.toggleReviewForm = toggleReviewForm;
window.setRating = setRating;
window.submitReview = submitReview;
window.openChat = openChat;
window.sendMessage = sendMessage;
window.adNextStep = adNextStep;
window.finalizeAd = finalizeAd;
window.handleSearch = handleSearch;
window.filterBy = filterBy;
window.openProfileFromData = openProfileFromData;
window.saveUserSettings = saveUserSettings;
window.handlePhotoPreview = handlePhotoPreview;
window.triggerPWAInstall = triggerPWAInstall;
window.toggleFilterModal = toggleFilterModal;
window.applyAdvancedFilters = applyAdvancedFilters;

// Authentication exports
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleForgotPassword = handleForgotPassword;
window.handleCompleteProfile = handleCompleteProfile;

// Wallet & Payment exports
window.showAddFundsModal = showAddFundsModal;
window.closeAddFundsModal = closeAddFundsModal;
window.setFundsAmount = setFundsAmount;
window.processAddFunds = processAddFunds;
window.updateWalletDisplay = updateWalletDisplay;
window.showAddPaymentMethodModal = showAddPaymentMethodModal;
window.closeAddPaymentMethodModal = closeAddPaymentMethodModal;
window.formatCardNumberInput = formatCardNumberInput;
window.formatExpiryInput = formatExpiryInput;
window.handleAddPaymentMethod = handleAddPaymentMethod;
window.loadPaymentMethods = loadPaymentMethods;
window.setDefaultPaymentMethod = setDefaultPaymentMethod;
window.removePaymentMethod = removePaymentMethod;

// Enhanced Reviews exports
window.handleReviewPhotosUpload = handleReviewPhotosUpload;
window.removeReviewPhoto = removeReviewPhoto;
window.sortReviews = sortReviews;
window.voteReview = voteReview;
window.viewPhotoFullscreen = viewPhotoFullscreen;

// Enhanced Verification exports
window.handleDocumentUpload = handleDocumentUpload;
window.handleSelfieUpload = handleSelfieUpload;
window.nextVerificationStep = nextVerificationStep;
window.submitVerification = submitVerification;

/* ========================================
   ADMIN PANEL FUNCTIONS
======================================== */

// Admin Authentication
function handleAdminLogin(event) {
    event.preventDefault();

    const email = document.getElementById('admin-login-email').value;
    const password = document.getElementById('admin-login-password').value;

    showToast('Verificando credenciales de administrador...');

    setTimeout(() => {
        const result = AuthModule.loginUser(email, password, false);

        if (result.success && AuthModule.isAdmin()) {
            showToast('✅ Acceso concedido');
            setTimeout(() => {
                navigateTo('screen-admin-dashboard');
                initializeAdminPanel();
            }, 1000);
        } else {
            showToast('❌ No tienes permisos de administrador');
        }
    }, 1000);
}

function handleAdminLogout() {
    showToast('Cerrando sesión de administrador...');
    setTimeout(() => {
        AuthModule.logoutUser();
        navigateTo('screen-admin-login');
    }, 500);
}

// Admin Navigation
function showAdminView(viewId) {
    document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));
    const view = document.getElementById(viewId);
    if (view) view.classList.add('active');

    // Update nav active state
    document.querySelectorAll('.admin-nav-item').forEach(item => item.classList.remove('active'));
}

function showAdminDashboard() {
    showAdminView('admin-view-dashboard');
    document.querySelectorAll('.admin-nav-item')[0].classList.add('active');
    loadDashboardMetrics();
    loadDashboardCharts();
    loadDashboardAlerts();
}

function showAdminVerifications() {
    showAdminView('admin-view-verifications');
    document.querySelectorAll('.admin-nav-item')[1].classList.add('active');
    filterVerifications('pending');
}

function showAdminUsers() {
    showAdminView('admin-view-users');
    document.querySelectorAll('.admin-nav-item')[2].classList.add('active');
    loadUsersList();
}

function showAdminReports() {
    showAdminView('admin-view-reports');
    document.querySelectorAll('.admin-nav-item')[3].classList.add('active');
    filterReports('pending');
}

function showAdminTransactions() {
    showAdminView('admin-view-transactions');
    document.querySelectorAll('.admin-nav-item')[4].classList.add('active');
    loadTransactionsList();
    loadTransactionsSummary();
}

function showAdminSettings() {
    showAdminView('admin-view-settings');
    document.querySelectorAll('.admin-nav-item')[5].classList.add('active');
    loadPlatformSettings();
}

// Initialize Admin Panel
function initializeAdminPanel() {
    loadDashboardMetrics();
    loadDashboardCharts();
    loadDashboardAlerts();
    updateAdminBadges();
}

// Dashboard Functions
function loadDashboardMetrics() {
    const metrics = AdminModule.getDashboardMetrics();

    document.getElementById('metric-total-users').textContent = metrics.users;
    document.getElementById('metric-users-trend').textContent = metrics.userGrowth;
    document.getElementById('metric-providers').textContent = metrics.providers;
    document.getElementById('metric-revenue').textContent = '$' + metrics.monthlyRevenue.toFixed(2);
    document.getElementById('metric-transactions').textContent = metrics.transactions;
}

function loadDashboardAlerts() {
    const alerts = AdminModule.getPendingAlerts();
    const container = document.getElementById('admin-alerts-list');

    if (alerts.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">No hay alertas pendientes</p>';
        return;
    }

    container.innerHTML = alerts.map(alert => `
        <div class="alert-card ${alert.type}" onclick="handleAlertClick('${alert.action}')">
            <i class="fas fa-exclamation-triangle"></i>
            <div>
                <strong>${alert.message}</strong>
            </div>
        </div>
    `).join('');
}

function handleAlertClick(action) {
    if (action === 'verifications') showAdminVerifications();
    if (action === 'reports') showAdminReports();
    if (action === 'users') showAdminUsers();
}

function loadDashboardCharts() {
    // Simple chart rendering using canvas
    drawUserGrowthChart();
    drawRevenueChart();
}

function drawUserGrowthChart() {
    const canvas = document.getElementById('users-growth-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const data = AdminModule.getUserGrowthData(30);

    // Simple line chart
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const maxCount = Math.max(...data.map(d => d.count), 1);
    data.forEach((point, index) => {
        const x = (index / data.length) * canvas.width;
        const y = canvas.height - ((point.count / maxCount) * canvas.height * 0.8);

        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.stroke();
}

function drawRevenueChart() {
    const canvas = document.getElementById('revenue-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const data = AdminModule.getRevenueData(30);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#10b981';

    const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
    const barWidth = canvas.width / data.length;

    data.forEach((point, index) => {
        const barHeight = (point.revenue / maxRevenue) * canvas.height * 0.8;
        const x = index * barWidth;
        const y = canvas.height - barHeight;

        ctx.fillRect(x, y, barWidth * 0.8, barHeight);
    });
}

// Verifications Management
function filterVerifications(status) {
    const requests = AdminModule.getVerificationRequests(status);
    const container = document.getElementById('verifications-list');

    // Update tab active state
    document.querySelectorAll('#admin-view-verifications .admin-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');

    if (requests.length === 0) {
        container.innerHTML = '<div class="empty-state-admin"><i class="fas fa-id-card"></i><p>No hay verificaciones ' + (status === 'all' ? '' : status + 's') + '</p></div>';
        return;
    }

    container.innerHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${requests.map(req => `
                    <tr>
                        <td>${req.userName}</td>
                        <td>${req.userEmail}</td>
                        <td>${new Date(req.submittedAt).toLocaleDateString()}</td>
                        <td><span class="status-badge ${req.status}">${req.status}</span></td>
                        <td>
                            <div class="action-btns">
                                <button class="btn-action view" onclick="reviewVerification('${req.id}')">
                                    <i class="fas fa-eye"></i> Ver
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function reviewVerification(requestId) {
    const request = AdminModule.getVerificationRequests().find(r => r.id === requestId);
    if (!request) return;

    const modal = document.getElementById('verification-review-modal');
    const content = document.getElementById('verification-review-content');

    content.innerHTML = `
        <div class="verification-documents">
            <div class="doc-preview">
                <img src="${request.documents.front}" alt="Documento Frontal">
                <div class="doc-preview-label">Documento - Frontal</div>
            </div>
            <div class="doc-preview">
                <img src="${request.documents.back}" alt="Documento Posterior">
                <div class="doc-preview-label">Documento - Posterior</div>
            </div>
            <div class="doc-preview">
                <img src="${request.documents.selfie}" alt="Selfie">
                <div class="doc-preview-label">Selfie de Verificación</div>
            </div>
        </div>
        
        <div style="margin-top: 24px;">
            <h4>Información del Usuario</h4>
            <p><strong>Nombre:</strong> ${request.userName}</p>
            <p><strong>Email:</strong> ${request.userEmail}</p>
            <p><strong>Tipo de Documento:</strong> ${request.documentType}</p>
            <p><strong>Fecha de Solicitud:</strong> ${new Date(request.submittedAt).toLocaleString()}</p>
        </div>
        
        <div style="margin-top: 24px;">
            <label style="display: block; margin-bottom: 8px;">Notas (opcional):</label>
            <textarea id="verification-notes" class="glass-input" rows="3" placeholder="Agrega notas sobre esta verificación..."></textarea>
        </div>
        
        <div style="display: flex; gap: 12px; margin-top: 24px;">
            <button class="btn-primary" onclick="approveVerificationRequest('${requestId}')" style="flex: 1; background: var(--success);">
                <i class="fas fa-check"></i> Aprobar
            </button>
            <button class="btn-primary" onclick="rejectVerificationRequest('${requestId}')" style="flex: 1; background: var(--danger);">
                <i class="fas fa-times"></i> Rechazar
            </button>
        </div>
    `;

    modal.style.display = 'flex';
}

function closeVerificationReviewModal() {
    document.getElementById('verification-review-modal').style.display = 'none';
}

function approveVerificationRequest(requestId) {
    const notes = document.getElementById('verification-notes').value;
    const result = AdminModule.approveVerification(requestId, notes);

    if (result.success) {
        showToast('✅ Verificación aprobada');
        closeVerificationReviewModal();
        filterVerifications('pending');
        updateAdminBadges();
    } else {
        showToast('❌ ' + result.message);
    }
}

function rejectVerificationRequest(requestId) {
    const reason = prompt('Motivo del rechazo:');
    if (!reason) return;

    const result = AdminModule.rejectVerification(requestId, reason);

    if (result.success) {
        showToast('❌ Verificación rechazada');
        closeVerificationReviewModal();
        filterVerifications('pending');
        updateAdminBadges();
    } else {
        showToast('❌ ' + result.message);
    }
}

// Users Management
function loadUsersList() {
    filterUsers();
}

function filterUsers() {
    const roleFilter = document.getElementById('users-role-filter').value;
    const verifiedFilter = document.getElementById('users-verified-filter').value;
    const statusFilter = document.getElementById('users-status-filter').value;

    const filters = {
        role: roleFilter,
        verified: verifiedFilter,
        status: statusFilter
    };

    const users = AdminModule.getAllUsers(filters);
    const container = document.getElementById('users-list');

    if (users.length === 0) {
        container.innerHTML = '<div class="empty-state-admin"><i class="fas fa-users"></i><p>No se encontraron usuarios</p></div>';
        return;
    }

    container.innerHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Verificado</th>
                    <th>Fecha Registro</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.name || 'Sin nombre'}</td>
                        <td>${user.email}</td>
                        <td><span class="status-badge ${user.role}">${user.role}</span></td>
                        <td>${user.verified ? '<i class="fas fa-check-circle" style="color: var(--success);"></i>' : '<i class="fas fa-times-circle" style="color: var(--danger);"></i>'}</td>
                        <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                            <div class="action-btns">
                                <button class="btn-action view" onclick="viewUserDetail('${user.id}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                ${user.status !== 'suspended' ?
            `<button class="btn-action reject" onclick="suspendUserAccount('${user.id}')">
                                        <i class="fas fa-ban"></i>
                                    </button>` :
            `<button class="btn-action approve" onclick="activateUserAccount('${user.id}')">
                                        <i class="fas fa-check"></i>
                                    </button>`
        }
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function viewUserDetail(userId) {
    const user = AdminModule.getUserDetails(userId);
    if (!user) return;

    const content = document.getElementById('user-detail-content');
    content.innerHTML = `
        <div class="user-detail-header">
            <div class="user-detail-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="user-detail-info">
                <h2>${user.name || 'Usuario'}</h2>
                <div class="user-detail-meta">
                    <span><i class="fas fa-envelope"></i> ${user.email}</span>
                    <span><i class="fas fa-phone"></i> ${user.phone || 'No disponible'}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${user.city || 'No disponible'}</span>
                    <span><i class="fas fa-calendar"></i> Registrado: ${new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div style="margin-top: 12px;">
                    <span class="status-badge ${user.role}">${user.role}</span>
                    <span class="status-badge ${user.verified ? 'approved' : 'pending'}">${user.verified ? 'Verificado' : 'No Verificado'}</span>
                    ${user.status ? `<span class="status-badge ${user.status}">${user.status}</span>` : ''}
                </div>
                <div class="user-detail-actions">
                    ${user.status !== 'suspended' ?
            `<button class="btn-primary" style="background: var(--danger);" onclick="suspendUserAccount('${userId}')">
                            <i class="fas fa-ban"></i> Suspender
                        </button>` :
            `<button class="btn-primary" style="background: var(--success);" onclick="activateUserAccount('${userId}')">
                            <i class="fas fa-check"></i> Activar
                        </button>`
        }
                </div>
            </div>
        </div>
    `;

    showAdminView('admin-view-user-detail');
}

function suspendUserAccount(userId) {
    const reason = prompt('Motivo de suspensión:');
    if (!reason) return;

    const result = AdminModule.suspendUser(userId, reason);
    if (result.success) {
        showToast('✅ Usuario suspendido');
        loadUsersList();
    }
}

function activateUserAccount(userId) {
    const result = AdminModule.activateUser(userId);
    if (result.success) {
        showToast('✅ Usuario activado');
        loadUsersList();
    }
}

// Reports Management
function filterReports(status) {
    const reports = AdminModule.getReports(status);
    const container = document.getElementById('reports-list');

    // Update tab active state
    document.querySelectorAll('#admin-view-reports .admin-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');

    if (reports.length === 0) {
        container.innerHTML = '<div class="empty-state-admin"><i class="fas fa-flag"></i><p>No hay reportes</p></div>';
        return;
    }

    container.innerHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Tipo</th>
                    <th>Usuario Reportado</th>
                    <th>Descripción</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${reports.map(report => `
                    <tr>
                        <td>${report.type.replace('_', ' ')}</td>
                        <td>${report.reportedUserName}</td>
                        <td>${report.description.substring(0, 50)}...</td>
                        <td>${new Date(report.createdAt).toLocaleDateString()}</td>
                        <td><span class="status-badge ${report.status}">${report.status}</span></td>
                        <td>
                            <div class="action-btns">
                                <button class="btn-action view" onclick="reviewReport('${report.id}')">
                                    <i class="fas fa-eye"></i> Ver
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function reviewReport(reportId) {
    const report = AdminModule.getReports().find(r => r.id === reportId);
    if (!report) return;

    const modal = document.getElementById('report-review-modal');
    const content = document.getElementById('report-review-content');

    content.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h4>Detalles del Reporte</h4>
            <p><strong>Tipo:</strong> ${report.type.replace('_', ' ')}</p>
            <p><strong>Usuario Reportado:</strong> ${report.reportedUserName}</p>
            <p><strong>Descripción:</strong></p>
            <p style="padding: 12px; background: var(--surface); border-radius: 8px;">${report.description}</p>
            <p><strong>Prioridad:</strong> <span class="status-badge ${report.priority}">${report.priority}</span></p>
        </div>
        
        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px;">Resolución:</label>
            <select id="report-resolution" class="glass-input">
                <option value="warning_issued">Advertencia emitida</option>
                <option value="profile_suspended">Perfil suspendido</option>
                <option value="no_action">Sin acción necesaria</option>
                <option value="under_investigation">En investigación</option>
            </select>
        </div>
        
        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px;">Notas:</label>
            <textarea id="report-notes" class="glass-input" rows="3" placeholder="Detalles de la resolución..."></textarea>
        </div>
        
        <button class="btn-primary w-full" onclick="resolveReportAction('${reportId}')">
            <i class="fas fa-check"></i> Resolver Reporte
        </button>
    `;

    modal.style.display = 'flex';
}

function closeReportReviewModal() {
    document.getElementById('report-review-modal').style.display = 'none';
}

function resolveReportAction(reportId) {
    const resolution = document.getElementById('report-resolution').value;
    const notes = document.getElementById('report-notes').value;

    const result = AdminModule.resolveReport(reportId, resolution, notes);
    if (result.success) {
        showToast('✅ Reporte resuelto');
        closeReportReviewModal();
        filterReports('pending');
        updateAdminBadges();
    }
}

// Transactions Management
function loadTransactionsList() {
    const typeFilter = document.getElementById('transactions-type-filter').value;
    const dateFrom = document.getElementById('transactions-date-from').value;
    const dateTo = document.getElementById('transactions-date-to').value;

    const filters = {
        type: typeFilter,
        dateFrom: dateFrom,
        dateTo: dateTo
    };

    const transactions = AdminModule.getAllTransactions(filters);
    const container = document.getElementById('transactions-list');

    container.innerHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Tipo</th>
                    <th>Usuario</th>
                    <th>Monto</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                ${transactions.slice(0, 50).map(txn => `
                    <tr>
                        <td>${txn.id.substring(0, 12)}...</td>
                        <td>${txn.type}</td>
                        <td>${txn.userName || 'N/A'}</td>
                        <td>$${txn.amount.toFixed(2)}</td>
                        <td>${new Date(txn.date).toLocaleDateString()}</td>
                        <td><span class="status-badge ${txn.status}">${txn.status}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function loadTransactionsSummary() {
    const stats = AdminModule.getTransactionStats();
    document.getElementById('total-revenue').textContent = '$' + stats.totalRevenue.toFixed(2);
    document.getElementById('monthly-revenue').textContent = '$' + stats.monthlyRevenue.toFixed(2);

    // Calculate today's transactions
    const today = new Date().toDateString();
    const todayCount = AdminModule.getAllTransactions().filter(t =>
        new Date(t.date).toDateString() === today
    ).length;
    document.getElementById('today-transactions').textContent = todayCount;
}

// Platform Settings
function loadPlatformSettings() {
    const settings = AdminModule.getPlatformSettings();

    document.getElementById('setting-commission').value = settings.commission;
    document.getElementById('setting-min-price').value = settings.minServicePrice;
    document.getElementById('setting-max-price').value = settings.maxServicePrice;
    document.getElementById('setting-require-verification').checked = settings.requireVerification;
    document.getElementById('setting-auto-approve').checked = settings.autoApproveProfiles;
}

function savePlatformSettings(event) {
    event.preventDefault();

    const settings = {
        commission: parseFloat(document.getElementById('setting-commission').value),
        minServicePrice: parseFloat(document.getElementById('setting-min-price').value),
        maxServicePrice: parseFloat(document.getElementById('setting-max-price').value),
        requireVerification: document.getElementById('setting-require-verification').checked,
        autoApproveProfiles: document.getElementById('setting-auto-approve').checked
    };

    const result = AdminModule.updatePlatformSettings(settings);
    if (result.success) {
        showToast('✅ Configuración guardada');
    }
}

// Update Badge Counts
function updateAdminBadges() {
    const verificationStats = AdminModule.getVerificationStats();
    const reportStats = AdminModule.getReportStats();

    const verificationBadge = document.getElementById('pending-verifications-badge');
    const reportsBadge = document.getElementById('pending-reports-badge');

    if (verificationBadge) {
        verificationBadge.textContent = verificationStats.pending;
        verificationBadge.style.display = verificationStats.pending > 0 ? 'block' : 'none';
    }

    if (reportsBadge) {
        reportsBadge.textContent = reportStats.pending;
        reportsBadge.style.display = reportStats.pending > 0 ? 'block' : 'none';
    }
}

// Search users (debounced)
let userSearchTimeout;
document.addEventListener('DOMContentLoaded', () => {
    const usersSearch = document.getElementById('users-search');
    if (usersSearch) {
        usersSearch.addEventListener('input', (e) => {
            clearTimeout(userSearchTimeout);
            userSearchTimeout = setTimeout(() => {
                const query = e.target.value;
                if (query.length > 0) {
                    const results = AdminModule.searchUsers(query);
                    // Render search results
                    const container = document.getElementById('users-list');
                    if (results.length === 0) {
                        container.innerHTML = '<div class="empty-state-admin"><i class="fas fa-search"></i><p>No se encontraron usuarios</p></div>';
                    } else {
                        // Use same table rendering as filterUsers
                        filterUsers();
                    }
                } else {
                    filterUsers();
                }
            }, 300);
        });
    }
});

// Export admin functions
window.handleAdminLogin = handleAdminLogin;
window.handleAdminLogout = handleAdminLogout;
window.showAdminDashboard = showAdminDashboard;
window.showAdminVerifications = showAdminVerifications;
window.showAdminUsers = showAdminUsers;
window.showAdminReports = showAdminReports;
window.showAdminTransactions = showAdminTransactions;
window.showAdminSettings = showAdminSettings;
window.filterVerifications = filterVerifications;
window.reviewVerification = reviewVerification;
window.closeVerificationReviewModal = closeVerificationReviewModal;
window.approveVerificationRequest = approveVerificationRequest;
window.rejectVerificationRequest = rejectVerificationRequest;
window.filterUsers = filterUsers;
window.viewUserDetail = viewUserDetail;
window.suspendUserAccount = suspendUserAccount;
window.activateUserAccount = activateUserAccount;
window.filterReports = filterReports;
window.reviewReport = reviewReport;
window.closeReportReviewModal = closeReportReviewModal;
window.resolveReportAction = resolveReportAction;
window.filterTransactions = loadTransactionsList;
window.savePlatformSettings = savePlatformSettings;

// ==================================
// CLIENT PROFILE FUNCTIONS
// ==================================

// Navigate to appropriate panel based on user role
function navigateToPanel() {
    const userRole = AuthModule.getUserRole();

    if (!AuthModule.isAuthenticated()) {
        // User not logged in, redirect to login
        navigateTo('screen-login');
        return;
    }

    if (userRole === 'client') {
        navigateTo('screen-client-profile');
    } else if (userRole === 'provider') {
        navigateTo('screen-dashboard'); // Panel de prestadora
    } else if (userRole === 'admin') {
        navigateTo('screen-admin-login'); // Admin panel
    } else {
        // Unknown role, default to login
        navigateTo('screen-login');
    }
}

// Load client profile data
function loadClientProfile() {
    const user = AuthModule.getCurrentUser();
    if (!user) {
        console.error('No user logged in');
        navigateTo('screen-login');
        return;
    }

    // Load user data into form fields
    const nameInput = document.getElementById('client-profile-name');
    const phoneInput = document.getElementById('client-profile-phone');
    const citySelect = document.getElementById('client-profile-city');
    const emailDisplay = document.getElementById('client-profile-email-display');

    if (nameInput) nameInput.value = user.name || '';
    if (phoneInput) phoneInput.value = user.phone || '';
    if (citySelect) citySelect.value = user.city || '';
    if (emailDisplay) emailDisplay.textContent = user.email || '';
}

// Save client profile changes
function saveClientProfile() {
    const name = document.getElementById('client-profile-name')?.value;
    const phone = document.getElementById('client-profile-phone')?.value;
    const city = document.getElementById('client-profile-city')?.value;

    // Validation
    if (!name || !name.trim()) {
        showToast('❌ Por favor ingresa tu nombre');
        return;
    }

    if (!phone || !phone.trim()) {
        showToast('❌ Por favor ingresa tu teléfono');
        return;
    }

    if (!city) {
        showToast('❌ Por favor selecciona tu ciudad');
        return;
    }

    // Update profile via AuthModule
    const result = AuthModule.updateUserProfile({
        name: name.trim(),
        phone: phone.trim(),
        city: city,
        profileComplete: true
    });

    if (result.success) {
        showToast('✅ Perfil actualizado correctamente');

        // Optional: Update API if using backend
        if (AuthModule.isAuthenticated() && typeof API !== 'undefined') {
            API.updateProfile({
                name: name.trim(),
                phone: phone.trim(),
                city: city
            }).catch(err => {
                console.error('Error updating profile in backend:', err);
            });
        }
    } else {
        showToast('❌ Error al actualizar perfil: ' + (result.message || ''));
    }
}

// Handle logout
function handleLogout() {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        AuthModule.logoutUser();
        showToast('Sesión cerrada correctamente');
        navigateTo('screen-login');
    }
}

// Toggle user dropdown menu in header
function toggleUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        const isVisible = dropdown.style.display === 'block';
        dropdown.style.display = isVisible ? 'none' : 'block';
    }
}

// Update auth UI in header based on login state
function updateAuthUI() {
    const isAuthenticated = AuthModule.isAuthenticated();
    const user = AuthModule.getCurrentUser();

    const loginBtn = document.getElementById('header-login-btn');
    const userMenu = document.getElementById('header-user-menu');
    const userNameDisplay = document.getElementById('user-name-display');
    const userEmailDisplay = document.getElementById('user-email-display');

    if (isAuthenticated && user) {
        // Show user menu, hide login button
        if (loginBtn) loginBtn.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';

        // Update user info in dropdown
        if (userNameDisplay) userNameDisplay.textContent = user.name || user.email || 'Usuario';
        if (userEmailDisplay) userEmailDisplay.textContent = user.email || '';
    } else {
        // Show login button, hide user menu
        if (loginBtn) loginBtn.style.display = 'block';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// Export functions to window
window.navigateToPanel = navigateToPanel;
window.loadClientProfile = loadClientProfile;
window.saveClientProfile = saveClientProfile;
window.handleLogout = handleLogout;
window.toggleUserDropdown = toggleUserDropdown;
window.updateAuthUI = updateAuthUI;

// ==================================
// PROVIDER PROFILE INITIALIZATION
// ==================================

/**
 * Initialize user profile after login
 * Creates profile for providers if it doesn't exist
 */
async function initializeUserProfile() {
    const user = AuthModule.getCurrentUser();
    if (!user) return;

    if (user.role === 'provider') {
        try {
            const response = await API.getMyProfile();

            if (response.success && response.data.profile) {
                currentProviderProfile = response.data.profile;
                console.log('Provider profile loaded:', currentProviderProfile._id);
            } else {
                // Profile doesn't exist, create it
                console.log('Creating provider profile...');
                const createResponse = await API.createProfile({
                    role: 'provider',
                    name: user.name || 'Prestadora',
                    city: user.city || 'Quito',
                    verified: false
                });

                if (createResponse.success && createResponse.data.profile) {
                    currentProviderProfile = createResponse.data.profile;
                    console.log('Provider profile created:', currentProviderProfile._id);
                } else {
                    console.error('Failed to create provider profile');
                }
            }
        } catch (error) {
            console.error('Error initializing user profile:', error);
        }
    }
}

/**
 * Ensure provider profile is loaded before accessing dashboard
 * Loads profile if not already loaded
 */
async function ensureProviderProfileLoaded() {
    const user = AuthModule.getCurrentUser();
    if (!user || user.role !== 'provider') return;

    if (!currentProviderProfile) {
        await initializeUserProfile();
    }
}

// ==================================
// PROVIDER DESCRIPTION EDITOR
// ==================================

let currentProviderProfile = null;

// Load provider description
async function loadProviderDescription() {
    const descriptionDisplay = document.getElementById('description-display');
    const descriptionInput = document.getElementById('description-input');

    if (!descriptionDisplay) return;

    try {
        const user = AuthModule.getCurrentUser();
        if (!user || user.role !== 'provider') return;

        // Get provider's profile
        const response = await API.getMyProfile();

        if (response.success && response.data.profile) {
            currentProviderProfile = response.data.profile;
            const description = currentProviderProfile.description || 'No has agregado una descripción aún. Click en "Editar" para agregar una.';
            descriptionDisplay.textContent = description;
            if (descriptionInput) descriptionInput.value = currentProviderProfile.description || '';
            updateCharCount();
        } else {
            descriptionDisplay.textContent = 'Click en "Editar" para agregar una descripción.';
        }
    } catch (error) {
        console.error('Error loading description:', error);
        descriptionDisplay.textContent = 'Error al cargar descripción';
    }
}

// Toggle description editor
function toggleDescriptionEdit() {
    const displayEl = document.getElementById('description-display');
    const editorEl = document.getElementById('description-editor');
    const editBtn = document.getElementById('edit-description-btn');

    if (!displayEl || !editorEl) return;

    displayEl.style.display = 'none';
    editorEl.style.display = 'block';
    editBtn.style.display = 'none';

    // Set current description in textarea
    const descriptionInput = document.getElementById('description-input');
    if (descriptionInput && currentProviderProfile) {
        descriptionInput.value = currentProviderProfile.description || '';
        descriptionInput.focus();
        updateCharCount();
    }
}

// Cancel description edit
function cancelDescriptionEdit() {
    const displayEl = document.getElementById('description-display');
    const editorEl = document.getElementById('description-editor');
    const editBtn = document.getElementById('edit-description-btn');

    if (!displayEl || !editorEl) return;

    displayEl.style.display = 'block';
    editorEl.style.display = 'none';
    editBtn.style.display = 'inline-block';
}

// Update character count
function updateCharCount() {
    const input = document.getElementById('description-input');
    const counter = document.getElementById('char-count');

    if (input && counter) {
        const length = input.value.length;
        counter.textContent = `${length}/1000`;
        counter.style.color = length < 50 ? 'var(--sc-red)' : 'var(--text-secondary)';
    }
}

// Save description
async function saveDescription() {
    const input = document.getElementById('description-input');
    const description = input?.value.trim();

    if (!description || description.length < 50) {
        showToast('❌ La descripción debe tener al menos 50 caracteres');
        return;
    }

    if (description.length > 1000) {
        showToast('❌ La descripción no puede exceder 1000 caracteres');
        return;
    }

    if (!currentProviderProfile || !currentProviderProfile._id) {
        showToast('❌ Error: No se pudo encontrar tu perfil');
        return;
    }

    try {
        showToast('🔄 Guardando descripción...');

        const response = await API.updateProfileDescription(currentProviderProfile._id, description);

        if (response.success) {
            // Update local data
            currentProviderProfile.description = description;
            const displayEl = document.getElementById('description-display');
            if (displayEl) displayEl.textContent = description;

            cancelDescriptionEdit();
            showToast('✅ Descripción actualizada correctamente');
        } else {
            showToast('❌ ' + (response.message || 'Error al guardar'));
        }
    } catch (error) {
        console.error('Error saving description:', error);
        showToast('❌ Error al guardar la descripción');
    }
}

// Export functions
window.loadProviderDescription = loadProviderDescription;
window.toggleDescriptionEdit = toggleDescriptionEdit;
window.cancelDescriptionEdit = cancelDescriptionEdit;
window.saveDescription = saveDescription;
window.updateCharCount = updateCharCount;

// Add event listener for character count
document.addEventListener('DOMContentLoaded', () => {
    const descInput = document.getElementById('description-input');
    if (descInput) {
        descInput.addEventListener('input', updateCharCount);
    }
});

// ==================================
// PHONE / WHATSAPP MANAGEMENT
// ==================================

// Load provider phone
async function loadProviderPhone() {
    const phoneDisplay = document.getElementById('phone-number-text');
    const phoneInput = document.getElementById('phone-input');

    if (!phoneDisplay) return;

    try {
        if (!currentProviderProfile) {
            const response = await API.getMyProfile();
            if (response.success) {
                currentProviderProfile = response.data.profile;
            }
        }

        if (currentProviderProfile && currentProviderProfile.phone) {
            phoneDisplay.textContent = currentProviderProfile.phone;
            if (phoneInput) phoneInput.value = currentProviderProfile.phone;
        } else {
            phoneDisplay.textContent = 'No has agregado un número';
        }
    } catch (error) {
        console.error('Error loading phone:', error);
    }
}

// Toggle phone editor
function togglePhoneEdit() {
    const displayEl = document.getElementById('phone-display');
    const editorEl = document.getElementById('phone-editor');
    const editBtn = document.getElementById('edit-phone-btn');

    if (!displayEl || !editorEl) return;

    displayEl.style.display = 'none';
    editorEl.style.display = 'block';
    editBtn.style.display = 'none';

    // Focus input
    const phoneInput = document.getElementById('phone-input');
    if (phoneInput) phoneInput.focus();
}

// Cancel phone edit
function cancelPhoneEdit() {
    const displayEl = document.getElementById('phone-display');
    const editorEl = document.getElementById('phone-editor');
    const editBtn = document.getElementById('edit-phone-btn');

    if (!displayEl || !editorEl) return;

    displayEl.style.display = 'block';
    editorEl.style.display = 'none';
    editBtn.style.display = 'inline-block';
}

// Save phone
async function savePhone() {
    const input = document.getElementById('phone-input');
    const phone = input?.value.trim();

    if (!phone) {
        showToast('❌ Por favor ingresa un número de teléfono');
        return;
    }

    // Basic phone validation
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!phoneRegex.test(phone)) {
        showToast('❌ Formato de teléfono inválido');
        return;
    }

    if (!currentProviderProfile || !currentProviderProfile._id) {
        showToast('❌ Error: No se encontró tu perfil');
        return;
    }

    try {
        showToast('🔄 Guardando número...');

        const response = await API.updateProfile(currentProviderProfile._id, { phone });

        if (response.success) {
            currentProviderProfile.phone = phone;
            const phoneText = document.getElementById('phone-number-text');
            if (phoneText) phoneText.textContent = phone;

            cancelPhoneEdit();
            showToast('✅ Número guardado correctamente');
        } else {
            showToast('❌ ' + (response.message || 'Error al guardar'));
        }
    } catch (error) {
        console.error('Error saving phone:', error);
        showToast('❌ Error al guardar el número');
    }
}

// Export functions
window.loadProviderPhone = loadProviderPhone;
window.togglePhoneEdit = togglePhoneEdit;
window.cancelPhoneEdit = cancelPhoneEdit;
window.savePhone = savePhone;

// ==================================
// PHOTO MANAGEMENT
// ==================================

let providerPhotos = [];

// Load provider photos
async function loadProviderPhotos() {
    const photosGrid = document.getElementById('photos-grid');
    const badge = document.getElementById('photo-count-badge');

    if (!photosGrid) return;

    try {
        if (!currentProviderProfile) {
            const response = await API.getMyProfile();
            if (response.success) {
                currentProviderProfile = response.data.profile;
            }
        }

        providerPhotos = currentProviderProfile?.photos || [];
        renderPhotosGrid();

        if (badge) {
            const count = providerPhotos.length;
            badge.textContent = `${count}/5`;
            badge.style.background = count >= 5 ? 'var(--success)' : 'var(--danger)';
        }
    } catch (error) {
        console.error('Error loading photos:', error);
    }
}

// Render photos grid
function renderPhotosGrid() {
    const grid = document.getElementById('photos-grid');
    if (!grid) return;

    // Clear grid
    grid.innerHTML = '';

    // Show existing photos
    providerPhotos.forEach((photo, index) => {
        const photoEl = document.createElement('div');
        photoEl.className = 'photo-item';
        photoEl.innerHTML = `
            <img src="${photo}" alt="Foto ${index + 1}">
            <button class="delete-photo-btn" onclick="deletePhoto(${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        grid.appendChild(photoEl);
    });

    // Add placeholder if less than max
    if (providerPhotos.length < 10) {
        const placeholder = document.createElement('div');
        placeholder.className = 'photo-item';
        placeholder.innerHTML = `<div class="photo-placeholder"><i class="fas fa-plus"></i></div>`;
        placeholder.onclick = triggerPhotoUpload;
        grid.appendChild(placeholder);
    }
}

// Trigger photo upload
function triggerPhotoUpload() {
    const input = document.getElementById('photo-upload-input');
    if (input) {
        input.click();
    }
}

// Handle photo selection
document.addEventListener('DOMContentLoaded', () => {
    const photoInput = document.getElementById('photo-upload-input');
    if (photoInput) {
        photoInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                uploadPhotos(files);
            }
        });
    }
});

// Upload photos
async function uploadPhotos(files) {
    if (!currentProviderProfile || !currentProviderProfile._id) {
        showToast('❌ Error: No se encontró tu perfil');
        return;
    }

    const remaining = 10 - providerPhotos.length;
    if (remaining <= 0) {
        showToast('❌ Ya tienes el máximo de 10 fotos');
        return;
    }

    const filesToUpload = files.slice(0, remaining);
    showToast(`🔄 Subiendo ${filesToUpload.length} foto(s)...`);

    try {
        // Upload photos using API
        const response = await API.uploadProfilePhotos(filesToUpload);

        if (response.success) {
            const photoUrls = response.data.urls || [];

            // Update profile with new photos
            const updateResponse = await API.updateProfilePhotos(
                currentProviderProfile._id,
                photoUrls
            );

            if (updateResponse.success) {
                providerPhotos = updateResponse.data.photos;
                currentProviderProfile.photos = providerPhotos;
                renderPhotosGrid();
                updatePhotoCount();
                showToast('✅ Fotos subidas exitosamente');
            } else {
                showToast('❌ Error al actualizar perfil');
            }
        } else {
            showToast('❌ Error al subir fotos');
        }
    } catch (error) {
        console.error('Error uploading photos:', error);
        showToast('❌ Error al subir las fotos');
    }

    // Clear input
    const input = document.getElementById('photo-upload-input');
    if (input) input.value = '';
}

// Delete photo
async function deletePhoto(index) {
    if (!confirm('¿Estás seguro de eliminar esta foto?')) {
        return;
    }

    if (!currentProviderProfile || !currentProviderProfile._id) {
        showToast('❌ Error: No se encontró tu perfil');
        return;
    }

    try {
        showToast('🔄 Eliminando foto...');

        const response = await API.deleteProfilePhoto(currentProviderProfile._id, index);

        if (response.success) {
            providerPhotos = response.data.photos;
            currentProviderProfile.photos = providerPhotos;
            renderPhotosGrid();
            updatePhotoCount();
            showToast('✅ Foto eliminada');
        } else {
            showToast('❌ Error al eliminar foto');
        }
    } catch (error) {
        console.error('Error deleting photo:', error);
        showToast('❌ Error al eliminar la foto');
    }
}

// Update photo count badge
function updatePhotoCount() {
    const badge = document.getElementById('photo-count-badge');
    if (badge) {
        const count = providerPhotos.length;
        badge.textContent = `${count}/5`;
        badge.style.background = count >= 5 ? 'var(--success)' : 'var(--danger)';
    }
}

// Export functions
window.loadProviderPhotos = loadProviderPhotos;
window.triggerPhotoUpload = triggerPhotoUpload;
window.deletePhoto = deletePhoto;

// ==================================
// CAROUSEL NAVIGATION (EXPLORE)
// ==================================

const carouselStates = {};

function navigateCarousel(profileIndex, direction) {
    const cards = document.querySelectorAll('.profile-card');
    const card = cards[profileIndex];

    if (!card) return;

    const slides = card.querySelectorAll('.carousel-slide');
    const dots = card.querySelectorAll('.dot');

    if (slides.length <= 1) return;

    // Get current active index
    let currentIndex = 0;
    slides.forEach((slide, idx) => {
        if (slide.classList.contains('active')) {
            currentIndex = idx;
        }
    });

    // Calculate new index
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = slides.length - 1;
    if (newIndex >= slides.length) newIndex = 0;

    // Update slides
    slides[currentIndex].classList.remove('active');
    slides[newIndex].classList.add('active');

    // Update dots
    dots[currentIndex].classList.remove('active');
    dots[newIndex].classList.add('active');
}

window.navigateCarousel = navigateCarousel;

// New carousel navigation using button element reference
function navigateCarouselByCard(buttonElement, direction) {
    const card = buttonElement.closest('.profile-card');
    if (!card) return;

    const slides = card.querySelectorAll('.carousel-slide');
    const dots = card.querySelectorAll('.dot');

    if (slides.length <= 1) return;

    let currentIndex = 0;
    slides.forEach((slide, idx) => {
        if (slide.classList.contains('active')) currentIndex = idx;
    });

    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = slides.length - 1;
    if (newIndex >= slides.length) newIndex = 0;

    slides[currentIndex].classList.remove('active');
    slides[newIndex].classList.add('active');

    if (dots.length > 0) {
        dots[currentIndex].classList.remove('active');
        dots[newIndex].classList.add('active');
    }
}

window.navigateCarouselByCard = navigateCarouselByCard;

// ==================================
// WHATSAPP CONNECTION
// ==================================

function openWhatsApp() {
    if (!currentProfileData || !currentProfileData.phone) {
        showToast('❌ Esta prestadora no ha configurado su WhatsApp');
        return;
    }

    //  Remove all non-digit characters except + 
    const cleanPhone = currentProfileData.phone.replace(/[^\d+]/g, '');

    // Open WhatsApp with the phone number
    const url = `https://wa.me/${cleanPhone}`;
    window.open(url, '_blank');

    showToast('✅ Abriendo WhatsApp...');

    // Optional: Track click (analytics)
    if (currentProfileData._id) {
        API.incrementProfileView(currentProfileData._id).catch(err => {
            console.error('Error tracking WhatsApp click:', err);
        });
    }
}

window.openWhatsApp = openWhatsApp;

// ==================================
// CHAT SYSTEM
// ==================================

let currentChatUser = null;

// Load conversations list
async function loadConversations() {
    const container = document.getElementById('conversations-container');
    if (!container) return;

    container.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-secondary);"><i class="fas fa-spinner fa-spin"></i> Cargando conversaciones...</div>';

    try {
        const response = await API.getConversations();

        if (!response.success || !response.data || !response.data.conversations) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-secondary);">No tienes conversaciones aún</div>';
            return;
        }

        const conversations = response.data.conversations;

        if (conversations.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-secondary);">No tienes conversaciones aún</div>';
            return;
        }

        container.innerHTML = conversations.map(conv => `
            <div class="glass-card chat-entry" 
                 style="padding: 15px; display: flex; align-items: center; gap: 15px; margin-bottom: 10px; cursor: pointer;"
                 onclick="openChat('${conv.userId}', '${conv.name}')">
                <div style="width: 50px; height: 50px; border-radius: 100%; background: var(--surface-light); display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 1.5rem;">${conv.name.charAt(0).toUpperCase()}</span>
                </div>
                <div style="flex: 1;">
                    <h4 style="margin: 0;">${conv.name}</h4>
                    <p style="margin: 0; font-size: 0.8rem; color: var(--text-secondary);">
                        ${conv.lastMessage || 'Sin mensajes'}
                    </p>
                </div>
                ${conv.unreadCount > 0 ? `<span class="badge" style="background: var(--accent); color: var(--bg-dark); padding: 4px 8px;">${conv.unreadCount}</span>` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading conversations:', error);
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--danger);">Error al cargar conversaciones</div>';
    }
}

// Start chat with provider (from profile screen)
function startChatWithProvider() {
    if (!AuthModule.isAuthenticated()) {
        showToast('❌ Debes iniciar sesión para enviar mensajes');
        navigateTo('screen-login');
        return;
    }

    if (!currentProfileData) {
        showToast('❌ Error al cargar perfil');
        return;
    }

    const provider = currentProfileData;
    const providerId = provider.user?._id || provider.userId || provider._id;
    const providerName = provider.name || 'Prestadora';

    openChat(providerId, providerName);
}

// Open chat screen
function openChat(userId, userName) {
    currentChatUser = { id: userId, name: userName };

    // Update chat header
    const chatHeader = document.getElementById('chat-with-name');
    if (chatHeader) {
        chatHeader.textContent = userName;
    }

    // Navigate to chat screen
    navigateTo('screen-chat');

    // Load messages
    loadChatMessages(userId);
}

// Load chat messages
async function loadChatMessages(userId) {
    const container = document.getElementById('messages-container');
    if (!container) return;

    container.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-secondary);"><i class="fas fa-spinner fa-spin"></i> Cargando mensajes...</div>';

    try {
        const response = await API.getMessages(userId);

        if (!response.success || !response.data || !response.data.messages) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">Aún no hay mensajes. ¡Inicia la conversación!</div>';
            return;
        }

        const messages = response.data.messages;
        const currentUser = AuthModule.getCurrentUser();

        if (messages.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">Aún no hay mensajes. ¡Inicia la conversación!</div>';
            return;
        }

        container.innerHTML = messages.map(msg => {
            const isMine = msg.sender === currentUser._id || msg.sender._id === currentUser._id;
            return `
                <div class="message ${isMine ? 'sent' : 'received'}">
                    <div class="message-bubble">
                        <p>${msg.text || msg.content || ''}</p>
                        <span class="message-time">${formatMessageTime(msg.createdAt)}</span>
                    </div>
                </div>
            `;
        }).join('');

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    } catch (error) {
        console.error('Error loading messages:', error);
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--danger);">Error al cargar mensajes</div>';
    }
}

// Send message
async function sendChatMessage() {
    const input = document.getElementById('message-input');
    const text = input?.value.trim();

    if (!text) return;

    if (!currentChatUser || !currentChatUser.id) {
        showToast('❌ Error: No se pudo identificar el destinatario');
        return;
    }

    try {
        const response = await API.sendMessage(currentChatUser.id, text);

        if (response.success) {
            // Clear input
            if (input) input.value = '';

            // Reload messages
            loadChatMessages(currentChatUser.id);
        } else {
            showToast('❌ Error al enviar mensaje');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showToast('❌ Error al enviar mensaje');
    }
}

// Format message timestamp
function formatMessageTime(timestamp) {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;

    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
}

// Export functions
window.loadConversations = loadConversations;
window.startChatWithProvider = startChatWithProvider;
window.openChat = openChat;
window.sendChatMessage = sendChatMessage;

// ==================================
// STRIPE PAYMENT PROCESSING
// ==================================

let stripe = null;
let elements = null;
let cardElement = null;
let currentCheckoutPlan = null;

// Initialize Stripe
function initializeStripe() {
    if (!SCORTA_CONFIG || !SCORTA_CONFIG.STRIPE || !SCORTA_CONFIG.STRIPE.PUBLISHABLE_KEY) {
        console.error('Stripe not configured');
        return;
    }

    stripe = Stripe(SCORTA_CONFIG.STRIPE.PUBLISHABLE_KEY);
    elements = stripe.elements();

    // Create card element with styling
    cardElement = elements.create('card', {
        style: {
            base: {
                color: '#f8fafc',
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                '::placeholder': {
                    color: '#94a3b8'
                }
            },
            invalid: {
                color: '#ef4444'
            }
        }
    });
}

// Mount card element when checkout screen opens
function mountCardElement() {
    if (!cardElement) {
        initializeStripe();
    }

    if (cardElement) {
        const container = document.getElementById('card-element');
        if (container && !container.firstChild) {
            cardElement.mount('#card-element');

            // Handle errors
            cardElement.on('change', (event) => {
                const displayError = document.getElementById('card-errors');
                if (event.error) {
                    displayError.textContent = event.error.message;
                } else {
                    displayError.textContent = '';
                }
            });
        }
    }
}

// Open checkout screen with plan details
function openCheckout(planName, amount, duration) {
    currentCheckoutPlan = {
        name: planName,
        amount: amount * 100, // Convert to cents
        duration: duration,
        planType: planName.toLowerCase()
    };

    // Update UI
    const nameEl = document.getElementById('checkout-plan-name');
    const durationEl = document.getElementById('checkout-plan-duration');
    const totalEl = document.getElementById('checkout-total');

    if (nameEl) nameEl.textContent = planName;
    if (durationEl) durationEl.textContent = duration;
    if (totalEl) totalEl.textContent = `$${amount}.00`;

    navigateTo('screen-checkout');

    // Mount Stripe Elements
    setTimeout(() => mountCardElement(), 100);
}

// Process Stripe payment
async function processStripePayment() {
    if (!currentCheckoutPlan) {
        showToast('❌ Error: No plan selected');
        return;
    }

    if (!stripe || !cardElement) {
        showToast('❌ Error: Stripe not initialized');
        return;
    }

    const submitBtn = document.getElementById('submit-payment-btn');
    const submitText = document.getElementById('submit-text');

    // Disable button and show loading
    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.textContent = 'Procesando...';

    try {
        // Step 1: Create payment intent
        showToast('🔄 Creando intención de pago...');

        const intentResponse = await API.createPaymentIntent(
            currentCheckoutPlan.planType,
            currentCheckoutPlan.amount,
            currentCheckoutPlan.duration
        );

        if (!intentResponse.success || !intentResponse.data.clientSecret) {
            throw new Error(intentResponse.message || 'Error creating payment intent');
        }

        // Step 2: Confirm payment with Stripe
        showToast('💳 Procesando tarjeta...');

        const { error, paymentIntent } = await stripe.confirmCardPayment(
            intentResponse.data.clientSecret,
            {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: AuthModule.getCurrentUser()?.name || 'Cliente SCORTA'
                    }
                }
            }
        );

        if (error) {
            throw new Error(error.message);
        }

        if (paymentIntent.status === 'succeeded') {
            // Step 3: Confirm boost activation
            showToast('✅ Activando Boost...');

            const confirmResponse = await API.confirmBoostPayment(
                paymentIntent.id,
                currentCheckoutPlan.planType,
                currentCheckoutPlan.duration,
                currentCheckoutPlan.amount
            );

            if (confirmResponse.success) {
                showToast('🎉 ¡Pago exitoso! Boost activado');

                // Navigate back to dashboard
                setTimeout(() => {
                    navigateTo('screen-dashboard');
                }, 2000);
            } else {
                showToast('⚠️ Pago procesado pero error al activar boost');
            }
        }
    } catch (error) {
        console.error('Payment error:', error);
        showToast('❌ Error: ' + error.message);
    } finally {
        // Re-enable button
        if (submitBtn) submitBtn.disabled = false;
        if (submitText) submitText.textContent = 'Pagar de forma segura';
    }
}

// Export functions
window.initializeStripe = initializeStripe;
window.openCheckout = openCheckout;
window.processStripePayment = processStripePayment;

// Initialize Stripe on page load
document.addEventListener('DOMContentLoaded', () => {
    if (SCORTA_CONFIG && SCORTA_CONFIG.FEATURES && SCORTA_CONFIG.FEATURES.PAYMENTS) {
        initializeStripe();
    }
});

