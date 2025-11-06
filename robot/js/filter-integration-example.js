/**
 * Filter System Integration Example
 * Demonstrates how to integrate the filter system with recommendation sections
 */

// Example: Initialize filters for Politicians & Big Investors section
function initializePoliticiansFilters() {
    // Sample recommendations data
    const recommendations = [
        {
            id: 'pol-1',
            symbol: 'NVDA',
            companyName: 'NVIDIA Corporation',
            assetType: 'stock',
            action: 'buy',
            entryPrice: 500.00,
            targetPrice: 600.00,
            stopLoss: 480.00,
            confidence: 92,
            riskLevel: 'Medium',
            timeframe: '3-6 months',
            riskRewardRatio: 5.0,
            catalyst: 'Nancy Pelosi Purchase',
            description: 'Pelosi has 85% win rate on tech stocks',
            sector: 'technology',
            marketCap: 1250000000000, // $1.25T
            reasoning: [
                'Pelosi has a 85% win rate on tech stocks',
                'Her AI chip plays historically return 40%+ within 6 months',
                'NVDA is her largest position'
            ],
            profitTargets: [
                { price: 550, allocation: 25, percentage: 10 },
                { price: 575, allocation: 30, percentage: 15 },
                { price: 600, allocation: 45, percentage: 20 }
            ]
        },
        {
            id: 'pol-2',
            symbol: 'LMT',
            companyName: 'Lockheed Martin',
            assetType: 'stock',
            action: 'buy',
            entryPrice: 460.00,
            targetPrice: 520.00,
            stopLoss: 445.00,
            confidence: 88,
            riskLevel: 'Low',
            timeframe: '6-12 months',
            riskRewardRatio: 4.0,
            catalyst: 'Dan Crenshaw Purchase',
            description: 'Defense spending increasing 15% next year',
            sector: 'industrial',
            marketCap: 115000000000, // $115B
            reasoning: [
                'Crenshaw sits on Armed Services Committee',
                'His defense stock picks average 28% returns',
                'Defense spending increasing 15% next year'
            ],
            profitTargets: [
                { price: 490, allocation: 30, percentage: 6.5 },
                { price: 505, allocation: 35, percentage: 9.8 },
                { price: 520, allocation: 35, percentage: 13 }
            ]
        }
    ];

    // Initialize filter system with custom sectors
    FilterManager.initializeSection('politicians-big-investors', recommendations, {
        showMarketCap: true,
        showSector: true,
        showRiskLevel: true,
        showAssetType: false,
        showSearch: true,
        sectors: [
            { value: 'technology', label: 'Technology' },
            { value: 'healthcare', label: 'Healthcare' },
            { value: 'finance', label: 'Finance' },
            { value: 'industrial', label: 'Defense & Industrial' },
            { value: 'energy', label: 'Energy' }
        ]
    });
}

