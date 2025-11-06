/**
 * Configuration File
 * Manages API endpoints and environment-specific settings
 */

const CONFIG = {
    // Environment detection
    ENV: (function() {
        // Check if running on localhost
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'development';
        }
        // Check for staging domain
        if (window.location.hostname.includes('staging')) {
            return 'staging';
        }
        // Default to production
        return 'production';
    })(),

    // API Configuration
    API: {
        development: {
            BASE_URL: 'http://localhost:3000/api',
            WS_URL: 'ws://localhost:3000',
            TIMEOUT: 30000, // 30 seconds
            RETRY_ATTEMPTS: 3,
            RETRY_DELAY: 1000 // 1 second
        },
        staging: {
            BASE_URL: 'https://staging-api.tradingscannerpro.com/api',
            WS_URL: 'wss://staging-api.tradingscannerpro.com',
            TIMEOUT: 30000,
            RETRY_ATTEMPTS: 3,
            RETRY_DELAY: 1000
        },
        production: {
            BASE_URL: 'https://api.tradingscannerpro.com/api',
            WS_URL: 'wss://api.tradingscannerpro.com',
            TIMEOUT: 30000,
            RETRY_ATTEMPTS: 3,
            RETRY_DELAY: 1000
        }
    },

    // Get current environment config
    getAPIConfig() {
        return this.API[this.ENV];
    },

    // Get base URL for API calls
    getBaseURL() {
        return this.getAPIConfig().BASE_URL;
    },

    // Get WebSocket URL
    getWebSocketURL() {
        return this.getAPIConfig().WS_URL;
    },

    // Get timeout setting
    getTimeout() {
        return this.getAPIConfig().TIMEOUT;
    },

    // Get retry configuration
    getRetryConfig() {
        return {
            attempts: this.getAPIConfig().RETRY_ATTEMPTS,
            delay: this.getAPIConfig().RETRY_DELAY
        };
    },

    // Authentication settings
    AUTH: {
        TOKEN_KEY: 'marketmaster_auth_token',
        REFRESH_TOKEN_KEY: 'marketmaster_refresh_token',
        TOKEN_EXPIRY_KEY: 'marketmaster_token_expiry',
        USER_KEY: 'marketmaster_user'
    },

    // Cache settings
    CACHE: {
        ENABLED: true,
        DEFAULT_TTL: 15 * 60 * 1000, // 15 minutes
        PRICE_UPDATE_INTERVAL: 30 * 1000, // 30 seconds
        RECOMMENDATION_UPDATE_INTERVAL: 15 * 60 * 1000 // 15 minutes
    },

    // Feature flags
    FEATURES: {
        USE_REAL_API: true, // Set to false to use simulated data
        ENABLE_WEBSOCKET: true,
        ENABLE_NOTIFICATIONS: true,
        ENABLE_ANALYTICS: false // Set to true in production
    },

    // API Keys (Get free keys from providers)
    API_KEYS: {
        // Alpha Vantage - Stock prices (https://www.alphavantage.co/support/#api-key)
        ALPHA_VANTAGE: 'O8SVOO1J4R2EOY66',
        
        // News API - Breaking news (https://newsapi.org/register)
        NEWS_API: 'b3556a355e8d49ca8fba7ec1fe9b0a21',
        
        // Finnhub - Additional market data (https://finnhub.io/register)
        FINNHUB: 'd457ofpr01qsugt92s0gd457ofpr01qsugt92s10',
        
        // Optional: Polygon.io for premium data
        POLYGON: '' // Add your key here if you have one
    },

    // Rate limiting (client-side)
    RATE_LIMIT: {
        MAX_REQUESTS_PER_MINUTE: 60,
        MAX_REQUESTS_PER_HOUR: 1000
    },

    // Error messages
    ERROR_MESSAGES: {
        NETWORK_ERROR: 'Unable to connect to server. Please check your internet connection.',
        TIMEOUT_ERROR: 'Request timed out. Please try again.',
        AUTH_ERROR: 'Authentication failed. Please log in again.',
        SERVER_ERROR: 'Server error occurred. Please try again later.',
        NOT_FOUND: 'Requested resource not found.',
        RATE_LIMIT: 'Too many requests. Please slow down.',
        UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
    },

    // Debug mode
    DEBUG: (function() {
        return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    })(),

    // Log helper
    log(...args) {
        if (this.DEBUG) {
            console.log('[CONFIG]', ...args);
        }
    }
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.API);
Object.freeze(CONFIG.AUTH);
Object.freeze(CONFIG.CACHE);
Object.freeze(CONFIG.FEATURES);
Object.freeze(CONFIG.RATE_LIMIT);
Object.freeze(CONFIG.ERROR_MESSAGES);

// Log current configuration
CONFIG.log('Environment:', CONFIG.ENV);
CONFIG.log('API Base URL:', CONFIG.getBaseURL());
CONFIG.log('WebSocket URL:', CONFIG.getWebSocketURL());
CONFIG.log('Features:', CONFIG.FEATURES);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
