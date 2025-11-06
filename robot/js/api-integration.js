/**
 * API Integration Helper
 * Provides easy-to-use functions for frontend components to interact with backend
 */

class APIIntegration {
    constructor() {
        this.apiEndpoints = null;
        this.isInitialized = false;
    }

    /**
     * Initialize API integration
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            // Initialize API endpoints
            this.apiEndpoints = new APIEndpoints();
            
            // Check backend health
            if (CONFIG.FEATURES.USE_REAL_API) {
                await this.checkBackendHealth();
            }

            this.isInitialized = true;
            CONFIG.log('API Integration initialized successfully');
        } catch (error) {
            console.error('Failed to initialize API integration:', error);
            // Continue with simulated data
            this.apiEndpoints = new APIEndpoints();
            this.isInitialized = true;
        }
    }

    /**
     * Check if backend is healthy
     */
    async checkBackendHealth() {
        try {
            const response = await httpClient.get('/health', {
                timeout: 5000,
                retryAttempts: 1
            });
            CONFIG.log('Backend health check:', response);
            return response.success === true;
        } catch (error) {
            console.warn('Backend health check failed:', error.message);
            return false;
        }
    }

    /**
     * Fetch politicians and institutional investor trades
     */
    async fetchPoliticiansInvestors(filter = 'all') {
        await this.ensureInitialized();
        
        try {
            const data = await this.apiEndpoints.makeRequest('/politicians-investors', { filter });
            return this.normalizeResponse(data);
        } catch (error) {
            httpClient.showError(error, 'Failed to load politician trades');
            throw error;
        }
    }

    /**
     * Fetch catalyst scanner data
     */
    async fetchCatalysts(filter = 'all') {
        await this.ensureInitialized();
        
        try {
            const data = await this.apiEndpoints.makeRequest('/catalysts', { filter });
            return this.normalizeResponse(data);
        } catch (error) {
            httpClient.showError(error, 'Failed to load catalysts');
            throw error;
        }
    }

    /**
     * Fetch biotech recommendations
     */
    async fetchBiotech(filter = 'all') {
        await this.ensureInitialized();
        
        try {
            const data = await this.apiEndpoints.makeRequest('/biotech', { filter });
            return this.normalizeResponse(data);
        } catch (error) {
            httpClient.showError(error, 'Failed to load biotech plays');
            throw error;
        }
    }

    /**
     * Fetch growth stocks
     */
    async fetchGrowthStocks(filter = 'all') {
        await this.ensureInitialized();
        
        try {
            const data = await this.apiEndpoints.makeRequest('/growth-stocks', { filter });
            return this.normalizeResponse(data);
        } catch (error) {
            httpClient.showError(error, 'Failed to load growth stocks');
            throw error;
        }
    }

    /**
     * Fetch penny stocks
     */
    async fetchPennyStocks(filter = 'all') {
        await this.ensureInitialized();
        
        try {
            const data = await this.apiEndpoints.makeRequest('/penny-stocks', { filter });
            return this.normalizeResponse(data);
        } catch (error) {
            httpClient.showError(error, 'Failed to load penny stocks');
            throw error;
        }
    }

    /**
     * Fetch short squeeze candidates
     */
    async fetchShortSqueeze(filter = 'all') {
        await this.ensureInitialized();
        
        try {
            const data = await this.apiEndpoints.makeRequest('/short-squeeze', { filter });
            return this.normalizeResponse(data);
        } catch (error) {
            httpClient.showError(error, 'Failed to load short squeeze data');
            throw error;
        }
    }

    /**
     * Fetch IPO analysis
     */
    async fetchIPOAnalysis(filter = 'all') {
        await this.ensureInitialized();
        
        try {
            const data = await this.apiEndpoints.makeRequest('/ipo-analysis', { filter });
            return this.normalizeResponse(data);
        } catch (error) {
            httpClient.showError(error, 'Failed to load IPO analysis');
            throw error;
        }
    }

    /**
     * Fetch mergers and acquisitions
     */
    async fetchMergersAcquisitions(filter = 'all') {
        await this.ensureInitialized();
        
        try {
            const data = await this.apiEndpoints.makeRequest('/mergers-acquisitions', { filter });
            return this.normalizeResponse(data);
        } catch (error) {
            httpClient.showError(error, 'Failed to load M&A data');
            throw error;
        }
    }

