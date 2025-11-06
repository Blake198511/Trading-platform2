/**
 * Production Configuration File
 * Override settings for production deployment
 * 
 * Usage: Include this file AFTER config.js in production builds
 * <script src="js/config.js"></script>
 * <script src="js/config.prod.js"></script>
 */

(function() {
    'use strict';

    // Production environment overrides
    const PRODUCTION_CONFIG = {
        // Force production environment
        ENV: 'production',

        // Production API Configuration
        API: {
            production: {
                BASE_URL: 'https://api.tradingscannerpro.com/api',
                WS_URL: 'wss://api.tradingscannerpro.com',
                TIMEOUT: 30000,
                RETRY_ATTEMPTS: 3,
                RETRY_DELAY: 1000
            }
        },

        // Production feature flags
        FEATURES: {
            USE_REAL_API: true,
            ENABLE_WEBSOCKET: true,
            ENABLE_NOTIFICATIONS: true,
            ENABLE_ANALYTICS: true  // Enable analytics in production
        },

        // Disable debug mode in production
        DEBUG: false,

        // Production cache settings (more aggressive caching)
        CACHE: {
            ENABLED: true,
            DEFAULT_TTL: 15 * 60 * 1000,  // 15 minutes
            PRICE_UPDATE_INTERVAL: 30 * 1000,  // 30 seconds
            RECOMMENDATION_UPDATE_INTERVAL: 15 * 60 * 1000  // 15 minutes
        },

        // Stricter rate limiting for production
        RATE_LIMIT: {
            MAX_REQUESTS_PER_MINUTE: 60,
            MAX_REQUESTS_PER_HOUR: 1000
        }
    };

    // Apply production overrides to CONFIG
    if (typeof CONFIG !== 'undefined') {
        // Override environment
        Object.defineProperty(CONFIG, 'ENV', {
            value: PRODUCTION_CONFIG.ENV,
            writable: false,
            configurable: false
        });

        // Override API config
        Object.assign(CONFIG.API, PRODUCTION_CONFIG.API);

        // Override features
        Object.assign(CONFIG.FEATURES, PRODUCTION_CONFIG.FEATURES);

        // Override debug mode
        Object.defineProperty(CONFIG, 'DEBUG', {
            value: PRODUCTION_CONFIG.DEBUG,
            writable: false,
            configurable: false
        });

        // Override cache settings
        Object.assign(CONFIG.CACHE, PRODUCTION_CONFIG.CACHE);

        // Override rate limits
        Object.assign(CONFIG.RATE_LIMIT, PRODUCTION_CONFIG.RATE_LIMIT);

        console.log('✅ Production configuration applied');
        console.log('Environment:', CONFIG.ENV);
        console.log('API Base URL:', CONFIG.getBaseURL());
        console.log('WebSocket URL:', CONFIG.getWebSocketURL());
    } else {
        console.error('❌ CONFIG not found. Make sure config.js is loaded first.');
    }

    // Add analytics tracking (Google Analytics, Mixpanel, etc.)
    if (PRODUCTION_CONFIG.FEATURES.ENABLE_ANALYTICS) {
        // Initialize analytics
        window.trackEvent = function(category, action, label, value) {
            // Google Analytics example
            if (typeof gtag !== 'undefined') {
                gtag('event', action, {
                    'event_category': category,
                    'event_label': label,
                    'value': value
                });
            }

            // Mixpanel example
            if (typeof mixpanel !== 'undefined') {
                mixpanel.track(action, {
                    category: category,
                    label: label,
                    value: value
                });
            }

            // Custom analytics endpoint
            if (CONFIG.FEATURES.USE_REAL_API) {
                fetch(`${CONFIG.getBaseURL()}/analytics/track`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        category,
                        action,
                        label,
                        value,
                        timestamp: new Date().toISOString()
                    })
                }).catch(err => console.error('Analytics error:', err));
            }
        };

        // Track page views
        window.trackPageView = function(page) {
            if (typeof gtag !== 'undefined') {
                gtag('config', 'GA_MEASUREMENT_ID', {
                    page_path: page
                });
            }

            if (typeof mixpanel !== 'undefined') {
                mixpanel.track('Page View', { page: page });
            }
        };

        console.log('✅ Analytics tracking enabled');
    }

    // Add error tracking (Sentry, Rollbar, etc.)
    window.addEventListener('error', function(event) {
        // Log to console in production
        console.error('Global error:', event.error);

        // Send to error tracking service
        if (CONFIG.FEATURES.USE_REAL_API) {
            fetch(`${CONFIG.getBaseURL()}/errors/log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: event.error?.message || 'Unknown error',
                    stack: event.error?.stack || '',
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                })
            }).catch(err => console.error('Error logging failed:', err));
        }
    });

    // Add unhandled promise rejection tracking
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled promise rejection:', event.reason);

        if (CONFIG.FEATURES.USE_REAL_API) {
            fetch(`${CONFIG.getBaseURL()}/errors/log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: event.reason?.message || 'Unhandled promise rejection',
                    stack: event.reason?.stack || '',
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                })
            }).catch(err => console.error('Error logging failed:', err));
        }
    });

    console.log('✅ Error tracking enabled');

})();