// Example: Initialize filters for Growth Stocks section
function initializeGrowthStocksFilters() {
    const recommendations = [
        {
            id: 'growth-1',
            symbol: 'TSLA',
            companyName: 'Tesla Inc.',
            assetType: 'stock',
            action: 'buy',
            entryPrice: 240.00,
            targetPrice: 350.00,
            stopLoss: 220.00,
            confidence: 82,
            riskLevel: 'High',
            timeframe: '6-12 months',
            riskRewardRatio: 5.5,
            catalyst: 'Cybertruck Production Ramp',
            description: 'Leading EV manufacturer with energy storage growth',
            sector: 'automotive',
            category: 'ev',
            marketCap: 760000000000, // $760B
            reasoning: [
                'Cybertruck production ramping up',
                'Energy storage business growing 50% YoY',
                'FSD Beta showing significant improvements'
            ],
            profitTargets: [
                { price: 280, allocation: 25, percentage: 16.7 },
                { price: 315, allocation: 35, percentage: 31.3 },
                { price: 350, allocation: 40, percentage: 45.8 }
            ]
        },
        {
            id: 'growth-2',
            symbol: 'PLTR',
            companyName: 'Palantir Technologies',
            assetType: 'stock',
            action: 'buy',
            entryPrice: 18.50,
            targetPrice: 28.00,
            stopLoss: 16.00,
            confidence: 78,
            riskLevel: 'Medium',
            timeframe: '6-9 months',
            riskRewardRatio: 3.8,
            catalyst: 'AI Platform Adoption',
            description: 'Government and enterprise AI platform leader',
            sector: 'technology',
            category: 'ai',
            marketCap: 38000000000, // $38B
            reasoning: [
                'AI platform seeing rapid enterprise adoption',
                'Government contracts providing stable revenue',
                'Expanding into commercial sector successfully'
            ],
            profitTargets: [
                { price: 22, allocation: 30, percentage: 18.9 },
                { price: 25, allocation: 35, percentage: 35.1 },
                { price: 28, allocation: 35, percentage: 51.4 }
            ]
        }
    ];

    FilterManager.initializeSection('growth-stocks', recommendations, {
        showMarketCap: true,
        showSector: true,
        showRiskLevel: true,
        showAssetType: false,
        showSearch: true,
        sectors: [
            { value: 'ai', label: '🤖 AI & Tech' },
            { value: 'renewable', label: '🌱 Renewable Energy' },
            { value: 'ev', label: '🚗 Electric Vehicles' },
            { value: 'biotech', label: '🧬 Biotech' },
            { value: 'fintech', label: '💳 Fintech' }
        ]
    });
}

// Example: Initialize filters for Options Recommendations section
function initializeOptionsFilters() {
    const recommendations = [
        {
            id: 'opt-1',
            symbol: 'AAPL',
            companyName: 'Apple Inc.',
            assetType: 'option',
            action: 'buy',
            entryPrice: 3.50,
            targetPrice: 7.00,
            stopLoss: 1.75,
            confidence: 75,
            riskLevel: 'Medium',
            timeframe: '30-45 days',
            riskRewardRatio: 2.0,
            catalyst: 'iPhone 16 Launch',
            description: 'Call options ahead of product launch',
            sector: 'technology',
            marketCap: 2800000000000, // $2.8T
            optionType: 'call',
            strike: 185,
            expiration: '2024-12-20',
            impliedVolatility: 28,
            delta: 0.65,
            gamma: 0.08,
            expectedMove: 5.2,
            reasoning: [
                'iPhone 16 launch expected to drive strong sales',
                'Services revenue continuing to grow',
                'Implied volatility relatively low before event'
            ],
            profitTargets: [
                { price: 5.00, allocation: 40, percentage: 42.9 },
                { price: 6.00, allocation: 35, percentage: 71.4 },
                { price: 7.00, allocation: 25, percentage: 100 }
            ]
        },
        {
            id: 'opt-2',
            symbol: 'SPY',
            companyName: 'S&P 500 ETF',
            assetType: 'option',
            action: 'buy',
            entryPrice: 4.20,
            targetPrice: 8.50,
            stopLoss: 2.10,
            confidence: 68,
            riskLevel: 'High',
            timeframe: '14-21 days',
            riskRewardRatio: 2.05,
            catalyst: 'FOMC Meeting Volatility',
            description: 'Straddle strategy for high volatility event',
            sector: 'index',
            marketCap: 0,
            optionType: 'straddle',
            strike: 450,
            expiration: '2024-11-15',
            impliedVolatility: 18,
            delta: 0,
            gamma: 0.12,
            expectedMove: 3.8,
            reasoning: [
                'FOMC meeting expected to create volatility',
                'Straddle benefits from large move in either direction',
                'IV relatively low before major event'
            ],
            profitTargets: [
                { price: 6.00, allocation: 50, percentage: 42.9 },
                { price: 7.50, allocation: 30, percentage: 78.6 },
                { price: 8.50, allocation: 20, percentage: 102.4 }
            ]
        }
    ];

    FilterManager.initializeSection('options-recommendations', recommendations, {
        showMarketCap: false,
        showSector: true,
        showRiskLevel: true,
        showAssetType: false,
        showSearch: true,
        sectors: [
            { value: 'calls', label: '📈 Calls' },
            { value: 'puts', label: '📉 Puts' },
            { value: 'spreads', label: '📊 Spreads' },
            { value: 'straddle', label: '🎯 Straddles' },
            { value: 'strangle', label: '🎪 Strangles' }
        ]
    });
}