    /**
     * Fetch options recommendations
     */
    async fetchOptionsRecommendations(filter = 'all') {
        await this.ensureInitialized();
        
        try {
            const data = await this.apiEndpoints.makeRequest('/options-recommendations', { filter });
            return this.normalizeResponse(data);
        } catch (error) {
            httpClient.showError(error, 'Failed to load options recommendations');
            throw error;
        }
    }

    /**
     * Fetch crypto infrastructure recommendations
     */
    async fetchCryptoInfrastructure(filter = 'all') {
        await this.ensureInitialized();
        
        try {
            const data = await this.apiEndpoints.makeRequest('/crypto-infrastructure', { filter });
            return this.normalizeResponse(data);
        } catch (error) {
            httpClient.showError(error, 'Failed to load crypto recommendations');
            throw error;
        }
    }

    /**
     * Fetch forex analysis
     */
    async fetchForexAnalysis(filter = 'all') {
        await this.ensureInitialized();
        
        try {
            const data = await this.apiEndpoints.makeRequest('/forex-analysis', { filter });
            return this.normalizeResponse(data);
        } catch (error) {
            httpClient.showError(error, 'Failed to load forex analysis');
            throw error;
        }
    }

    /**
     * Fetch news analysis
     */
    async fetchNewsAnalysis(filter = 'all') {
        await this.ensureInitialized();
        
        try {
            const data = await this.apiEndpoints.makeRequest('/news-analysis', { filter });
            return this.normalizeResponse(data);
        } catch (error) {
            httpClient.showError(error, 'Failed to load news analysis');
            throw error;
        }
    }

    /**
     * Fetch catalyst events
     */
    async fetchCatalystEvents(filter = 'all') {
        await this.ensureInitialized();
        
        try {
            const data = await this.apiEndpoints.makeRequest('/catalyst-events', { filter });
            return this.normalizeResponse(data);
        } catch (error) {
            httpClient.showError(error, 'Failed to load catalyst events');
            throw error;
        }
    }

    /**
     * Ensure API is initialized
     */
    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.initialize();
        }
    }

    /**
     * Normalize API response
     * Handles different response formats from backend
     */
    normalizeResponse(data) {
        // If data is already an array, return it
        if (Array.isArray(data)) {
            return data;
        }

        // If data has a 'data' property, extract it
        if (data && data.data) {
            return Array.isArray(data.data) ? data.data : [data.data];
        }

        // If data has a 'recommendations' property, extract it
        if (data && data.recommendations) {
            return Array.isArray(data.recommendations) ? data.recommendations : [data.recommendations];
        }

        // If data has a 'results' property, extract it
        if (data && data.results) {
            return Array.isArray(data.results) ? data.results : [data.results];
        }

        // Return as single-item array
        return [data];
    }

    /**
     * Clear all caches
     */
    clearCache() {
        if (this.apiEndpoints) {
            this.apiEndpoints.clearCache();
        }
    }

    /**
     * Show loading indicator
     */
    showLoading(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div class="loading-spinner" style="
                    border: 4px solid rgba(255, 215, 0, 0.1);
                    border-top: 4px solid var(--primary-yellow);
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <p style="color: var(--text-white); font-size: 16px;">Loading recommendations...</p>
            </div>
        `;
    }

    /**
     * Show error message
     */
    showError(containerId, message) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                <p style="color: var(--danger); font-size: 18px; font-weight: 600; margin-bottom: 10px;">
                    Error Loading Data
                </p>
                <p style="color: var(--text-white); font-size: 14px;">
                    ${message}
                </p>
                <button onclick="location.reload()" style="
                    margin-top: 20px;
                    padding: 10px 20px;
                    background: var(--primary-yellow);
                    color: var(--card-black);
                    border: none;
                    border-radius: 5px;
                    font-weight: 600;
                    cursor: pointer;
                ">
                    Retry
                </button>
            </div>
        `;
    }

    /**
     * Show empty state
     */
    showEmptyState(containerId, message = 'No recommendations available') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 20px;">📊</div>
                <p style="color: var(--text-white); font-size: 16px;">
                    ${message}
                </p>
            </div>
        `;
    }
}

// Add loading spinner animation
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// Create singleton instance
const apiIntegration = new APIIntegration();

// Auto-initialize on page load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        apiIntegration.initialize().catch(error => {
            console.error('Failed to initialize API integration:', error);
        });
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = apiIntegration;
}
