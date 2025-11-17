/**
 * Environment Variable Loader for Browser
 * 
 * This utility helps load environment variables in browser environments where
 * .env files cannot be read directly. It provides multiple loading strategies
 * that work across different browsers and platforms.
 * 
 * USAGE:
 * Include this script BEFORE config.js in your HTML:
 * <script src="env-loader.js"></script>
 * <script src="config.js"></script>
 */

(function(window) {
    'use strict';
    
    /**
     * Environment variable loader
     */
    const EnvLoader = {
        /**
         * Load environment variables from various sources
         * Priority: URL params > localStorage > meta tags > defaults
         */
        load: function() {
            console.log('EnvLoader: Loading environment variables...');
            
            // Try loading from different sources
            this.loadFromMetaTags();
            this.loadFromLocalStorage();
            this.loadFromUrlParams();
            
            console.log('EnvLoader: Environment variables loaded');
        },
        
        /**
         * Load environment variables from meta tags
         * Example: <meta name="env:API_KEY" content="your_key_here">
         */
        loadFromMetaTags: function() {
            const metaTags = document.querySelectorAll('meta[name^="env:"]');
            
            metaTags.forEach(tag => {
                const varName = tag.getAttribute('name').replace('env:', '');
                const value = tag.getAttribute('content');
                
                if (varName && value) {
                    window['ENV_' + varName] = value;
                }
            });
        },
        
        /**
         * Load environment variables from localStorage
         * Useful for persistent configuration across sessions
         */
        loadFromLocalStorage: function() {
            try {
                const envData = localStorage.getItem('tradingPlatformEnv');
                
                if (envData) {
                    const env = JSON.parse(envData);
                    
                    for (const [key, value] of Object.entries(env)) {
                        window['ENV_' + key] = value;
                    }
                }
            } catch (e) {
                console.warn('EnvLoader: Could not load from localStorage:', e);
            }
        },
        
        /**
         * Load environment variables from URL parameters
         * Example: ?env.API_KEY=your_key&env.ENABLE_CRYPTO=true
         * 
         * Note: Only use this for non-sensitive configuration in development
         */
        loadFromUrlParams: function() {
            const urlParams = new URLSearchParams(window.location.search);
            
            for (const [key, value] of urlParams.entries()) {
                if (key.startsWith('env.')) {
                    const varName = key.replace('env.', '');
                    window['ENV_' + varName] = value;
                }
            }
        },
        
        /**
         * Save environment variables to localStorage
         * @param {object} env - Environment variables object
         */
        saveToLocalStorage: function(env) {
            try {
                localStorage.setItem('tradingPlatformEnv', JSON.stringify(env));
                console.log('EnvLoader: Configuration saved to localStorage');
            } catch (e) {
                console.error('EnvLoader: Could not save to localStorage:', e);
            }
        },
        
        /**
         * Clear environment variables from localStorage
         */
        clearLocalStorage: function() {
            try {
                localStorage.removeItem('tradingPlatformEnv');
                console.log('EnvLoader: Configuration cleared from localStorage');
            } catch (e) {
                console.error('EnvLoader: Could not clear localStorage:', e);
            }
        },
        
        /**
         * Get current environment configuration
         * @returns {object} Current environment variables
         */
        getEnvironment: function() {
            const env = {};
            
            for (const key in window) {
                if (key.startsWith('ENV_')) {
                    env[key.replace('ENV_', '')] = window[key];
                }
            }
            
            return env;
        },
        
        /**
         * Set environment variable
         * @param {string} name - Variable name (without ENV_ prefix)
         * @param {*} value - Variable value
         */
        setEnv: function(name, value) {
            window['ENV_' + name] = value;
        },
        
        /**
         * Get environment variable
         * @param {string} name - Variable name (without ENV_ prefix)
         * @param {*} defaultValue - Default value if not found
         * @returns {*} Variable value
         */
        getEnv: function(name, defaultValue = null) {
            return window['ENV_' + name] || defaultValue;
        }
    };
    
    // Auto-load on script execution
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            EnvLoader.load();
        });
    } else {
        EnvLoader.load();
    }
    
    // Expose EnvLoader globally
    window.EnvLoader = EnvLoader;
    
})(window);
