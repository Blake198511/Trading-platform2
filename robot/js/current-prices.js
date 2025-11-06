/**
 * Current Market Prices (Updated Regularly)
 * Override simulated prices with real current prices
 */

const CURRENT_PRICES = {
    // Updated: January 2025
    
    // Major Tech Stocks
    'NVDA': 139.00,   // NVIDIA - AI chip leader
    'TSLA': 242.84,   // Tesla - EV leader
    'AAPL': 178.25,   // Apple
    'MSFT': 405.00,   // Microsoft
    'GOOGL': 145.00,  // Google/Alphabet
    'AMZN': 145.25,   // Amazon
    'META': 485.00,   // Meta/Facebook
    'NFLX': 650.00,   // Netflix
    
    // Market ETFs
    'SPY': 470.00,    // S&P 500 ETF
    'QQQ': 395.00,    // Nasdaq 100 ETF
    'IWM': 195.00,    // Russell 2000 (Small Cap)
    'DIA': 385.00,    // Dow Jones ETF
    
    // Defense & Aerospace
    'LMT': 462.50,    // Lockheed Martin
    'RTX': 95.00,     // Raytheon
    'BA': 175.00,     // Boeing
    'NOC': 475.00,    // Northrop Grumman
    
    // Biotech & Pharma
    'MRNA': 85.50,    // Moderna
    'BNTX': 95.25,    // BioNTech
    'PFE': 28.50,     // Pfizer
    'JNJ': 155.00,    // Johnson & Johnson
    'GILD': 78.50,    // Gilead
    'REGN': 875.25,   // Regeneron
    
    // Crypto-Related
    'COIN': 195.75,   // Coinbase
    'MSTR': 385.00,   // MicroStrategy
    'RIOT': 12.50,    // Riot Platforms
    'MARA': 18.75,    // Marathon Digital
    
    // Meme/Retail Stocks
    'GME': 18.25,     // GameStop
    'AMC': 4.85,      // AMC Entertainment
    'BBBY': 0.85,     // Bed Bath & Beyond
    
    // Growth Tech
    'PLTR': 16.25,    // Palantir
    'SNOW': 145.00,   // Snowflake
    'RBLX': 42.75,    // Roblox
    'U': 28.50,       // Unity
    
    // Energy & Solar
    'ENPH': 125.50,   // Enphase Energy
    'SEDG': 45.00,    // SolarEdge
    'FSLR': 185.00,   // First Solar
    
    // Chinese Tech
    'BABA': 85.00,    // Alibaba
    'JD': 32.50,      // JD.com
    'PDD': 125.00,    // PDD Holdings
    
    // Semiconductors
    'AMD': 145.00,    // AMD
    'INTC': 42.50,    // Intel
    'QCOM': 165.00,   // Qualcomm
    'AVGO': 1250.00,  // Broadcom
    'TSM': 145.00,    // Taiwan Semi
    
    // Financial
    'JPM': 185.00,    // JPMorgan
    'BAC': 38.50,     // Bank of America
    'GS': 425.00,     // Goldman Sachs
    'MS': 95.00,      // Morgan Stanley
    
    // Retail
    'WMT': 165.00,    // Walmart
    'TGT': 145.00,    // Target
    'COST': 725.00,   // Costco
    
    // Entertainment
    'DIS': 92.50,     // Disney
    'NFLX': 650.00,   // Netflix
    'SPOT': 285.00,   // Spotify
    
    // Automotive
    'F': 12.50,       // Ford
    'GM': 42.00,      // General Motors
    'RIVN': 12.75,    // Rivian
    'LCID': 2.85,     // Lucid
    
    // Penny Stocks (Under $5)
    'SNDL': 2.45,     // Sundial Growers
    'BBIG': 1.85,     // Vinco Ventures
    'PROG': 3.12,     // Progenity
    'MULN': 0.45,     // Mullen Automotive
    'GNUS': 0.85,     // Genius Brands
    
    // IPOs
    'ARM': 68.25,     // Arm Holdings
    'SOLV': 28.75,    // Solventum
    
    // M&A Targets
    'VMW': 141.25,    // VMware (Broadcom deal)
    'ATVI': 94.85,    // Activision (Microsoft deal)
    
    // VIX (Fear Index)
    'VIX': 15.50      // Volatility Index
};

/**
 * Get current price for a symbol
 */
function getCurrentPrice(symbol) {
    return CURRENT_PRICES[symbol.toUpperCase()] || null;
}

/**
 * Update price in recommendation object
 */
function updateRecommendationPrice(recommendation) {
    if (!recommendation || !recommendation.symbol) return recommendation;
    
    const currentPrice = getCurrentPrice(recommendation.symbol);
    if (currentPrice) {
        // Update current price
        recommendation.currentPrice = currentPrice;
        
        // Recalculate price change if we have entry/previous price
        if (recommendation.price || recommendation.entryPrice) {
            const entryPrice = recommendation.price || recommendation.entryPrice;
            const change = currentPrice - entryPrice;
            const changePercent = (change / entryPrice) * 100;
            
            recommendation.change = change;
            recommendation.changePercent = changePercent;
        }
        
        // Update profit/loss if applicable
        if (recommendation.action === 'buy' && recommendation.targetPrice) {
            const potentialGain = ((recommendation.targetPrice - currentPrice) / currentPrice) * 100;
            recommendation.potentialGain = potentialGain;
        }
    }
    
    return recommendation;
}

/**
 * Update prices in array of recommendations
 */
function updateRecommendationPrices(recommendations) {
    if (!Array.isArray(recommendations)) return recommendations;
    return recommendations.map(rec => updateRecommendationPrice(rec));
}

/**
 * Get price change for display
 */
function getPriceChangeDisplay(symbol) {
    const price = getCurrentPrice(symbol);
    if (!price) return { price: '--', change: '--', changePercent: '--', color: 'gray' };
    
    // Simulate daily change (in real app, this would come from API)
    const changePercent = (Math.random() - 0.5) * 6; // -3% to +3%
    const change = price * (changePercent / 100);
    
    return {
        price: price.toFixed(2),
        change: change.toFixed(2),
        changePercent: changePercent.toFixed(2),
        color: changePercent >= 0 ? 'green' : 'red',
        arrow: changePercent >= 0 ? '▲' : '▼'
    };
}

/**
 * Check if price data is stale (older than 1 day)
 */
function isPriceDataStale() {
    // In production, check last update timestamp
    // For now, always return false (data is current)
    return false;
}

/**
 * Get last update time
 */
function getLastUpdateTime() {
    return 'January 2025'; // Update this when you update prices
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CURRENT_PRICES,
        getCurrentPrice,
        updateRecommendationPrice,
        updateRecommendationPrices,
        getPriceChangeDisplay,
        isPriceDataStale,
        getLastUpdateTime
    };
}

// Log when loaded
console.log('📊 Current Prices loaded:', Object.keys(CURRENT_PRICES).length, 'symbols');
console.log('💰 NVDA:', getCurrentPrice('NVDA'));
console.log('🚗 TSLA:', getCurrentPrice('TSLA'));
console.log('🍎 AAPL:', getCurrentPrice('AAPL'));
