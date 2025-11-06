/**
 * Tab Data Management System
 * Provides demo data for all trading tabs with improved architecture
 */

class TabDataManager {
    constructor() {
        this.templates = new TemplateRenderer();
        this.demoData = new DemoDataProvider();
        this.tabConfig = TAB_CONFIGURATION;
    }

    loadTabData(tabName) {
        const config = this.tabConfig[tabName];
        if (!config) {
            console.warn(`No configuration found for tab: ${tabName}`);
            return;
        }

        const container = document.getElementById(config.containerId);
        if (!container) {
            console.warn(`Container not found: ${config.containerId}`);
            return;
        }

        const data = this.demoData.getDataForTab(tabName);
        const html = this.templates.renderTabContent(config.template, data);
        container.innerHTML = html;
    }
}

class TemplateRenderer {
    renderTabContent(templateType, data) {
        switch (templateType) {
            case 'insider-card':
                return this.renderInsiderCards(data);
            case 'stock-result':
                return this.renderStockResults(data);
            case 'forex-pair':
                return this.renderForexPairs(data);
            case 'options-chain':
                return this.renderOptionsChain(data);
            case 'news-item':
                return this.renderNewsItems(data);
            default:
                console.error(`Unknown template type: ${templateType}`);
                return '';
        }
    }

    renderInsiderCards(items) {
        return items.map(item => this.createInsiderCard(item)).join('');
    }

    renderStockResults(items) {
        return items.map(item => this.createStockResult(item)).join('');
    }

    renderForexPairs(items) {
        return items.map(item => this.createForexPair(item)).join('');
    }

    renderOptionsChain(items) {
        return items.map(item => this.createOptionsChain(item)).join('');
    }

    renderNewsItems(items) {
        return items.map(item => this.createNewsItem(item)).join('');
    }

    createInsiderCard(data) {
        const { name, role, type, stock, shares, value, date, confidence, action } = data;
        
        return `
            <div class="insider-card ${type}">
                <div class="insider-header">
                    <div>
                        <div class="insider-name">${this.escapeHtml(name)}</div>
                        <div class="insider-role">${this.escapeHtml(role)}</div>
                    </div>
                    <div class="trade-badge ${action.toLowerCase()}">${action}</div>
                </div>
                <div class="trade-details">
                    ${this.createDetailRows([
                        ['Stock', stock],
                        ['Shares', shares.toLocaleString()],
                        ['Value', this.formatCurrency(value)],
                        ['Date', date]
                    ])}
                </div>
                ${this.createConfidenceScore(confidence)}
            </div>`;
    }

    createStockResult(data) {
        const { symbol, company, price, change, tags, probability, description, isBreaking } = data;
        
        return `
            <div class="stock-result ${isBreaking ? 'breaking-news' : ''}">
                ${isBreaking ? '<div class="breaking-banner">🚨 BREAKING: FDA APPROVAL IMMINENT</div>' : ''}
                <div class="stock-header">
                    <div>
                        <div class="stock-symbol">${this.escapeHtml(symbol)}</div>
                        <div style="color: var(--text-gray);">${this.escapeHtml(company)}</div>
                    </div>
                    <div>
                        <div class="stock-price ${change >= 0 ? 'profit-positive' : 'profit-negative'}">$${price}</div>
                        <div class="price-change ${change >= 0 ? 'profit-positive' : 'profit-negative'}">${change >= 0 ? '+' : ''}${change}%</div>
                    </div>
                </div>
                ${this.createTags(tags)}
                ${this.createProbabilityMeter(probability)}
                <p style="color: var(--text-gray); margin: 15px 0;">${this.escapeHtml(description)}</p>
            </div>`;
    }

    createDetailRows(rows) {
        return rows.map(([label, value]) => `
            <div class="detail-row">
                <span class="detail-label">${label}:</span>
                <span class="detail-value">${value}</span>
            </div>`).join('');
    }

    createConfidenceScore(confidence) {
        return `
            <div class="confidence-score">
                <span class="score-label">Confidence:</span>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${confidence}%"></div>
                </div>
                <span class="score-value">${confidence}%</span>
            </div>`;
    }

    createTags(tags) {
        return tags.map(tag => `<div class="catalyst-tag">${this.escapeHtml(tag)}</div>`).join('');
    }

