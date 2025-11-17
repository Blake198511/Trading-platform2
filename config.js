/**
 * Trading Platform Configuration
 * 
 * This file handles environment configuration for the trading platform.
 * It works across all browsers and platforms by using a JavaScript-based config.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Copy .env.example to .env
 * 2. Fill in your configuration values in .env
 * 3. For browser deployment: Update this file with your values OR use the env-loader.js
 * 4. For server deployment: Use build tools to inject env vars into this file
 */

window.TradingPlatformConfig = {
    // API Configuration
    api: {
        endpoint: typeof ENV_API_ENDPOINT !== 'undefined' ? ENV_API_ENDPOINT : 'https://api.example.com',
        key: typeof ENV_API_KEY !== 'undefined' ? ENV_API_KEY : '',
        secret: typeof ENV_API_SECRET !== 'undefined' ? ENV_API_SECRET : ''
    },
    
    // Trading Configuration
    trading: {
        defaultCurrency: typeof ENV_DEFAULT_CURRENCY !== 'undefined' ? ENV_DEFAULT_CURRENCY : 'USD',
        defaultMarket: typeof ENV_DEFAULT_MARKET !== 'undefined' ? ENV_DEFAULT_MARKET : 'stocks',
        enableLiveTrading: typeof ENV_ENABLE_LIVE_TRADING !== 'undefined' ? ENV_ENABLE_LIVE_TRADING === 'true' : false
    },
    
    // Platform Configuration
    platform: {
        name: typeof ENV_APP_NAME !== 'undefined' ? ENV_APP_NAME : 'MarketMaster Pro Trading Platform',
        version: typeof ENV_APP_VERSION !== 'undefined' ? ENV_APP_VERSION : '1.0.0',
        environment: typeof ENV_ENVIRONMENT !== 'undefined' ? ENV_ENVIRONMENT : 'development'
    },
    
    // Analytics and Tracking
    analytics: {
        enabled: typeof ENV_ENABLE_ANALYTICS !== 'undefined' ? ENV_ENABLE_ANALYTICS === 'true' : false,
        id: typeof ENV_ANALYTICS_ID !== 'undefined' ? ENV_ANALYTICS_ID : ''
    },
    
    // Feature Flags
    features: {
        crypto: typeof ENV_ENABLE_CRYPTO !== 'undefined' ? ENV_ENABLE_CRYPTO === 'true' : true,
        forex: typeof ENV_ENABLE_FOREX !== 'undefined' ? ENV_ENABLE_FOREX === 'true' : true,
        stocks: typeof ENV_ENABLE_STOCKS !== 'undefined' ? ENV_ENABLE_STOCKS === 'true' : true,
        commodities: typeof ENV_ENABLE_COMMODITIES !== 'undefined' ? ENV_ENABLE_COMMODITIES === 'true' : true
    },
    
    // Display Settings
    display: {
        defaultTheme: typeof ENV_DEFAULT_THEME !== 'undefined' ? ENV_DEFAULT_THEME : 'dark',
        defaultLanguage: typeof ENV_DEFAULT_LANGUAGE !== 'undefined' ? ENV_DEFAULT_LANGUAGE : 'en',
        showInvestorProfiles: typeof ENV_SHOW_INVESTOR_PROFILES !== 'undefined' ? ENV_SHOW_INVESTOR_PROFILES === 'true' : true
    },
    
    // Third-party Services (Optional)
    services: {
        newsApiKey: typeof ENV_NEWS_API_KEY !== 'undefined' ? ENV_NEWS_API_KEY : '',
        marketDataApiKey: typeof ENV_MARKET_DATA_API_KEY !== 'undefined' ? ENV_MARKET_DATA_API_KEY : ''
    },
    
    /**
     * Get a configuration value by path
     * @param {string} path - Dot notation path (e.g., 'api.endpoint')
     * @param {*} defaultValue - Default value if path not found
     * @returns {*} Configuration value
     */
    get: function(path, defaultValue = null) {
        const keys = path.split('.');
        let value = this;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return defaultValue;
            }
        }
        
        return value;
    },
    
    /**
     * Check if the platform is in production mode
     * @returns {boolean}
     */
    isProduction: function() {
        return this.platform.environment === 'production';
    },
    
    /**
     * Check if the platform is in development mode
     * @returns {boolean}
     */
    isDevelopment: function() {
        return this.platform.environment === 'development';
    },
    
    /**
     * Validate required configuration
     * @returns {object} Validation result with isValid and errors
     */
    validate: function() {
        const errors = [];
        
        // Add validation rules as needed
        if (this.trading.enableLiveTrading && !this.api.key) {
            errors.push('API key is required when live trading is enabled');
        }
        
        if (this.analytics.enabled && !this.analytics.id) {
            errors.push('Analytics ID is required when analytics is enabled');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
};

// Log configuration status on load (only in development)
if (window.TradingPlatformConfig.isDevelopment()) {
    console.log('Trading Platform Configuration loaded:', {
        environment: window.TradingPlatformConfig.platform.environment,
        version: window.TradingPlatformConfig.platform.version,
        features: window.TradingPlatformConfig.features
    });
}

// Validate configuration and warn if issues found
const validation = window.TradingPlatformConfig.validate();
if (!validation.isValid) {
    console.warn('Configuration validation warnings:', validation.errors);
}
