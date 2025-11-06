/**
 * Real-Time Price Fetcher
 * Connects to Alpha Vantage API for live stock prices
 * Free tier: 5 API calls/minute, 500/day
 */

class RealTimePriceFetcher {
    constructor() {
        // Get API key from config or use demo key
        this.apiKey = this.getAPIKey();
        this.baseURL = 'https://www.alphavantage.co/query';
        this.cache = new Map();
        this.cacheTimeout = 60 * 1000; // 1 minute cache
        this.requestQueue = [];
        this.isProcessing = false;
        this.rateLimitDelay = 12000; // 12 seconds between requests (5 per minute)
        this.lastRequestTime = 0;
        
        console.log('📊 Real-Time Price Fetcher initialized');
        console.log('🔑 API Key:', this.apiKey ? 'Configured ✅' : 'Using Demo Key ⚠️');
    }

    /**
     * Get API key from config or localStorage
     */
    getAPIKey() {
        // Check if CONFIG has API key
        if (typeof CONFIG !== 'undefined' && CONFIG.API_KEYS && CONFIG.API_KEYS.ALPHA_VANTAGE) {
            return CONFIG.API_KEYS.ALPHA_VANTAGE;
        }
        
        // Check if user has set API key in localStorage
        const storedKey = localStorage.getItem('alphavantage_api_key');
        if (storedKey) return storedKey;
        
        // Use demo key (limited to 5 calls/day)
        return 'demo';
    }

    /**
     * Set API key (user can update this)
     */
    setAPIKey(apiKey) {
        localStorage.setItem('alphavantage_api_key', apiKey);
        this.apiKey = apiKey;
        console.log('✅ API Key updated');
    }

    /**
     * Fetch real-time price for a single symbol
     */
    async fetchPrice(symbol) {
        // Check cache first
        const cached = this.cache.get(symbol);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            console.log(`📦 Using cached price for ${symbol}`);
            return cached.data;
        }