    createProbabilityMeter(probability) {
        return `
            <div class="probability-meter">
                <span>${probability.label}:</span>
                <div class="probability-bar">
                    <div class="probability-fill" style="width: ${probability.value}%"></div>
                </div>
                <span style="color: var(--primary-green); font-weight: 700;">${probability.value}%</span>
            </div>`;
    }

    createForexPair(data) {
        const { pair, price, change, spread, volume, signal, strength, description } = data;
        
        return `
            <div class="forex-pair">
                <div class="forex-header">
                    <div>
                        <div class="forex-symbol">${this.escapeHtml(pair)}</div>
                        <div class="forex-price ${change >= 0 ? 'profit-positive' : 'profit-negative'}">${price}</div>
                    </div>
                    <div class="forex-change ${change >= 0 ? 'profit-positive' : 'profit-negative'}">
                        ${change >= 0 ? '+' : ''}${change}%
                    </div>
                </div>
                <div class="forex-details">
                    ${this.createDetailRows([
                        ['Spread', spread],
                        ['Volume', volume],
                        ['Signal', signal]
                    ])}
                </div>
                ${this.createConfidenceScore(strength)}
                <p style="color: var(--text-gray); margin: 15px 0;">${this.escapeHtml(description)}</p>
            </div>`;
    }

    createOptionsChain(data) {
        const { symbol, strike, expiry, type, premium, iv, delta, volume, openInterest, recommendation } = data;
        
        return `
            <div class="options-chain">
                <div class="options-header">
                    <div>
                        <div class="options-symbol">${this.escapeHtml(symbol)} ${strike}${type}</div>
                        <div style="color: var(--text-gray);">Exp: ${expiry}</div>
                    </div>
                    <div>
                        <div class="options-premium">${premium}</div>
                        <div class="options-recommendation ${recommendation.toLowerCase()}">${recommendation}</div>
                    </div>
                </div>
                <div class="options-details">
                    ${this.createDetailRows([
                        ['IV', iv],
                        ['Delta', delta],
                        ['Volume', volume.toLocaleString()],
                        ['Open Interest', openInterest.toLocaleString()]
                    ])}
                </div>
            </div>`;
    }

