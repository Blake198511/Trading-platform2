/**
 * Security Configuration
 * Content Security Policy and other security headers
 */

const SECURITY_CONFIG = {
    /**
     * Content Security Policy (CSP)
     * Helps prevent XSS attacks and other code injection attacks
     */
    CSP: {
        // Default source for all content
        'default-src': ["'self'"],
        
        // Script sources
        'script-src': [
            "'self'",
            "'unsafe-inline'",  // Required for inline scripts (consider removing in production)
            "https://www.googletagmanager.com",
            "https://www.google-analytics.com"
        ],
        
        // Style sources
        'style-src': [
            "'self'",
            "'unsafe-inline'"  // Required for inline styles
        ],
        
        // Image sources
        'img-src': [
            "'self'",
            "data:",
            "https:",
            "blob:"
        ],
        
        // Font sources
        'font-src': [
            "'self'",
            "data:"
        ],
        
        // Connection sources (API endpoints, WebSocket)
        'connect-src': [
            "'self'",
            "https://api.tradingscannerpro.com",
            "wss://api.tradingscannerpro.com",
            "https://staging-api.tradingscannerpro.com",
            "wss://staging-api.tradingscannerpro.com",
            "http://localhost:3000",
            "ws://localhost:3000"
        ],
        
        // Frame sources
        'frame-src': ["'none'"],
        
        // Object sources (Flash, Java, etc.)
        'object-src': ["'none'"],
        
        // Media sources
        'media-src': ["'self'"],
        
        // Worker sources
        'worker-src': ["'self'", "blob:"],
        
        // Form action
        'form-action': ["'self'"],
        
        // Frame ancestors (prevents clickjacking)
        'frame-ancestors': ["'none'"],
        
        // Base URI
        'base-uri': ["'self'"],
        
        // Upgrade insecure requests
        'upgrade-insecure-requests': []
    },

    /**
     * Generate CSP header string
     */
    getCSPHeader() {
        const directives = [];
        
        for (const [directive, sources] of Object.entries(this.CSP)) {
            if (sources.length > 0) {
                directives.push(`${directive} ${sources.join(' ')}`);
            } else {
                directives.push(directive);
            }
        }
        
        return directives.join('; ');
    },

    /**
     * Additional Security Headers
     */
    HEADERS: {
        // Prevent MIME type sniffing
        'X-Content-Type-Options': 'nosniff',
        
        // Enable XSS protection
        'X-XSS-Protection': '1; mode=block',
        
        // Prevent clickjacking
        'X-Frame-Options': 'DENY',
        
        // Referrer policy
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        
        // Permissions policy (formerly Feature Policy)
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
        
        // Strict Transport Security (HSTS)
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    },

    /**
     * CORS Configuration
     */
    CORS: {
        development: {
            origin: ['http://localhost:*', 'http://127.0.0.1:*'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        },
        staging: {
            origin: ['https://staging.tradingscannerpro.com'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        },
        production: {
            origin: ['https://tradingscannerpro.com', 'https://www.tradingscannerpro.com'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }
    },

    /**
     * Rate Limiting Configuration
     */
    RATE_LIMITING: {
        // General API rate limit
        api: {
            windowMs: 15 * 60 * 1000,  // 15 minutes
            max: 100,  // Limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP, please try again later.'
        },
        
        // Authentication endpoints (stricter)
        auth: {
            windowMs: 15 * 60 * 1000,  // 15 minutes
            max: 5,  // Limit each IP to 5 login attempts per windowMs
            message: 'Too many login attempts, please try again later.'
        },
        
        // Registration endpoint
        register: {
            windowMs: 60 * 60 * 1000,  // 1 hour
            max: 3,  // Limit each IP to 3 registrations per hour
            message: 'Too many accounts created from this IP, please try again later.'
        }
    },

    /**
     * Input Validation Rules
     */
    VALIDATION: {
        // Email validation
        email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            maxLength: 255
        },
        
        // Password requirements
        password: {
            minLength: 8,
            maxLength: 128,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true
        },
        
        // Username requirements
        username: {
            pattern: /^[a-zA-Z0-9_-]+$/,
            minLength: 3,
            maxLength: 30
        },
        
        // Symbol validation (stock tickers)
        symbol: {
            pattern: /^[A-Z]{1,5}$/,
            maxLength: 5
        }
    },

    /**
     * Session Configuration
     */
    SESSION: {
        // JWT token expiration
        accessTokenExpiry: 3600,  // 1 hour
        refreshTokenExpiry: 604800,  // 7 days
        
        // Session cookie settings
        cookie: {
            httpOnly: true,
            secure: true,  // HTTPS only
            sameSite: 'strict',
            maxAge: 3600000  // 1 hour
        }
    },

    /**
     * Sanitization Rules
     */
    SANITIZATION: {
        // HTML sanitization (prevent XSS)
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
        allowedAttributes: {
            'a': ['href', 'title']
        },
        
        // SQL injection prevention
        escapeCharacters: ["'", '"', '\\', ';', '--', '/*', '*/']
    },

    /**
     * Apply security headers to response
     */
    applySecurityHeaders(response) {
        // Apply CSP
        response.setHeader('Content-Security-Policy', this.getCSPHeader());
        
        // Apply other security headers
        for (const [header, value] of Object.entries(this.HEADERS)) {
            response.setHeader(header, value);
        }
    },

    /**
     * Validate input against rules
     */
    validateInput(type, value) {
        const rules = this.VALIDATION[type];
        if (!rules) return { valid: true };

        const errors = [];

        // Check pattern
        if (rules.pattern && !rules.pattern.test(value)) {
            errors.push(`Invalid ${type} format`);
        }

        // Check length
        if (rules.minLength && value.length < rules.minLength) {
            errors.push(`${type} must be at least ${rules.minLength} characters`);
        }

        if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(`${type} must be at most ${rules.maxLength} characters`);
        }

        // Password-specific checks
        if (type === 'password') {
            if (rules.requireUppercase && !/[A-Z]/.test(value)) {
                errors.push('Password must contain at least one uppercase letter');
            }
            if (rules.requireLowercase && !/[a-z]/.test(value)) {
                errors.push('Password must contain at least one lowercase letter');
            }
            if (rules.requireNumbers && !/[0-9]/.test(value)) {
                errors.push('Password must contain at least one number');
            }
            if (rules.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
                errors.push('Password must contain at least one special character');
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Sanitize user input
     */
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;

        // Remove potential SQL injection characters
        let sanitized = input;
        this.SANITIZATION.escapeCharacters.forEach(char => {
            sanitized = sanitized.replace(new RegExp(char, 'g'), '');
        });

        // Remove HTML tags (basic XSS prevention)
        sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

        return sanitized.trim();
    }
};

// Export for use in backend
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SECURITY_CONFIG;
}

// Log security configuration in development
if (typeof CONFIG !== 'undefined' && CONFIG.DEBUG) {
    console.log('🔒 Security configuration loaded');
    console.log('CSP Header:', SECURITY_CONFIG.getCSPHeader());
}
