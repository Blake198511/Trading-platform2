/**
 * Authentication Manager
 * Handles JWT token storage, validation, and authentication state
 */

class AuthManager {
    constructor() {
        this.token = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
        this.user = null;
        this.refreshTimer = null;
        
        // Load existing auth data from localStorage
        this.loadAuthData();
        
        // Set up automatic token refresh
        if (this.isAuthenticated()) {
            this.scheduleTokenRefresh();
        }
    }

    /**
     * Load authentication data from localStorage
     */
    loadAuthData() {
        try {
            this.token = localStorage.getItem(CONFIG.AUTH.TOKEN_KEY);
            this.refreshToken = localStorage.getItem(CONFIG.AUTH.REFRESH_TOKEN_KEY);
            const expiryStr = localStorage.getItem(CONFIG.AUTH.TOKEN_EXPIRY_KEY);
            this.tokenExpiry = expiryStr ? new Date(expiryStr) : null;
            
            const userStr = localStorage.getItem(CONFIG.AUTH.USER_KEY);
            this.user = userStr ? JSON.parse(userStr) : null;
            
            // Check if token is expired
            if (this.token && this.isTokenExpired()) {
                console.log('Token expired, clearing auth data');
                this.clearAuthData();
            }
        } catch (error) {
            console.error('Error loading auth data:', error);
            this.clearAuthData();
        }
    }

    /**
     * Save authentication data to localStorage
     */
    saveAuthData(token, refreshToken, expiresIn, user) {
        try {
            this.token = token;
            this.refreshToken = refreshToken;
            this.user = user;
            
            // Calculate expiry time (expiresIn is in seconds)
            this.tokenExpiry = new Date(Date.now() + (expiresIn * 1000));
            
            localStorage.setItem(CONFIG.AUTH.TOKEN_KEY, token);
            localStorage.setItem(CONFIG.AUTH.REFRESH_TOKEN_KEY, refreshToken);
            localStorage.setItem(CONFIG.AUTH.TOKEN_EXPIRY_KEY, this.tokenExpiry.toISOString());
            localStorage.setItem(CONFIG.AUTH.USER_KEY, JSON.stringify(user));
            
            // Schedule token refresh
            this.scheduleTokenRefresh();
            
            // Emit authentication event
            this.emitAuthEvent('login', user);
        } catch (error) {
            console.error('Error saving auth data:', error);
        }
    }

    /**
     * Clear all authentication data
     */
    clearAuthData() {
        this.token = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
        this.user = null;
        
        localStorage.removeItem(CONFIG.AUTH.TOKEN_KEY);
        localStorage.removeItem(CONFIG.AUTH.REFRESH_TOKEN_KEY);
        localStorage.removeItem(CONFIG.AUTH.TOKEN_EXPIRY_KEY);
        localStorage.removeItem(CONFIG.AUTH.USER_KEY);
        
        // Clear refresh timer
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
        
        // Emit logout event
        this.emitAuthEvent('logout');
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.token !== null && !this.isTokenExpired();
    }

    /**
     * Check if token is expired
     */
    isTokenExpired() {
        if (!this.tokenExpiry) return true;
        return new Date() >= this.tokenExpiry;
    }

    /**
     * Get current auth token
     */
    getToken() {
        if (this.isTokenExpired()) {
            this.clearAuthData();
            return null;
        }
        return this.token;
    }

    /**
     * Get current user
     */
    getUser() {
        return this.user;
    }

    /**
     * Get authorization header
     */
    getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    /**
     * Login with credentials
     */
    async login(email, password) {
        try {
            const response = await fetch(`${CONFIG.getBaseURL()}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Save auth data
            this.saveAuthData(
                data.token,
                data.refreshToken,
                data.expiresIn || 3600, // Default 1 hour
                data.user
            );

            return { success: true, user: data.user };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Register new user
     */
    async register(email, password, username) {
        try {
            const response = await fetch(`${CONFIG.getBaseURL()}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, username })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Save auth data
            this.saveAuthData(
                data.token,
                data.refreshToken,
                data.expiresIn || 3600,
                data.user
            );

            return { success: true, user: data.user };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            // Call logout endpoint if authenticated
            if (this.isAuthenticated()) {
                await fetch(`${CONFIG.getBaseURL()}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        ...this.getAuthHeader(),
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Always clear local auth data
            this.clearAuthData();
        }
    }

    /**
     * Refresh authentication token
     */
    async refreshAuthToken() {
        if (!this.refreshToken) {
            console.log('No refresh token available');
            this.clearAuthData();
            return false;
        }

        try {
            const response = await fetch(`${CONFIG.getBaseURL()}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken: this.refreshToken })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Token refresh failed');
            }

            // Update auth data with new token
            this.saveAuthData(
                data.token,
                data.refreshToken || this.refreshToken,
                data.expiresIn || 3600,
                this.user
            );

            console.log('Token refreshed successfully');
            return true;
        } catch (error) {
            console.error('Token refresh error:', error);
            this.clearAuthData();
            return false;
        }
    }

    /**
     * Schedule automatic token refresh
     */
    scheduleTokenRefresh() {
        // Clear existing timer
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }

        if (!this.tokenExpiry) return;

        // Refresh token 5 minutes before expiry
        const refreshTime = this.tokenExpiry.getTime() - Date.now() - (5 * 60 * 1000);

        if (refreshTime > 0) {
            this.refreshTimer = setTimeout(() => {
                console.log('Auto-refreshing token...');
                this.refreshAuthToken();
            }, refreshTime);
        } else {
            // Token expires soon, refresh immediately
            this.refreshAuthToken();
        }
    }

    /**
     * Emit authentication events
     */
    emitAuthEvent(eventName, data = null) {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(`auth:${eventName}`, { 
                detail: data 
            }));
        }
    }

    /**
     * Check if user has specific role
     */
    hasRole(role) {
        return this.user && this.user.role === role;
    }

    /**
     * Check if user is verified
     */
    isVerified() {
        return this.user && this.user.verified === true;
    }
}

// Create singleton instance
const authManager = new AuthManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = authManager;
}