    createNewsItem(data) {
        const { headline, source, time, sentiment, impact, tickers, summary } = data;
        
        return `
            <div class="news-item ${impact.toLowerCase()}">
                <div class="news-header">
                    <div class="news-headline">${this.escapeHtml(headline)}</div>
                    <div class="news-meta">
                        <span class="news-source">${this.escapeHtml(source)}</span>
                        <span class="news-time">${time}</span>
                    </div>
                </div>
                <div class="news-sentiment ${sentiment.toLowerCase()}">
                    Sentiment: ${sentiment} | Impact: ${impact}
                </div>
                ${this.createTags(tickers)}
                <p style="color: var(--text-gray); margin: 15px 0;">${this.escapeHtml(summary)}</p>
            </div>`;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    escapeHtml(text) {
        if (typeof text !== 'string') {
            text = String(text || '');
        }
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    sanitizeData(data) {
        if (!data || typeof data !== 'object') return {};
        
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string') {
                sanitized[key] = this.escapeHtml(value);
            } else if (typeof value === 'number' && !isNaN(value)) {
                sanitized[key] = value;
            } else if (Array.isArray(value)) {
                sanitized[key] = value.map(item => 
                    typeof item === 'string' ? this.escapeHtml(item) : item
                );
            } else if (value && typeof value === 'object') {
                sanitized[key] = this.sanitizeData(value);
            } else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
}

// Configuration for tab data management
const TAB_CONFIGURATION = {
    'politicians-big-investors': {
        containerId: 'politiciansResults',
        fallbackId: 'insiderResults',
        template: 'insider-card'
    },
    'catalyst-scanner': {
        containerId: 'catalystResults',
        template: 'stock-result'
    },
    'biotech-analyzer': {
        containerId: 'biotechResults',
        template: 'stock-result'
    },
    'growth-stocks': {
        containerId: 'growthStocksResults',
        template: 'stock-result'
    },
    'pennystocks': {
        containerId: 'pennyStocksResults',
        template: 'stock-result'
    },
    'short-squeeze': {
        containerId: 'shortSqueezeResults',
        template: 'stock-result'
    },
    'ipo-analyzer': {
        containerId: 'ipoAnalyzerResults',
        template: 'stock-result'
    },
    'mergers-acquisitions': {
        containerId: 'mergersAcquisitionsResults',
        template: 'stock-result'
    },
    'options-recommendations': {
        containerId: 'optionsRecommendationsResults',
        template: 'options-chain'
    },
    'crypto-infrastructure': {
        containerId: 'cryptoInfrastructureResults',
        template: 'stock-result'
    },
    'forex-analyzer': {
        containerId: 'forexAnalyzerResults',
        template: 'forex-pair'
    },
    'news-analysis': {
        containerId: 'newsResults',
        template: 'news-item'
    }
};

// Demo data provider class
class DemoDataProvider {
    constructor() {
        this.data = {
            'politicians-big-investors': [
                // LEGENDARY INVESTORS
                {
                    name: 'Warren Buffett',
                    role: 'Berkshire Hathaway CEO - "Oracle of Omaha"',
                    type: 'legendary-investor',
                    stock: 'AAPL',
                    shares: 915560000,
                    value: 163200000000,
                    date: '2024-11-04',
                    confidence: 95,
                    action: 'HOLD',
                    successRate: 89,
                    avgReturn: 156,
                    strategy: 'Value investing legend. When Buffett holds, institutions follow. His AAPL position is 50% of Berkshire portfolio.',
                    trackRecord: '60+ years, 20% annual returns'
                },
                {
                    name: 'Cathie Wood',
                    role: 'ARK Invest CEO - "Innovation Investor"',
                    type: 'legendary-investor',
                    stock: 'TSLA',
                    shares: 1200000,
                    value: 291000000,
                    date: '2024-11-03',
                    confidence: 88,
                    action: 'BUY',
                    successRate: 72,
                    avgReturn: 185,
                    strategy: 'Disruptive innovation focus. Her TSLA calls have been legendary. Price target: $2000+ by 2027.',
                    trackRecord: 'ARK Innovation ETF: 40% annual returns (2020-2021)'
                },
                {
                    name: 'George Soros',
                    role: 'Soros Fund Management - "The Man Who Broke the Bank of England"',
                    type: 'legendary-investor',
                    stock: 'RIVN',
                    shares: 5000000,
                    value: 65000000,
                    date: '2024-11-02',
                    confidence: 82,
                    action: 'BUY',
                    successRate: 78,
                    avgReturn: 245,
                    strategy: 'Macro genius betting on EV transition. Made $1B shorting British pound in 1992.',
                    trackRecord: '$32B net worth, 30+ years of market dominance'
                },
                {
                    name: 'Ray Dalio',
                    role: 'Bridgewater Associates Founder - "Principles"',
                    type: 'legendary-investor',
                    stock: 'GLD',
                    shares: 8000000,
                    value: 1600000000,
                    date: '2024-11-01',
                    confidence: 85,
                    action: 'BUY',
                    successRate: 81,
                    avgReturn: 98,
                    strategy: 'All-weather portfolio creator. Gold hedge against inflation and currency debasement.',
                    trackRecord: 'Bridgewater: $140B AUM, consistent returns through all cycles'
                },
                {
                    name: 'Carl Icahn',
                    role: 'Icahn Enterprises - "Corporate Raider"',
                    type: 'legendary-investor',
                    stock: 'IEP',
                    shares: 85000000,
                    value: 1360000000,
                    date: '2024-10-30',
                    confidence: 90,
                    action: 'BUY',
                    successRate: 76,
                    avgReturn: 167,
                    strategy: 'Activist investor buying his own company. Classic Icahn move - he knows something.',
                    trackRecord: '$17B net worth, 50+ years of activist investing'
                },
                {
                    name: 'Peter Lynch',
                    role: 'Former Fidelity Magellan Fund Manager',
                    type: 'legendary-investor',
                    stock: 'COST',
                    shares: 2000000,
                    value: 1800000000,
                    date: '2024-10-28',
                    confidence: 87,
                    action: 'BUY',
                    successRate: 84,
                    avgReturn: 134,
                    strategy: '"Invest in what you know." Costco = consumer staple with pricing power.',
                    trackRecord: '29% annual returns for 13 years at Magellan Fund'
                },
                {
                    name: 'Jim Simons',
                    role: 'Renaissance Technologies - "Quant King"',
                    type: 'legendary-investor',
                    stock: 'NVDA',
                    shares: 3500000,
                    value: 1750000000,
                    date: '2024-10-25',
                    confidence: 93,
                    action: 'BUY',
                    successRate: 91,
                    avgReturn: 289,
                    strategy: 'Quantitative algorithms detected AI chip supercycle. Medallion Fund never wrong.',
                    trackRecord: '66% annual returns (before fees) for 30+ years'
                },
                {
                    name: 'Charlie Munger',
                    role: 'Berkshire Hathaway Vice Chairman - "Buffett\'s Partner"',
                    type: 'legendary-investor',
                    stock: 'BYD',
                    shares: 225000000,
                    value: 5850000000,
                    date: '2024-10-20',
                    confidence: 89,
                    action: 'HOLD',
                    successRate: 86,
                    avgReturn: 178,
                    strategy: 'Chinese EV play. Munger spotted BYD before Tesla was cool. Long-term value creation.',
                    trackRecord: 'Berkshire partner for 50+ years, 20%+ annual returns'
                },
                
                // POLITICIANS
                {
                    name: 'Nancy Pelosi',
                    role: 'Former Speaker of the House',
                    type: 'politician',
                    stock: 'NVDA',
                    shares: 10000,
                    value: 5050000,
                    date: '2024-11-05',
                    confidence: 88,
                    action: 'BUY',
                    successRate: 85,
                    avgReturn: 43,
                    strategy: 'Pelosi has 85% win rate on tech stocks. Her AI chip plays historically return 40%+ within 6 months.',
                    trackRecord: '15+ years of beating the market'
                },
                {
                    name: 'Dan Crenshaw',
                    role: 'U.S. Representative (TX-02) - Armed Services Committee',
                    type: 'politician',
                    stock: 'LMT',
                    shares: 5000,
                    value: 2300000,
                    date: '2024-11-04',
                    confidence: 86,
                    action: 'BUY',
                    successRate: 78,
                    avgReturn: 28,
                    strategy: 'Defense spending increasing 15% next year. He buys before major contract announcements.',
                    trackRecord: 'Armed Services Committee insider knowledge'
                },
                {
                    name: 'Alexandria Ocasio-Cortez',
                    role: 'U.S. Representative (NY-14)',
                    type: 'politician',
                    stock: 'TSLA',
                    shares: 2000,
                    value: 485000,
                    date: '2024-11-03',
                    confidence: 75,
                    action: 'BUY',
                    successRate: 65,
                    avgReturn: 22,
                    strategy: 'Green energy policy tailwinds. EV adoption accelerating with government support.',
                    trackRecord: 'Green New Deal advocate with policy insights'
                },
                
                // HEDGE FUND TITANS
                {
                    name: 'Bill Ackman',
                    role: 'Pershing Square Capital - "Activist Legend"',
                    type: 'hedge-fund',
                    stock: 'UMG',
                    shares: 70000000,
                    value: 1750000000,
                    date: '2024-10-15',
                    confidence: 84,
                    action: 'HOLD',
                    successRate: 73,
                    avgReturn: 156,
                    strategy: 'Universal Music Group = Netflix for music. Streaming royalties = recurring revenue.',
                    trackRecord: '$8B fund, famous for Herbalife short and Target activism'
                },
                {
                    name: 'David Einhorn',
                    role: 'Greenlight Capital - "Value + Short Seller"',
                    type: 'hedge-fund',
                    stock: 'GOOG',
                    shares: 1500000,
                    value: 240000000,
                    date: '2024-10-12',
                    confidence: 79,
                    action: 'BUY',
                    successRate: 71,
                    avgReturn: 98,
                    strategy: 'Google trading at discount despite AI leadership. Einhorn sees 50%+ upside.',
                    trackRecord: 'Famous for shorting Lehman Brothers before 2008 crash'
                },
                {
                    name: 'Stanley Druckenmiller',
                    role: 'Duquesne Family Office - "Soros Protégé"',
                    type: 'hedge-fund',
                    stock: 'COIN',
                    shares: 2000000,
                    value: 190000000,
                    date: '2024-10-10',
                    confidence: 81,
                    action: 'BUY',
                    successRate: 77,
                    avgReturn: 187,
                    strategy: 'Crypto adoption accelerating. COIN = picks and shovels play on digital gold rush.',
                    trackRecord: '30% annual returns for 30 years, never had losing year with Soros'
                }
            ],
            'catalyst-scanner': [
                {
                    symbol: 'MRNA',
                    company: 'Moderna Inc',
                    price: '85.42',
                    change: 12.5,
                    tags: ['FDA Approval', 'Biotech', 'High Volume'],
                    probability: { label: 'Success Probability', value: 85 },
                    description: 'FDA decision expected within 48 hours. Strong clinical trial results.',
                    isBreaking: true
                },
                {
                    symbol: 'TSLA',
                    company: 'Tesla Inc',
                    price: '248.50',
                    change: 5.2,
                    tags: ['Earnings Beat', 'EV Growth'],
                    probability: { label: 'Momentum Score', value: 78 },
                    description: 'Q3 earnings beat expectations. Strong delivery numbers.',
                    isBreaking: false
                }
            ],
            'biotech-analyzer': [
                {
                    symbol: 'GILD',
                    company: 'Gilead Sciences',
                    price: '78.90',
                    change: 8.3,
                    tags: ['Phase 3 Results', 'Cancer Treatment'],
                    probability: { label: 'Success Rate', value: 82 },
                    description: 'Revolutionary cancer treatment showing 82% success rate in trials.',
                    isBreaking: false
                },
                {
                    symbol: 'BIIB',
                    company: 'Biogen Inc',
                    price: '245.67',
                    change: 15.7,
                    tags: ['Alzheimer\'s Drug', 'FDA Fast Track'],
                    probability: { label: 'Approval Odds', value: 75 },
                    description: 'Alzheimer\'s treatment granted FDA fast track designation.',
                    isBreaking: false
                }
            ],
            'growth-stocks': [
                {
                    symbol: 'NVDA',
                    company: 'NVIDIA Corporation',
                    price: '135.42',
                    change: 22.1,
                    tags: ['AI Revolution', 'Data Centers'],
                    probability: { label: 'Growth Score', value: 95 },
                    description: 'Leading AI chip manufacturer with explosive growth potential.',
                    isBreaking: false
                },
                {
                    symbol: 'PLTR',
                    company: 'Palantir Technologies',
                    price: '42.18',
                    change: 18.9,
                    tags: ['Government Contracts', 'Big Data'],
                    probability: { label: 'Growth Score', value: 87 },
                    description: 'Data analytics platform with expanding government and enterprise contracts.',
                    isBreaking: false
                }
            ]
        };
    }

    getDataForTab(tabName) {
        return this.data[tabName] || [];
    }
}

// Initialize the tab data manager
const tabDataManager = new TabDataManager();

// Legacy function compatibility layer
function loadPoliticiansData() {
    tabDataManager.loadTabData('politicians-big-investors');
}

function loadCatalystsData() {
    tabDataManager.loadTabData('catalyst-scanner');
}

function loadBiotechData() {
    tabDataManager.loadTabData('biotech-analyzer');
}

function loadGrowthStocksData() {
    tabDataManager.loadTabData('growth-stocks');
}

// Enhanced global function exports with new architecture
window.scanCatalysts = () => tabDataManager.loadTabData('catalyst-scanner');
window.scanBiotechBreakthroughs = () => tabDataManager.loadTabData('biotech-analyzer');
window.scanGrowthStocks = () => tabDataManager.loadTabData('growth-stocks');

// Auto-load data when tabs are clicked with improved error handling
document.addEventListener('DOMContentLoaded', function() {
    const originalShowTab = window.showTab;
    
    window.showTab = function(tabName) {
        try {
            // Call original function if it exists
            if (originalShowTab && typeof originalShowTab === 'function') {
                originalShowTab(tabName);
            }
            
            // Auto-load data with new architecture
            setTimeout(() => {
                try {
                    tabDataManager.loadTabData(tabName);
                } catch (dataError) {
                    console.error(`Error loading data for tab ${tabName}:`, dataError);
                    // Show user-friendly error message
                    const container = document.getElementById(TAB_CONFIGURATION[tabName]?.containerId);
                    if (container) {
                        container.innerHTML = `
                            <div class="error-message">
                                <h3>Unable to load data</h3>
                                <p>There was an issue loading data for this section. Please try refreshing the page.</p>
                                <button onclick="tabDataManager.loadTabData('${tabName}')" class="retry-button">
                                    Retry
                                </button>
                            </div>`;
                    }
                }
            }, 100);
            
        } catch (error) {
            console.error(`Error in showTab function for ${tabName}:`, error);
        }
    };
});

console.log('Tab data fix loaded - all tabs should now show demo data!');