        try {
            // Build URL
            const url = `${this.baseURL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`;
            
            // Respect rate limit
            await this.waitForRateLimit();
            
            console.log(`🔄 Fetching price for ${symbol}...`);
            const response = await fetch(url);
            const data = await response.json();
            
            // Check for errors
            if (data['Error Message']) {
                throw new Error(`Invalid symbol: ${symbol}`);
            }
            
            if (data['Note']) {
                throw new Error('API rate limit exceeded. Please wait or upgrade your API key.');
            }
            
            // Parse response
            const quote = data['Global Quote'];
            if (!quote || Object.keys(quote).length === 0) {
                throw new Error(`No data available for ${symbol}`);
            }
            
            const priceData = {
                symbol: symbol,
                price: parseFloat(quote['05. price']),
                change: parseFloat(quote['09. change']),
                changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
                volume: parseInt(quote['06. volume']),
                latestTradingDay: quote['07. latest trading day'],
                previousClose: parseFloat(quote['08. previous close']),
                timestamp: Date.now()
            };
            
            // Cache the result
            this.cache.set(symbol, {
                data: priceData,
                timestamp: Date.now()
            });
            
            console.log(`✅ ${symbol}: $${priceData.price} (${priceData.changePercent >= 0 ? '+' : ''}${priceData.changePercent.toFixed(2)}%)`);
            
            return priceData;
            
        } catch (error) {
            console.error(`❌ Error fetching ${symbol}:`, error.message);
            
            // Fallback to current-prices.js if available
            if (typeof getCurrentPrice === 'function') {
                const fallbackPrice = getCurrentPrice(symbol);
                if (fallbackPrice) {
                    console.log(`📦 Using fallback price for ${symbol}: $${fallbackPrice}`);
                    return {
                        symbol: symbol,
                        price: fallbackPrice,
                        change: 0,
                        changePercent: 0,
                        volume: 0,
                        latestTradingDay: new Date().toISOString().split('T')[0],
                        previousClose: fallbackPrice,
                        timestamp: Date.now(),
                        isFallback: true
                    };
                }
            }
            
            throw error;
        }
    }

    /**
     * Fetch prices for multiple symbols (batched with rate limiting)
     */
    async fetchPrices(symbols) {
        console.log(`📊 Fetching prices for ${symbols.length} symbols...`);
        
        const results = {};
        const errors = [];
        
        for (const symbol of symbols) {
            try {
                const priceData = await this.fetchPrice(symbol);
                results[symbol] = priceData;
            } catch (error) {
                errors.push({ symbol, error: error.message });
                results[symbol] = null;
            }
        }
        
        if (errors.length > 0) {
            console.warn(`⚠️ Failed to fetch ${errors.length} symbols:`, errors);
        }
        
        return results;
    }

    /**
     * Wait for rate limit (5 calls per minute)
     */
    async waitForRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.rateLimitDelay) {
            const waitTime = this.rateLimitDelay - timeSinceLastRequest;
            console.log(`⏳ Rate limit: waiting ${(waitTime / 1000).toFixed(1)}s...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.lastRequestTime = Date.now();
    }

    /**
     * Fetch intraday prices (for charts)
     */
    async fetchIntradayPrices(symbol, interval = '5min') {
        try {
            const url = `${this.baseURL}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${this.apiKey}`;
            
            await this.waitForRateLimit();
            
            console.log(`📈 Fetching intraday data for ${symbol}...`);
            const response = await fetch(url);
            const data = await response.json();
            
            if (data['Error Message']) {
                throw new Error(`Invalid symbol: ${symbol}`);
            }
            
            if (data['Note']) {
                throw new Error('API rate limit exceeded');
            }
            
            const timeSeries = data[`Time Series (${interval})`];
            if (!timeSeries) {
                throw new Error('No intraday data available');
            }
            
            // Convert to array format
            const prices = Object.entries(timeSeries).map(([time, values]) => ({
                time: time,
                open: parseFloat(values['1. open']),
                high: parseFloat(values['2. high']),
                low: parseFloat(values['3. low']),
                close: parseFloat(values['4. close']),
                volume: parseInt(values['5. volume'])
            }));
            
            console.log(`✅ Loaded ${prices.length} intraday data points for ${symbol}`);
            
            return prices;
            
        } catch (error) {
            console.error(`❌ Error fetching intraday data for ${symbol}:`, error.message);
            throw error;
        }
    }

    /**
     * Fetch daily prices (for historical analysis)
     */
    async fetchDailyPrices(symbol, outputSize = 'compact') {
        try {
            const url = `${this.baseURL}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=${outputSize}&apikey=${this.apiKey}`;
            
            await this.waitForRateLimit();
            
            console.log(`📊 Fetching daily data for ${symbol}...`);
            const response = await fetch(url);
            const data = await response.json();
            
            if (data['Error Message']) {
                throw new Error(`Invalid symbol: ${symbol}`);
            }
            
            if (data['Note']) {
                throw new Error('API rate limit exceeded');
            }
            
            const timeSeries = data['Time Series (Daily)'];
            if (!timeSeries) {
                throw new Error('No daily data available');
            }
            
            // Convert to array format
            const prices = Object.entries(timeSeries).map(([date, values]) => ({
                date: date,
                open: parseFloat(values['1. open']),
                high: parseFloat(values['2. high']),
                low: parseFloat(values['3. low']),
                close: parseFloat(values['4. close']),
                volume: parseInt(values['5. volume'])
            }));
            
            console.log(`✅ Loaded ${prices.length} daily data points for ${symbol}`);
            
            return prices;
            
        } catch (error) {
            console.error(`❌ Error fetching daily data for ${symbol}:`, error.message);
            throw error;
        }
    }

    /**
     * Search for symbols
     */
    async searchSymbols(keywords) {
        try {
            const url = `${this.baseURL}?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${this.apiKey}`;
            
            await this.waitForRateLimit();
            
            console.log(`🔍 Searching for: ${keywords}...`);
            const response = await fetch(url);
            const data = await response.json();
            
            if (data['Error Message']) {
                throw new Error('Search failed');
            }
            
            const matches = data['bestMatches'] || [];
            
            console.log(`✅ Found ${matches.length} matches`);
            
            return matches.map(match => ({
                symbol: match['1. symbol'],
                name: match['2. name'],
                type: match['3. type'],
                region: match['4. region'],
                currency: match['8. currency']
            }));
            
        } catch (error) {
            console.error('❌ Search error:', error.message);
            throw error;
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Price cache cleared');
    }

    /**
     * Get cache stats
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            symbols: Array.from(this.cache.keys())
        };
    }
}

// Create singleton instance
const realTimePriceFetcher = new RealTimePriceFetcher();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = realTimePriceFetcher;
}

// Add helper function to window
window.updatePriceForSymbol = async function(symbol) {
    try {
        const price = await realTimePriceFetcher.fetchPrice(symbol);
        console.log(`${symbol}: $${price.price}`);
        return price;
    } catch (error) {
        console.error(`Failed to fetch ${symbol}:`, error.message);
        return null;
    }
};

console.log('💡 Tip: Use updatePriceForSymbol("NVDA") in console to fetch real-time price');
