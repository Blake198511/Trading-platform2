/**
 * Breakthrough Technology Detector Configuration
 * Centralized configuration management for the breakthrough detection system
 */

class BreakthroughConfig {
    constructor() {
        this.environment = this.detectEnvironment();
        this.config = this.loadConfig();
    }

    detectEnvironment() {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') return 'development';
        if (hostname.includes('staging') || hostname.includes('test')) return 'staging';
        return 'production';
    }

    loadConfig() {
        const baseConfig = {
            monitoring: {
                scanInterval: 15 * 60 * 1000, // 15 minutes
                maxRetries: 3,
                timeout: 30000
            },
            thresholds: {
                breakthroughImpact: 7,
                credibilityMinimum: 0.7,
                highPriorityAlert: 8
            },
            ui: {
                maxDisplayedBreakthroughs: 50,
                animationDuration: 300,
                autoRefresh: true
            },
            notifications: {
                enabled: true,
                sound: false,
                desktop: true
            }
        };

        const environmentConfigs = {
            development: {
                ...baseConfig,
                monitoring: {
                    ...baseConfig.monitoring,
                    scanInterval: 5 * 60 * 1000, // 5 minutes for dev
                },
                debug: true,
                mockData: true
            },
            staging: {
                ...baseConfig,
                debug: true,
                mockData: false
            },
            production: {
                ...baseConfig,
                debug: false,
                mockData: false
            }
        };

        return environmentConfigs[this.environment];
    }

    get(path) {
        return this.getNestedValue(this.config, path);
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key]) current[key] = {};
            return current[key];
        }, this.config);
        target[lastKey] = value;
    }
}

// Export singleton instance
const breakthroughConfig = new BreakthroughConfig();
window.breakthroughConfig = breakthroughConfig;

console.log(`🔧 Breakthrough Config loaded for ${breakthroughConfig.environment} environment`);