// Example: Initialize filters for Crypto Infrastructure section
function initializeCryptoFilters() {
    const recommendations = [
        {
            id: 'crypto-1',
            symbol: 'ETH',
            companyName: 'Ethereum',
            assetType: 'crypto',
            action: 'buy',
            entryPrice: 1850.00,
            targetPrice: 2500.00,
            stopLoss: 1650.00,
            confidence: 85,
            riskLevel: 'Medium',
            timeframe: '3-6 months',
            riskRewardRatio: 3.25,
            catalyst: 'Shanghai Upgrade Complete',
            description: 'Leading smart contract platform',
            project: 'Ethereum',
            sector: 'Layer1',
            marketCap: 222000000000, // $222B
            networkMetrics: {
                activeUsers: 450000,
                transactionVolume: 1200000,
                developerActivity: 2500
            },
            reasoning: [
                'Shanghai upgrade improving network efficiency',
                'DeFi ecosystem continues to grow',
                'Institutional adoption increasing'
            ],
            profitTargets: [
                { price: 2100, allocation: 30, percentage: 13.5 },
                { price: 2300, allocation: 35, percentage: 24.3 },
                { price: 2500, allocation: 35, percentage: 35.1 }
            ]
        },
        {
            id: 'crypto-2',
            symbol: 'FIL',
            companyName: 'Filecoin',
            assetType: 'crypto',
            action: 'buy',
            entryPrice: 4.50,
            targetPrice: 8.00,
            stopLoss: 3.50,
            confidence: 72,
            riskLevel: 'High',
            timeframe: '6-12 months',
            riskRewardRatio: 3.5,
            catalyst: 'Enterprise Storage Partnerships',
            description: 'Decentralized storage network',
            project: 'Filecoin',
            sector: 'Storage',
            marketCap: 2100000000, // $2.1B
            networkMetrics: {
                activeUsers: 85000,
                transactionVolume: 450000,
                developerActivity: 380
            },
            reasoning: [
                'Decentralized storage demand growing',
                'Enterprise partnerships expanding',
                'Network capacity increasing steadily'
            ],
            profitTargets: [
                { price: 6.00, allocation: 35, percentage: 33.3 },
                { price: 7.00, allocation: 35, percentage: 55.6 },
                { price: 8.00, allocation: 30, percentage: 77.8 }
            ]
        }
    ];

    FilterManager.initializeSection('crypto-infrastructure', recommendations, {
        showMarketCap: true,
        showSector: true,
        showRiskLevel: true,
        showAssetType: false,
        showSearch: true,
        sectors: [
            { value: 'Layer1', label: '🏗️ Layer 1' },
            { value: 'Layer2', label: '⚡ Layer 2' },
            { value: 'IoT', label: '📡 IoT Networks' },
            { value: 'Storage', label: '💾 Data Storage' },
            { value: 'Computing', label: '⚙️ Computing Power' },
            { value: 'Oracle', label: '🔮 Oracle Networks' }
        ]
    });
}

// Listen for filter events
window.addEventListener('filtersApplied', function(event) {
    const { section, filters, results } = event.detail;
    console.log(`Filters applied to ${section}:`, filters);
    console.log(`Results count: ${results.length}`);
    
    // You can add custom logic here, such as:
    // - Analytics tracking
    // - Update URL parameters
    // - Show/hide additional UI elements
});

// Example: Auto-initialize filters when sections are loaded
document.addEventListener('DOMContentLoaded', function() {
    // These would be called when the respective scan functions complete
    // For now, they're just examples of how to integrate
    
    console.log('Filter system ready for integration');
    console.log('Call FilterManager.initializeSection() after loading recommendations');
});
