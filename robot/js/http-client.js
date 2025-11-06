/**
 * HTTP Client
 * Handles all API requests with retry logic, error handling, and authentication
 */

class HTTPClient {
    constructor() {
        this.requestCount = 0;
        this.requestTimestamps = [];
        this.pendingRequests = new Map();
    }

    /**
     * Make HTTP request with retry logic
     */
    async request(endpoint, options = {}) {
        const {
            method = 'GET',
            body = null,
            headers = {},
            timeout = CONFIG.getTimeout(),
            retryAttempts = CONFIG.getRetryConfig().attempts,
            retryDelay = CONFIG.getRetryConfig().delay,
            requiresAuth = false,
            skipRateLimit = false
        } = options;

        // Check rate limiting
        if (!skipRateLimit && !this.checkRateLimit()) {
            throw new Error(CONFIG.ERROR_MESSAGES.RATE_LIMIT);
        }

        // Build full URL
        const url = endpoint.startsWith('http') 
            ? endpoint 
            : `${CONFIG.getBaseURL()}${endpoint}`;

        // Build headers
        const requestHeaders = {
            'Content-Type': 'application/json',
            ...headers
        };

        // Add auth header if required
        if (requiresAuth || authManager.isAuthenticated()) {
            Object.assign(requestHeaders, authManager.getAuthHeader());
        }

        // Build request options
        const requestOptions = {
            method,
            headers: requestHeaders,
            ...(body && { body: JSON.stringify(body) })
        };

        // Attempt request with retries
        let lastError = null;
        for (let attempt = 0; attempt <= retryAttempts; attempt++) {
            try {
                // Log request in debug mode
                CONFIG.log(`${method} ${url}`, attempt > 0 ? `(Retry ${attempt})` : '');

                // Make request with timeout
                const response = await this.fetchWithTimeout(url, requestOptions, timeout);

                // Handle response
                return await this.handleResponse(response, url, method);

            } catch (error) {
                lastError = error;

                // Don't retry on certain errors
                if (this.shouldNotRetry(error)) {
                    throw error;
                }

                // Wait before retry (exponential backoff)
                if (attempt < retryAttempts) {
                    const delay = retryDelay * Math.pow(2, attempt);
                    CONFIG.log(`Retrying in ${delay}ms...`);
                    await this.sleep(delay);
                }
            }
        }

        // All retries failed
        throw lastError || new Error(CONFIG.ERROR_MESSAGES.UNKNOWN_ERROR);
    }

    /**
     * Fetch with timeout
     */
    async fetchWithTimeout(url, options, timeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error(CONFIG.ERROR_MESSAGES.TIMEOUT_ERROR);
            }
            throw error;
        }
    }

    /**
     * Handle API response
     */
    async handleResponse(response, url, method) {
        // Handle different status codes
        if (response.ok) {
            // Success (200-299)
            const data = await response.json();
            CONFIG.log(`✓ ${method} ${url}`, response.status);
            return data;
        }

        // Get error details
        let errorData;
        try {
            errorData = await response.json();
        } catch {
            errorData = { error: response.statusText };
        }

        // Handle specific error codes
        switch (response.status) {
            case 401:
                // Unauthorized - try to refresh token
                if (authManager.isAuthenticated()) {
                    const refreshed = await authManager.refreshAuthToken();
                    if (refreshed) {
                        // Retry the request with new token
                        throw new Error('TOKEN_REFRESHED');
                    }
                }
                authManager.clearAuthData();
                throw new Error(CONFIG.ERROR_MESSAGES.AUTH_ERROR);

            case 403:
                // Forbidden
                throw new Error(errorData.error || 'Access forbidden');

            case 404:
                // Not found
                throw new Error(CONFIG.ERROR_MESSAGES.NOT_FOUND);

            case 429:
                // Rate limit exceeded
                throw new Error(CONFIG.ERROR_MESSAGES.RATE_LIMIT);

            case 500:
            case 502:
            case 503:
            case 504:
                // Server errors
                throw new Error(CONFIG.ERROR_MESSAGES.SERVER_ERROR);

            default:
                throw new Error(errorData.error || CONFIG.ERROR_MESSAGES.UNKNOWN_ERROR);
        }
    }

    /**
     * Check if error should not be retried
     */
    shouldNotRetry(error) {
        const noRetryErrors = [
            CONFIG.ERROR_MESSAGES.AUTH_ERROR,
            CONFIG.ERROR_MESSAGES.NOT_FOUND,
            CONFIG.ERROR_MESSAGES.RATE_LIMIT,
            'Access forbidden'
        ];

        return noRetryErrors.some(msg => error.message.includes(msg));
    }

    /**
     * Check rate limiting
     */
    checkRateLimit() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        const oneHourAgo = now - 3600000;

        // Clean old timestamps
        this.requestTimestamps = this.requestTimestamps.filter(ts => ts > oneHourAgo);

        // Count requests in last minute and hour
        const requestsLastMinute = this.requestTimestamps.filter(ts => ts > oneMinuteAgo).length;
        const requestsLastHour = this.requestTimestamps.length;

        // Check limits
        if (requestsLastMinute >= CONFIG.RATE_LIMIT.MAX_REQUESTS_PER_MINUTE) {
            console.warn('Rate limit exceeded: too many requests per minute');
            return false;
        }

        if (requestsLastHour >= CONFIG.RATE_LIMIT.MAX_REQUESTS_PER_HOUR) {
            console.warn('Rate limit exceeded: too many requests per hour');
            return false;
        }

        // Add current request
        this.requestTimestamps.push(now);
        return true;
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * GET request
     */
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST', body });
    }

    /**
     * PUT request
     */
    async put(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', body });
    }

    /**
     * DELETE request
     */
    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }

    /**
     * Show user-friendly error message
     */
    showError(error, context = '') {
        let message = CONFIG.ERROR_MESSAGES.UNKNOWN_ERROR;

        if (error.message) {
            // Map error messages to user-friendly versions
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                message = CONFIG.ERROR_MESSAGES.NETWORK_ERROR;
            } else if (error.message.includes('timeout')) {
                message = CONFIG.ERROR_MESSAGES.TIMEOUT_ERROR;
            } else if (error.message.includes('auth') || error.message.includes('401')) {
                message = CONFIG.ERROR_MESSAGES.AUTH_ERROR;
            } else if (error.message.includes('404')) {
                message = CONFIG.ERROR_MESSAGES.NOT_FOUND;
            } else if (error.message.includes('rate limit') || error.message.includes('429')) {
                message = CONFIG.ERROR_MESSAGES.RATE_LIMIT;
            } else if (error.message.includes('500') || error.message.includes('server')) {
                message = CONFIG.ERROR_MESSAGES.SERVER_ERROR;
            } else {
                message = error.message;
            }
        }

        // Add context if provided
        if (context) {
            message = `${context}: ${message}`;
        }

        // Show error to user
        this.displayErrorNotification(message);

        // Log error in debug mode
        CONFIG.log('Error:', error);

        return message;
    }

    /**
     * Display error notification to user
     */
    displayErrorNotification(message) {
        // Create error notification element
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #FF4444, #CC0000);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(255, 68, 68, 0.4);
            z-index: 10000;
            max-width: 400px;
            font-weight: 600;
            animation: slideIn 0.3s ease-out;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">⚠️</span>
                <span>${message}</span>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Add CSS animations
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Create singleton instance
const httpClient = new HTTPClient();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = httpClient;
}
