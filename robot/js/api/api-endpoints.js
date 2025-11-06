// API Endpoints and Data Sources
// Connects to real backend API with fallback to simulated data

class APIEndpoints {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = CONFIG.CACHE.DEFAULT_TTL;
        this.useRealAPI = CONFIG.FEATURES.USE_REAL_API;
    }

    /**
     * Generic API call with caching and error handling
     */
    async makeRequest(endpoint, options = {}) {
        const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
        
        // Check cache first
        if (CONFIG.CACHE.ENABLED) {
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
                CONFIG.log('Returning cached data for:', endpoint);
                return cached.data;
            }
        }

        let data;

        // Try real API first if enabled
        if (this.useRealAPI) {
            try {
                data = await this.fetchFromBackend(endpoint, options);
                CONFIG.log('✓ Fetched from backend:', endpoint);
            } catch (error) {
                console.warn('Backend API failed, falling back to simulated data:', error.message);
                data = await this.getSimulatedData(endpoint, options);
            }
        } else {
            // Use simulated data
            data = await this.getSimulatedData(endpoint, options);
        }

        // Cache the result
        if (CONFIG.CACHE.ENABLED) {
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
        }

        return data;
    }

    /**
     * Fetch data from real backend API
     */
    async fetchFromBackend(endpoint, options = {}) {
        // Map frontend endpoints to backend API routes
        const endpointMap = {
            '/politicians-investors': '/recommendations/politicians-investors',
            '/catalysts': '/recommendations/catalysts',
            '/biotech': '/recommendations/biotech',
            '/growth-stocks': '/recommendations/growth-stocks',
            '/penny-stocks': '/recommendations/penny-stocks',
            '/short-squeeze': '/recommendations/short-squeeze',
            '/ipo-analysis': '/recommendations/ipo-analysis',
            '/mergers-acquisitions': '/recommendations/mergers-acquisitions',
            '/options-recommendations': '/recommendations/options',
            '/crypto-infrastructure': '/recommendations/crypto-infrastructure',
            '/forex-analysis': '/recommendations/forex',
            '/news-analysis': '/news/analysis',
            '/catalyst-events': '/news/catalysts'
        };

        const backendEndpoint = endpointMap[endpoint] || endpoint;
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        if (options.filter && options.filter !== 'all') {
            queryParams.append('filter', options.filter);
        }
        if (options.limit) {
            queryParams.append('limit', options.limit);
        }
        if (options.offset) {
            queryParams.append('offset', options.offset);
        }

        const queryString = queryParams.toString();
        const fullEndpoint = queryString ? `${backendEndpoint}?${queryString}` : backendEndpoint;

        // Make request using HTTP client
        const response = await httpClient.get(fullEndpoint, {
            requiresAuth: false // Most recommendation endpoints don't require auth
        });

        // Extract data from response
        return response.data || response.recommendations || response;
    }

    /**
     * Get simulated data (fallback)
     */
    async getSimulatedData(endpoint, options) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        
        let data;
        switch(endpoint) {
            case '/politicians-investors':
                data = this.getPoliticiansInvestorsData(options);
                break;
            case '/catalysts':
                data = this.getCatalystsData(options);
                break;
            case '/biotech':
                data = this.getBiotechData(options);
                break;
            case '/growth-stocks':
                data = this.getGrowthStocksData(options);
                break;
            case '/penny-stocks':
                data = this.getPennyStocksData(options);
                break;
            case '/short-squeeze':
                data = this.getShortSqueezeData(options);
                break;
            case '/ipo-analysis':
                data = this.getIPOData(options);
                break;
            case '/mergers-acquisitions':
                data = this.getMergerData(options);
                break;
            case '/options-recommendations':
                data = this.getOptionsData(options);
                break;
            case '/crypto-infrastructure':
                data = this.getCryptoData(options);
                break;
            case '/forex-analysis':
                data = this.getForexData(options);
                break;
            case '/news-analysis':
                data = this.getNewsAnalysisData(options);
                break;
            case '/catalyst-events':
                data = this.getCatalystEventsData(options);
                break;
            default:
                throw new Error(`Unknown endpoint: ${endpoint}`);
        }

        return data;
    }

    /**
     * Clear cache for specific endpoint or all
     */
    clearCache(endpoint = null) {
        if (endpoint) {
            // Clear specific endpoint cache
            for (const [key] of this.cache) {
                if (key.startsWith(endpoint)) {
                    this.cache.delete(key);
                }
            }
        } else {
            // Clear all cache
            this.cache.clear();
        }
    }

    // Politicians & Institutional Investors Data
    getPoliticiansInvestorsData(options = {}) {
        const allTrades = [
            // Politicians
            new InsiderTrade({
                name: 'Nancy Pelosi',
                role: 'Former Speaker of the House',
                category: 'politician',
                symbol: 'NVDA',
                action: 'buy',
                shares: 10000,
                value: 5000000,
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                price: 500.00,
                currentPrice: 505.48,
                successRate: 85,
                avgReturn: 43,
                confidence: 92,
                why: 'Pelosi has a 85% win rate on tech stocks. Her AI chip plays historically return 40%+ within 6 months. NVDA is her largest position.',
                strategy: [
                    'Follow her lead - buy on dips to $500-505',
                    'She typically holds 3-6 months',
                    'Her AI plays average 40% returns',
                    'Set stop loss at $480 (-5%)',
                    'Target: $600 (+20%)'
                ]
            }),
            new InsiderTrade({
                name: 'Dan Crenshaw',
                role: 'U.S. Representative (TX-02)',
                category: 'politician',
                symbol: 'LMT',
                action: 'buy',
                shares: 5000,
                value: 2300000,
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                price: 460.00,
                currentPrice: 462.50,
                successRate: 78,
                avgReturn: 28,
                confidence: 88,
                why: 'Crenshaw sits on Armed Services Committee with advance knowledge of defense budgets. His defense stock picks average 28% returns.',
                strategy: [
                    'Defense spending increasing 15% next year',
                    'He buys before major contract announcements',
                    'Typically holds 6-12 months',
                    'Target: $520 (+12%)',
                    'Stop: $445 (-4%)'
                ]
            }),
            new InsiderTrade({
                name: 'Alexandria Ocasio-Cortez',
                role: 'U.S. Representative (NY-14)',
                category: 'politician',
                symbol: 'TSLA',
                action: 'buy',
                shares: 2000,
                value: 485000,
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                price: 242.50,
                currentPrice: 242.84,
                successRate: 65,
                avgReturn: 22,
                confidence: 75,
                why: 'AOC focuses on green energy and EV stocks. Her clean energy picks have shown consistent returns as policy support increases.',
                strategy: [
                    'Green energy policy tailwinds',
                    'EV adoption accelerating',
                    'Target: $300 (+23%)',
                    'Stop: $220 (-9%)'
                ]
            }),
            // Institutional Investors
            new InsiderTrade({
                name: 'Warren Buffett',
                role: 'Berkshire Hathaway CEO',
                category: 'institution',
                symbol: 'AAPL',
                action: 'buy',
                shares: 5000000,
                value: 900000000,
                date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                price: 178.25,
                currentPrice: 178.25,
                successRate: 72,
                avgReturn: 156,
                confidence: 95,
                why: 'Buffett increased AAPL position by 12%. His long-term holds average 156% returns. When Buffett buys, institutions follow.',
                strategy: [
                    'Buffett plays are 5-10 year holds',
                    'Accumulate on any dip below $175',
                    'He rarely sells - ultimate conviction',
                    'Target: $220+ (24% in 12-18 months)',
                    'This is his largest position'
                ]
            }),
            new InsiderTrade({
                name: 'Cathie Wood',
                role: 'ARK Invest CEO',
                category: 'hedge-fund',
                symbol: 'TSLA',
                action: 'buy',
                shares: 50000,
                value: 12000000,
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                price: 240.00,
                currentPrice: 242.84,
                successRate: 58,
                avgReturn: 85,
                confidence: 78,
                why: 'Cathie bought the dip aggressively. Her TSLA trades are volatile but historically return 85% when right. High risk/reward.',
                strategy: [
                    'Cathie doubles down on conviction',
                    'Her TSLA price target: $500+ (2-3 years)',
                    'Expect 20-30% volatility',
                    'Good entry: $235-245',
                    'Stop: $220 support break'
                ]
            }),
            new InsiderTrade({
                name: 'Michael Burry',
                role: 'Scion Asset Management',
                category: 'hedge-fund',
                symbol: 'GEO',
                action: 'buy',
                shares: 250000,
                value: 3500000,
                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                price: 14.00,
                currentPrice: 15.25,
                successRate: 68,
                avgReturn: 45,
                confidence: 82,
                why: 'Burry is known for contrarian plays. His prison REIT bet suggests he sees value in overlooked sectors.',
                strategy: [
                    'Contrarian value play',
                    'High dividend yield (8%+)',
                    'Target: $18 (+28%)',
                    'Stop: $12 (-14%)'
                ]
            }),
            // Corporate Insiders
            new InsiderTrade({
                name: 'Jensen Huang',
                role: 'NVIDIA CEO',
                category: 'insider',
                symbol: 'NVDA',
                action: 'buy',
                shares: 50000,
                value: 25000000,
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                price: 495.00,
                currentPrice: 505.48,
                successRate: 88,
                avgReturn: 67,
                confidence: 94,
                why: 'CEO buying own stock = ultimate confidence. Jensen knows AI demand better than anyone. His buys precede major announcements.',
                strategy: [
                    'CEO insider buying is strongest signal',
                    'Jensen buying = more growth ahead',
                    'He has perfect information',
                    'Target: $600+ (19%)',
                    'Stop: $480 (-5%)'
                ]
            }),
            new InsiderTrade({
                name: 'Elon Musk',
                role: 'Tesla CEO',
                category: 'insider',
                symbol: 'TSLA',
                action: 'buy',
                shares: 100000,
                value: 24000000,
                date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
                price: 240.00,
                currentPrice: 242.84,
                successRate: 71,
                avgReturn: 125,
                confidence: 82,
                why: 'Elon buying after selling signals he believes stock bottomed. His insider buys historically precede 50%+ rallies.',
                strategy: [
                    'Elon knows production numbers',
                    'He buys before major catalysts',
                    'Volatile but massive upside',
                    'Target: $350+ (44%)',
                    'Stop: $220 (-9%)'
                ]
            })
        ];

        // Filter by category if specified
        if (options.filter && options.filter !== 'all') {
            return allTrades.filter(trade => {
                switch(options.filter) {
                    case 'politicians': return trade.category === 'politician';
                    case 'institutions': return trade.category === 'institution';
                    case 'hedge-funds': return trade.category === 'hedge-fund';
                    case 'insiders': return trade.category === 'insider';
                    default: return true;
                }
            });
        }

        return allTrades;
    }

    // Catalyst Scanner Data
    getCatalystsData(options = {}) {
        const allCatalysts = [
            new Catalyst({
                symbol: 'MRNA',
                company: 'Moderna Inc.',
                type: 'FDA',
                description: 'RSV vaccine approval decision expected. Historical FDA approvals move biotech stocks 20-50%.',
                expectedDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
                probability: 82,
                impactLevel: 'High',
                historicalImpact: 35,
                currentPrice: 85.50,
                targetPrice: 115.00
            }),
            new Catalyst({
                symbol: 'PLTR',
                company: 'Palantir Technologies',
                type: 'contract',
                description: 'Pentagon AI contract announcement expected. Defense contracts typically boost stock 10-25%.',
                expectedDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
                probability: 75,
                impactLevel: 'Medium',
                historicalImpact: 18,
                currentPrice: 16.25,
                targetPrice: 20.00
            }),
            new Catalyst({
                symbol: 'COIN',
                company: 'Coinbase',
                type: 'regulatory',
                description: 'SEC decision on Bitcoin ETF applications. Approval could drive crypto stocks up 30-60%.',
                expectedDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
                probability: 68,
                impactLevel: 'High',
                historicalImpact: 45,
                currentPrice: 95.75,
                targetPrice: 140.00
            }),
            new Catalyst({
                symbol: 'AMZN',
                company: 'Amazon',
                type: 'earnings',
                description: 'Q4 earnings expected to beat on AWS growth. Cloud revenue acceleration could drive 15%+ move.',
                expectedDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
                probability: 78,
                impactLevel: 'Medium',
                historicalImpact: 12,
                currentPrice: 145.25,
                targetPrice: 167.00
            }),
            new Catalyst({
                symbol: 'DIS',
                company: 'Disney',
                type: 'merger',
                description: 'Potential streaming service partnership or acquisition rumors. Media consolidation trend continues.',
                expectedDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                probability: 45,
                impactLevel: 'High',
                historicalImpact: 25,
                currentPrice: 92.50,
                targetPrice: 115.00
            })
        ];

        // Filter by type if specified
        if (options.filter && options.filter !== 'all') {
            return allCatalysts.filter(catalyst => {
                switch(options.filter) {
                    case 'fda': return catalyst.type === 'FDA';
                    case 'earnings': return catalyst.type === 'earnings';
                    case 'mergers': return catalyst.type === 'merger';
                    case 'contracts': return catalyst.type === 'contract';
                    default: return true;
                }
            });
        }

        return allCatalysts;
    }

    // Biotech Breakthrough Data
    getBiotechData(options = {}) {
        const biotechPlays = [
            new BiotechPlay({
                symbol: 'MRNA',
                company: 'Moderna Inc.',
                drugName: 'mRNA-1345',
                indication: 'RSV Prevention',
                trialPhase: 'FDA Review',
                marketSize: 8500000000,
                partnerships: ['Merck', 'GSK Partnership Talks'],
                catalystDates: [new Date(Date.now() + 11 * 24 * 60 * 60 * 1000)],
                currentPrice: 85.50,
                targetPrice: 125.00,
                probability: 82,
                riskLevel: 'Medium'
            }),
            new BiotechPlay({
                symbol: 'BNTX',
                company: 'BioNTech SE',
                drugName: 'BNT116',
                indication: 'Non-Small Cell Lung Cancer',
                trialPhase: 'Phase3',
                marketSize: 15200000000,
                partnerships: ['Pfizer', 'Roche Collaboration'],
                catalystDates: [new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)],
                currentPrice: 95.25,
                targetPrice: 140.00,
                probability: 75,
                riskLevel: 'High'
            }),
            new BiotechPlay({
                symbol: 'GILD',
                company: 'Gilead Sciences',
                drugName: 'Lenacapavir',
                indication: 'HIV Prevention',
                trialPhase: 'Phase3',
                marketSize: 12800000000,
                partnerships: ['Independent Development'],
                catalystDates: [new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)],
                currentPrice: 78.50,
                targetPrice: 95.00,
                probability: 68,
                riskLevel: 'Medium'
            }),
            new BiotechPlay({
                symbol: 'REGN',
                company: 'Regeneron Pharmaceuticals',
                drugName: 'Eylea HD',
                indication: 'Diabetic Macular Edema',
                trialPhase: 'FDA Review',
                marketSize: 6500000000,
                partnerships: ['Bayer Partnership'],
                catalystDates: [new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)],
                currentPrice: 875.25,
                targetPrice: 1050.00,
                probability: 85,
                riskLevel: 'Low'
            })
        ];

        // Filter by phase if specified
        if (options.filter && options.filter !== 'all') {
            return biotechPlays.filter(play => {
                switch(options.filter) {
                    case 'phase3': return play.trialPhase === 'Phase3';
                    case 'fda-review': return play.trialPhase === 'FDA Review';
                    case 'partnerships': return play.partnerships.length > 1;
                    default: return true;
                }
            });
        }

        return biotechPlays;
    }

    // Growth Stocks Data
    getGrowthStocksData(options = {}) {
        const growthStocks = [
            {
                symbol: 'NVDA',
                company: 'NVIDIA Corporation',
                sector: 'AI & Semiconductors',
                currentPrice: 505.48,
                targetPrice: 650.00,
                revenueGrowth: 126,
                marginGrowth: 15.2,
                marketExpansion: 'AI Data Centers',
                competitiveAdvantage: 'CUDA Ecosystem Dominance',
                catalysts: ['AI Chip Demand', 'Data Center Growth', 'Automotive AI'],
                riskLevel: 'Medium',
                confidence: 88,
                timeframe: '12-18 months'
            },
            {
                symbol: 'TSLA',
                company: 'Tesla Inc.',
                sector: 'Electric Vehicles',
                currentPrice: 242.84,
                targetPrice: 350.00,
                revenueGrowth: 47,
                marginGrowth: 8.5,
                marketExpansion: 'Global EV Adoption',
                competitiveAdvantage: 'Vertical Integration & Supercharger Network',
                catalysts: ['Cybertruck Production', 'FSD Beta', 'Energy Storage'],
                riskLevel: 'High',
                confidence: 75,
                timeframe: '18-24 months'
            },
            {
                symbol: 'ENPH',
                company: 'Enphase Energy',
                sector: 'Renewable Energy',
                currentPrice: 125.50,
                targetPrice: 180.00,
                revenueGrowth: 65,
                marginGrowth: 12.8,
                marketExpansion: 'Solar + Storage Market',
                competitiveAdvantage: 'Microinverter Technology Leadership',
                catalysts: ['IRA Tax Credits', 'Battery Storage Growth', 'International Expansion'],
                riskLevel: 'Medium',
                confidence: 82,
                timeframe: '12-18 months'
            },
            {
                symbol: 'PLTR',
                company: 'Palantir Technologies',
                sector: 'AI & Data Analytics',
                currentPrice: 16.25,
                targetPrice: 25.00,
                revenueGrowth: 24,
                marginGrowth: 18.5,
                marketExpansion: 'Enterprise AI Adoption',
                competitiveAdvantage: 'Government Contracts & Data Integration',
                catalysts: ['Commercial Growth', 'AI Platform Expansion', 'Government Contracts'],
                riskLevel: 'High',
                confidence: 70,
                timeframe: '24-36 months'
            },
            {
                symbol: 'RBLX',
                company: 'Roblox Corporation',
                sector: 'Gaming & Metaverse',
                currentPrice: 42.75,
                targetPrice: 65.00,
                revenueGrowth: 38,
                marginGrowth: -5.2,
                marketExpansion: 'Metaverse & User-Generated Content',
                competitiveAdvantage: 'Platform Network Effects',
                catalysts: ['User Growth', 'Monetization Improvements', 'VR Integration'],
                riskLevel: 'High',
                confidence: 65,
                timeframe: '18-24 months'
            }
        ];

        // Filter by sector if specified
        if (options.filter && options.filter !== 'all') {
            return growthStocks.filter(stock => {
                switch(options.filter) {
                    case 'ai': return stock.sector.includes('AI') || stock.sector.includes('Semiconductors');
                    case 'renewable': return stock.sector.includes('Renewable') || stock.sector.includes('Energy');
                    case 'ev': return stock.sector.includes('Electric') || stock.sector.includes('Vehicles');
                    default: return true;
                }
            });
        }

        return growthStocks;
    }

    // Penny Stocks Data
    getPennyStocksData(options = {}) {
        const pennyStocks = [
            {
                symbol: 'SNDL',
                company: 'Sundial Growers Inc.',
                price: 2.45,
                volume: '15.2M',
                change: '+12.5%',
                catalyst: 'Cannabis Legalization Progress',
                fundamentals: 'Debt-Free Balance Sheet',
                riskWarning: 'High Volatility - Cannabis Sector',
                probability: 65,
                targetPrice: 4.50,
                stopLoss: 1.80,
                positionSize: '2-3% max portfolio'
            },
            {
                symbol: 'BBIG',
                company: 'Vinco Ventures Inc.',
                price: 1.85,
                volume: '8.7M',
                change: '+8.2%',
                catalyst: 'Spin-off Distribution Expected',
                fundamentals: 'Digital Media Assets',
                riskWarning: 'Speculative - Execution Risk',
                probability: 58,
                targetPrice: 3.25,
                stopLoss: 1.25,
                positionSize: '1-2% max portfolio'
            },
            {
                symbol: 'PROG',
                company: 'Progenity Inc.',
                price: 3.12,
                volume: '12.1M',
                change: '+15.7%',
                catalyst: 'Biotech Partnership Announced',
                fundamentals: 'Precision Medicine Platform',
                riskWarning: 'Biotech Risk - Clinical Trials',
                probability: 72,
                targetPrice: 5.50,
                stopLoss: 2.25,
                positionSize: '2-3% max portfolio'
            }
        ];

        return pennyStocks;
    }

    // Short Squeeze Data
    getShortSqueezeData(options = {}) {
        const shortSqueezeStocks = [
            {
                symbol: 'GME',
                company: 'GameStop Corp.',
                shortInterest: 18.5,
                daysToCover: 2.8,
                borrowCost: 12.5,
                currentPrice: 18.25,
                gammaLevel: 'High',
                unusualOptions: 'Heavy Call Volume',
                probability: 45,
                targetPrice: 35.00,
                riskLevel: 'Extreme'
            },
            {
                symbol: 'AMC',
                company: 'AMC Entertainment',
                shortInterest: 22.3,
                daysToCover: 3.2,
                borrowCost: 15.8,
                currentPrice: 4.85,
                gammaLevel: 'Medium',
                unusualOptions: 'Put/Call Ratio Declining',
                probability: 38,
                targetPrice: 8.50,
                riskLevel: 'Extreme'
            },
            {
                symbol: 'BBBY',
                company: 'Bed Bath & Beyond',
                shortInterest: 35.2,
                daysToCover: 5.1,
                borrowCost: 25.5,
                currentPrice: 0.85,
                gammaLevel: 'Low',
                unusualOptions: 'Minimal Activity',
                probability: 25,
                targetPrice: 2.00,
                riskLevel: 'Extreme'
            }
        ];

        return shortSqueezeStocks;
    }

    // IPO Analysis Data
    getIPOData(options = {}) {
        const ipoData = [
            {
                symbol: 'ARM',
                company: 'Arm Holdings plc',
                status: 'recent',
                ipoDate: new Date('2023-09-14'),
                ipoPrice: 51.00,
                currentPrice: 68.25,
                lockupExpiry: new Date('2024-03-14'),
                marketCap: 68500000000,
                revenue: 2680000000,
                revenueGrowth: 0.5,
                sector: 'Semiconductors',
                fundamentals: 'Leading CPU architecture, AI chip designs',
                risks: ['Geopolitical tensions', 'Competition from x86'],
                catalysts: ['AI chip adoption', 'Smartphone recovery'],
                targetPrice: 85.00,
                confidence: 78
            },
            {
                symbol: 'KKVR',
                company: 'KKR Real Estate Finance Trust',
                status: 'upcoming',
                ipoDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                expectedPrice: 18.50,
                priceRange: '16.00-21.00',
                marketCap: 2400000000,
                revenue: 185000000,
                revenueGrowth: 12.5,
                sector: 'Real Estate',
                fundamentals: 'Commercial real estate financing',
                risks: ['Interest rate sensitivity', 'Real estate cycle'],
                catalysts: ['Rate cuts', 'Commercial RE recovery'],
                targetPrice: 24.00,
                confidence: 65
            },
            {
                symbol: 'SOLV',
                company: 'Solventum Corporation',
                status: 'recent',
                ipoDate: new Date('2024-04-01'),
                ipoPrice: 24.00,
                currentPrice: 28.75,
                lockupExpiry: new Date('2024-10-01'),
                marketCap: 15200000000,
                revenue: 8200000000,
                revenueGrowth: 8.2,
                sector: 'Healthcare',
                fundamentals: '3M spinoff - medical technology',
                risks: ['Litigation overhang', 'Integration challenges'],
                catalysts: ['Legal resolution', 'Operational improvements'],
                targetPrice: 35.00,
                confidence: 72
            }
        ];

        // Filter by status if specified
        if (options.filter && options.filter !== 'all') {
            return ipoData.filter(ipo => {
                switch(options.filter) {
                    case 'upcoming': return ipo.status === 'upcoming';
                    case 'recent': return ipo.status === 'recent';
                    case 'lockup-expiring': 
                        return ipo.lockupExpiry && new Date() > new Date(ipo.lockupExpiry.getTime() - 30 * 24 * 60 * 60 * 1000);
                    default: return true;
                }
            });
        }

        return ipoData;
    }

    // Mergers & Acquisitions Data
    getMergerData(options = {}) {
        const maData = [
            {
                symbol: 'VMW',
                company: 'VMware Inc.',
                type: 'merger',
                acquirer: 'Broadcom Inc.',
                dealValue: 61000000000,
                dealPrice: 142.50,
                currentPrice: 141.25,
                spread: -0.88,
                expectedClose: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                probability: 85,
                regulatoryStatus: 'Pending EU approval',
                risks: ['Regulatory rejection', 'Financing issues'],
                arbitrageReturn: 0.88,
                annualizedReturn: 7.2
            },
            {
                symbol: 'ATVI',
                company: 'Activision Blizzard',
                type: 'merger',
                acquirer: 'Microsoft Corporation',
                dealValue: 68700000000,
                dealPrice: 95.00,
                currentPrice: 94.85,
                spread: -0.16,
                expectedClose: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                probability: 92,
                regulatoryStatus: 'Final approvals pending',
                risks: ['Last-minute regulatory issues'],
                arbitrageReturn: 0.16,
                annualizedReturn: 1.9
            },
            {
                symbol: 'NVAX',
                company: 'Novavax Inc.',
                type: 'split',
                splitRatio: '1:10',
                exDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
                currentPrice: 8.45,
                preSplitTarget: 12.00,
                postSplitTarget: 1.20,
                catalyst: 'Improve share liquidity',
                strategy: 'Buy before split for momentum'
            },
            {
                symbol: 'KHC',
                company: 'Kraft Heinz Company',
                type: 'dividend',
                dividendType: 'Special',
                amount: 2.50,
                exDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
                currentPrice: 34.25,
                yield: 7.3,
                catalyst: 'Asset sale proceeds distribution'
            }
        ];

        // Filter by type if specified
        if (options.filter && options.filter !== 'all') {
            return maData.filter(deal => {
                switch(options.filter) {
                    case 'mergers': return deal.type === 'merger';
                    case 'splits': return deal.type === 'split';
                    case 'spinoffs': return deal.type === 'spinoff';
                    case 'dividends': return deal.type === 'dividend';
                    default: return true;
                }
            });
        }

        return maData;
    }

    // Crypto Infrastructure Data
    getCryptoData(options = {}) {
        const cryptoRecommendations = [
            // Layer 1 Protocols
            new CryptoRecommendation({
                symbol: 'ETH',
                project: 'Ethereum',
                assetType: 'crypto',
                action: 'buy',
                sector: 'Layer1',
                entryPrice: 2250.00,
                targetPrice: 3200.00,
                stopLoss: 1950.00,
                confidence: 88,
                riskLevel: 'Medium',
                timeframe: '6-12 months',
                catalyst: 'Ethereum 2.0 Staking Rewards & DeFi Growth',
                description: 'Leading smart contract platform with strongest developer ecosystem and institutional adoption',
                reasoning: [
                    'Dominant DeFi ecosystem with $50B+ TVL',
                    'Ethereum 2.0 staking providing 4-6% yield',
                    'Layer 2 scaling solutions reducing gas fees',
                    'Institutional adoption accelerating'
                ],
                marketCap: 270000000000,
                totalSupply: 120500000,
                networkMetrics: {
                    activeUsers: 400000,
                    transactionVolume: 1200000,
                    developerActivity: 2800,
                    tvl: 52000000000
                },
                upcomingEvents: [
                    'Ethereum ETF Approval Expected',
                    'Dencun Upgrade Implementation',
                    'Layer 2 Integration Improvements'
                ],
                category: 'infrastructure-protocol'
            }),
            new CryptoRecommendation({
                symbol: 'SOL',
                project: 'Solana',
                assetType: 'crypto',
                action: 'buy',
                sector: 'Layer1',
                entryPrice: 95.50,
                targetPrice: 180.00,
                stopLoss: 75.00,
                confidence: 82,
                riskLevel: 'High',
                timeframe: '9-15 months',
                catalyst: 'High-Performance Blockchain for Web3 Applications',
                description: 'Ultra-fast blockchain designed for high-frequency applications and institutional use',
                reasoning: [
                    'Fastest blockchain with 65,000+ TPS capability',
                    'Growing ecosystem of DeFi and NFT projects',
                    'Low transaction costs attracting developers',
                    'Strong institutional backing from Jump Crypto'
                ],
                marketCap: 42000000000,
                totalSupply: 548000000,
                networkMetrics: {
                    activeUsers: 150000,
                    transactionVolume: 2800000,
                    developerActivity: 1200,
                    tvl: 1800000000
                },
                upcomingEvents: [
                    'Firedancer Validator Client Launch',
                    'Mobile Saga Phone Integration',
                    'Enterprise Partnership Announcements'
                ],
                category: 'infrastructure-protocol'
            }),
            // IoT Networks
            new CryptoRecommendation({
                symbol: 'IOTX',
                project: 'IoTeX',
                assetType: 'crypto',
                action: 'buy',
                sector: 'IoT',
                entryPrice: 0.045,
                targetPrice: 0.125,
                stopLoss: 0.032,
                confidence: 75,
                riskLevel: 'High',
                timeframe: '12-18 months',
                catalyst: 'IoT Device Integration & Real-World Asset Tokenization',
                description: 'Blockchain platform connecting IoT devices with real-world data and machine-to-machine economy',
                reasoning: [
                    'First blockchain designed specifically for IoT devices',
                    'Partnerships with major hardware manufacturers',
                    'Real-world utility with device identity and data verification',
                    'Growing ecosystem of connected devices'
                ],
                marketCap: 425000000,
                totalSupply: 9500000000,
                networkMetrics: {
                    activeUsers: 25000,
                    transactionVolume: 180000,
                    developerActivity: 180,
                    connectedDevices: 850000
                },
                upcomingEvents: [
                    'MachineFi Lab Expansion',
                    'W3bstream Mainnet Launch',
                    'Enterprise IoT Partnerships'
                ],
                category: 'iot-infrastructure'
            }),
            new CryptoRecommendation({
                symbol: 'IOTA',
                project: 'IOTA',
                assetType: 'crypto',
                action: 'buy',
                sector: 'IoT',
                entryPrice: 0.28,
                targetPrice: 0.65,
                stopLoss: 0.20,
                confidence: 70,
                riskLevel: 'High',
                timeframe: '15-24 months',
                catalyst: 'Tangle Technology for Feeless IoT Transactions',
                description: 'Distributed ledger technology designed for the Internet of Things with zero transaction fees',
                reasoning: [
                    'Unique Tangle architecture eliminates mining fees',
                    'Partnerships with major automotive and industrial companies',
                    'Focus on supply chain and industrial IoT applications',
                    'Shimmer network providing smart contract capabilities'
                ],
                marketCap: 780000000,
                totalSupply: 2779530283,
                networkMetrics: {
                    activeUsers: 18000,
                    transactionVolume: 95000,
                    developerActivity: 220,
                    connectedDevices: 320000
                },
                upcomingEvents: [
                    'IOTA 2.0 Coordicide Completion',
                    'Assembly Smart Contract Platform',
                    'Industrial Partnership Announcements'
                ],
                category: 'iot-infrastructure'
            }),
            // Data Storage Protocols
            new CryptoRecommendation({
                symbol: 'FIL',
                project: 'Filecoin',
                assetType: 'crypto',
                action: 'buy',
                sector: 'Storage',
                entryPrice: 5.25,
                targetPrice: 12.50,
                stopLoss: 3.80,
                confidence: 78,
                riskLevel: 'Medium',
                timeframe: '12-18 months',
                catalyst: 'Decentralized Storage Network for Web3 Infrastructure',
                description: 'Decentralized storage network that turns cloud storage into an algorithmic market',
                reasoning: [
                    'Growing demand for decentralized data storage',
                    'Enterprise adoption for backup and archival',
                    'Integration with major cloud providers',
                    'Strong network effects as storage capacity grows'
                ],
                marketCap: 2100000000,
                totalSupply: 400000000,
                networkMetrics: {
                    activeUsers: 8500,
                    transactionVolume: 45000,
                    developerActivity: 380,
                    storageCapacity: 18500000000 // 18.5 EiB
                },
                upcomingEvents: [
                    'FVM (Filecoin Virtual Machine) Expansion',
                    'Enterprise Storage Partnerships',
                    'Web3 Infrastructure Integration'
                ],
                category: 'storage-infrastructure'
            }),
            new CryptoRecommendation({
                symbol: 'AR',
                project: 'Arweave',
                assetType: 'crypto',
                action: 'buy',
                sector: 'Storage',
                entryPrice: 8.75,
                targetPrice: 22.00,
                stopLoss: 6.50,
                confidence: 72,
                riskLevel: 'Medium',
                timeframe: '18-24 months',
                catalyst: 'Permanent Data Storage for Web3 Applications',
                description: 'Permanent, decentralized storage network designed to preserve data forever',
                reasoning: [
                    'Unique permanent storage model with one-time payment',
                    'Growing adoption for NFT metadata and dApp storage',
                    'SmartWeave smart contracts gaining traction',
                    'Partnerships with major Web3 projects'
                ],
                marketCap: 570000000,
                totalSupply: 65454185,
                networkMetrics: {
                    activeUsers: 12000,
                    transactionVolume: 28000,
                    developerActivity: 280,
                    dataStored: 125000000000 // 125 TB
                },
                upcomingEvents: [
                    'AO Computer Network Launch',
                    'Permanent Storage Partnerships',
                    'Web3 Infrastructure Adoption'
                ],
                category: 'storage-infrastructure'
            }),
            // Computing Power Networks
            new CryptoRecommendation({
                symbol: 'RLC',
                project: 'iExec RLC',
                assetType: 'crypto',
                action: 'buy',
                sector: 'Computing',
                entryPrice: 1.85,
                targetPrice: 4.20,
                stopLoss: 1.35,
                confidence: 68,
                riskLevel: 'High',
                timeframe: '15-24 months',
                catalyst: 'Decentralized Cloud Computing for AI and Big Data',
                description: 'Decentralized marketplace for computing resources, enabling distributed cloud computing',
                reasoning: [
                    'Growing demand for decentralized AI computation',
                    'Partnerships with major cloud computing providers',
                    'Confidential computing capabilities',
                    'Integration with enterprise blockchain solutions'
                ],
                marketCap: 160000000,
                totalSupply: 86999785,
                networkMetrics: {
                    activeUsers: 3200,
                    transactionVolume: 8500,
                    developerActivity: 95,
                    computingPower: 2800 // Computing units
                },
                upcomingEvents: [
                    'iExec V8 Platform Upgrade',
                    'Enterprise Computing Partnerships',
                    'AI Workload Integration'
                ],
                category: 'computing-infrastructure'
            }),
            new CryptoRecommendation({
                symbol: 'RNDR',
                project: 'Render Network',
                assetType: 'crypto',
                action: 'buy',
                sector: 'Computing',
                entryPrice: 2.45,
                targetPrice: 6.80,
                stopLoss: 1.75,
                confidence: 85,
                riskLevel: 'Medium',
                timeframe: '12-18 months',
                catalyst: 'GPU Rendering Network for AI and Metaverse Applications',
                description: 'Distributed GPU rendering network powering the next generation of media and AI applications',
                reasoning: [
                    'Explosive growth in AI and 3D rendering demand',
                    'Partnerships with major studios and creators',
                    'Migration to Solana blockchain improving efficiency',
                    'Strong network effects as GPU supply grows'
                ],
                marketCap: 950000000,
                totalSupply: 388000000,
                networkMetrics: {
                    activeUsers: 15000,
                    transactionVolume: 35000,
                    developerActivity: 180,
                    gpuNodes: 45000
                },
                upcomingEvents: [
                    'Solana Migration Completion',
                    'AI Workload Expansion',
                    'Enterprise Rendering Partnerships'
                ],
                category: 'computing-infrastructure'
            }),
            // Layer 2 Scaling Solutions
            new CryptoRecommendation({
                symbol: 'MATIC',
                project: 'Polygon',
                assetType: 'crypto',
                action: 'buy',
                sector: 'Layer2',
                entryPrice: 0.85,
                targetPrice: 1.65,
                stopLoss: 0.65,
                confidence: 80,
                riskLevel: 'Medium',
                timeframe: '9-15 months',
                catalyst: 'Ethereum Scaling Solution with Enterprise Adoption',
                description: 'Leading Ethereum Layer 2 scaling solution with zkEVM technology',
                reasoning: [
                    'Dominant Layer 2 solution with highest TVL',
                    'Major enterprise partnerships (Disney, Starbucks)',
                    'zkEVM technology providing enhanced security',
                    'Strong developer ecosystem and dApp adoption'
                ],
                marketCap: 8500000000,
                totalSupply: 10000000000,
                networkMetrics: {
                    activeUsers: 180000,
                    transactionVolume: 3200000,
                    developerActivity: 850,
                    tvl: 1200000000
                },
                upcomingEvents: [
                    'Polygon 2.0 Upgrade',
                    'Enterprise Partnership Expansion',
                    'zkEVM Mainnet Optimization'
                ],
                category: 'scaling-infrastructure'
            }),
            new CryptoRecommendation({
                symbol: 'OP',
                project: 'Optimism',
                assetType: 'crypto',
                action: 'buy',
                sector: 'Layer2',
                entryPrice: 2.15,
                targetPrice: 4.50,
                stopLoss: 1.65,
                confidence: 76,
                riskLevel: 'Medium',
                timeframe: '12-18 months',
                catalyst: 'Optimistic Rollup Technology for Ethereum Scaling',
                description: 'Ethereum Layer 2 solution using optimistic rollup technology for faster, cheaper transactions',
                reasoning: [
                    'Leading optimistic rollup with strong security model',
                    'Growing ecosystem of DeFi and NFT projects',
                    'Retroactive public goods funding model',
                    'Integration with major Ethereum applications'
                ],
                marketCap: 2200000000,
                totalSupply: 4294967296,
                networkMetrics: {
                    activeUsers: 85000,
                    transactionVolume: 850000,
                    developerActivity: 420,
                    tvl: 650000000
                },
                upcomingEvents: [
                    'Bedrock Upgrade Implementation',
                    'Superchain Ecosystem Expansion',
                    'Cross-chain Interoperability'
                ],
                category: 'scaling-infrastructure'
            })
        ];

        // Filter by sector if specified
        if (options.filter && options.filter !== 'all') {
            return cryptoRecommendations.filter(crypto => {
                switch(options.filter) {
                    case 'layer1': return crypto.sector === 'Layer1';
                    case 'iot': return crypto.sector === 'IoT';
                    case 'storage': return crypto.sector === 'Storage';
                    case 'computing': return crypto.sector === 'Computing';
                    case 'layer2': return crypto.sector === 'Layer2';
                    default: return true;
                }
            });
        }

        return cryptoRecommendations;
    }

    // Options Recommendations Data
    getOptionsData(options = {}) {
        const optionsRecommendations = [
            // Call Options
            new OptionsRecommendation({
                symbol: 'NVDA',
                assetType: 'option',
                action: 'buy',
                optionType: 'call',
                strike: 520,
                expiration: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                entryPrice: 15.50,
                targetPrice: 35.00,
                stopLoss: 8.00,
                confidence: 85,
                riskLevel: 'Medium',
                timeframe: '30-45 days',
                catalyst: 'AI Chip Demand Surge',
                description: 'NVDA call options positioned for AI earnings beat and guidance raise',
                reasoning: [
                    'Strong AI data center demand',
                    'Earnings expected to beat by 15%+',
                    'High institutional buying pressure'
                ],
                impliedVolatility: 45.2,
                timeDecay: -0.08,
                delta: 0.65,
                gamma: 0.03,
                expectedMove: 8.5,
                category: 'earnings-play'
            }),
            new OptionsRecommendation({
                symbol: 'TSLA',
                assetType: 'option',
                action: 'buy',
                optionType: 'call',
                strike: 260,
                expiration: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                entryPrice: 12.25,
                targetPrice: 28.00,
                stopLoss: 6.00,
                confidence: 78,
                riskLevel: 'High',
                timeframe: '45-60 days',
                catalyst: 'Cybertruck Production Ramp',
                description: 'TSLA calls betting on production milestone and delivery beat',
                reasoning: [
                    'Cybertruck production scaling up',
                    'Q4 delivery numbers expected strong',
                    'FSD beta monetization potential'
                ],
                impliedVolatility: 52.8,
                timeDecay: -0.06,
                delta: 0.58,
                gamma: 0.025,
                expectedMove: 12.3,
                category: 'catalyst-play'
            }),
            new OptionsRecommendation({
                symbol: 'AAPL',
                assetType: 'option',
                action: 'buy',
                optionType: 'call',
                strike: 185,
                expiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                entryPrice: 8.75,
                targetPrice: 18.00,
                stopLoss: 4.50,
                confidence: 82,
                riskLevel: 'Low',
                timeframe: '20-30 days',
                catalyst: 'iPhone 16 Cycle Strength',
                description: 'AAPL calls on iPhone upgrade cycle and services growth',
                reasoning: [
                    'Strong iPhone 16 demand in China',
                    'Services revenue accelerating',
                    'Vision Pro adoption improving'
                ],
                impliedVolatility: 28.5,
                timeDecay: -0.12,
                delta: 0.72,
                gamma: 0.04,
                expectedMove: 6.2,
                category: 'earnings-play'
            }),
            // Put Options
            new OptionsRecommendation({
                symbol: 'SPY',
                assetType: 'option',
                action: 'buy',
                optionType: 'put',
                strike: 420,
                expiration: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
                entryPrice: 6.25,
                targetPrice: 15.00,
                stopLoss: 3.00,
                confidence: 70,
                riskLevel: 'Medium',
                timeframe: '25-35 days',
                catalyst: 'Market Correction Risk',
                description: 'SPY puts as hedge against potential market pullback',
                reasoning: [
                    'Overbought technical conditions',
                    'Fed policy uncertainty',
                    'Geopolitical tensions rising'
                ],
                impliedVolatility: 18.2,
                timeDecay: -0.09,
                delta: -0.35,
                gamma: 0.02,
                expectedMove: 4.8,
                category: 'hedge-play'
            }),
            new OptionsRecommendation({
                symbol: 'QQQ',
                assetType: 'option',
                action: 'buy',
                optionType: 'put',
                strike: 350,
                expiration: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
                entryPrice: 8.50,
                targetPrice: 20.00,
                stopLoss: 4.25,
                confidence: 68,
                riskLevel: 'Medium',
                timeframe: '30-40 days',
                catalyst: 'Tech Sector Rotation',
                description: 'QQQ puts betting on tech sector weakness and rotation to value',
                reasoning: [
                    'High tech valuations vulnerable',
                    'Rising interest rate concerns',
                    'Profit-taking in mega-cap tech'
                ],
                impliedVolatility: 22.8,
                timeDecay: -0.07,
                delta: -0.42,
                gamma: 0.025,
                expectedMove: 7.5,
                category: 'sector-rotation'
            }),
            // Complex Strategies
            new OptionsRecommendation({
                symbol: 'AMZN',
                assetType: 'option',
                action: 'buy',
                optionType: 'straddle',
                strike: 145,
                expiration: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
                entryPrice: 18.50,
                targetPrice: 35.00,
                stopLoss: 9.25,
                confidence: 75,
                riskLevel: 'High',
                timeframe: '15-25 days',
                catalyst: 'Earnings Volatility Play',
                description: 'AMZN straddle to profit from large earnings-driven move in either direction',
                reasoning: [
                    'High implied volatility crush risk',
                    'AWS growth uncertainty',
                    'Holiday season results critical'
                ],
                impliedVolatility: 38.5,
                timeDecay: -0.15,
                delta: 0.0,
                gamma: 0.06,
                expectedMove: 15.2,
                category: 'volatility-play'
            }),
            new OptionsRecommendation({
                symbol: 'MSFT',
                assetType: 'option',
                action: 'buy',
                optionType: 'strangle',
                strike: 405, // This represents the center strike
                expiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                entryPrice: 14.75,
                targetPrice: 28.00,
                stopLoss: 7.50,
                confidence: 72,
                riskLevel: 'High',
                timeframe: '20-30 days',
                catalyst: 'AI Platform Announcement',
                description: 'MSFT strangle (390P/420C) betting on significant move from AI developments',
                reasoning: [
                    'Major AI platform updates expected',
                    'Cloud competition intensifying',
                    'Copilot monetization acceleration'
                ],
                impliedVolatility: 32.8,
                timeDecay: -0.11,
                delta: 0.0,
                gamma: 0.04,
                expectedMove: 12.8,
                category: 'event-driven'
            }),
            new OptionsRecommendation({
                symbol: 'META',
                assetType: 'option',
                action: 'buy',
                optionType: 'spread',
                strike: 320, // Bull call spread 320/330
                expiration: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
                entryPrice: 4.25,
                targetPrice: 8.50,
                stopLoss: 2.00,
                confidence: 80,
                riskLevel: 'Low',
                timeframe: '25-35 days',
                catalyst: 'VR/AR Revenue Growth',
                description: 'META bull call spread (320/330) for controlled upside exposure',
                reasoning: [
                    'Reality Labs showing improvement',
                    'Ad revenue recovery continuing',
                    'AI integration driving engagement'
                ],
                impliedVolatility: 35.2,
                timeDecay: -0.08,
                delta: 0.45,
                gamma: 0.03,
                expectedMove: 9.8,
                category: 'defined-risk'
            })
        ];

        // Filter by strategy type if specified
        if (options.filter && options.filter !== 'all') {
            return optionsRecommendations.filter(rec => {
                switch(options.filter) {
                    case 'calls': return rec.optionType === 'call';
                    case 'puts': return rec.optionType === 'put';
                    case 'complex': return ['straddle', 'strangle', 'spread'].includes(rec.optionType);
                    default: return true;
                }
            });
        }

        return optionsRecommendations;
    }

    // News Analysis Data
    getNewsAnalysisData(options = {}) {
        const newsItems = [
            new NewsAnalysis({
                headline: 'FDA Approves Moderna\'s RSV Vaccine for Adults 60+',
                source: 'Reuters',
                publishedAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
                content: 'The U.S. Food and Drug Administration approved Moderna\'s respiratory syncytial virus (RSV) vaccine for adults aged 60 and older, marking the company\'s second approved product after its COVID-19 vaccine.',
                sentiment: 0.8,
                impactScore: 9,
                affectedSymbols: ['MRNA', 'PFE', 'GSK'],
                category: 'fda',
                priceImpactPrediction: 15.5,
                confidence: 0.92
            }),
            new NewsAnalysis({
                headline: 'Palantir Wins $250M Pentagon AI Contract Extension',
                source: 'Defense News',
                publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                content: 'Palantir Technologies secured a $250 million contract extension with the Pentagon for AI-powered data analytics, expanding its role in military intelligence operations.',
                sentiment: 0.7,
                impactScore: 7,
                affectedSymbols: ['PLTR', 'SNOW', 'CRM'],
                category: 'contract',
                priceImpactPrediction: 8.2,
                confidence: 0.85
            }),
            new NewsAnalysis({
                headline: 'Tesla Cybertruck Production Hits 1,000 Units Per Week Milestone',
                source: 'Electrek',
                publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
                content: 'Tesla has reached a significant production milestone for the Cybertruck, manufacturing over 1,000 units per week at its Austin Gigafactory, ahead of schedule.',
                sentiment: 0.6,
                impactScore: 6,
                affectedSymbols: ['TSLA', 'F', 'GM', 'RIVN'],
                category: 'earnings',
                priceImpactPrediction: 5.8,
                confidence: 0.78
            }),
            new NewsAnalysis({
                headline: 'Microsoft and OpenAI Partnership Under DOJ Antitrust Investigation',
                source: 'Wall Street Journal',
                publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
                content: 'The Department of Justice has opened an antitrust investigation into Microsoft\'s partnership with OpenAI, examining whether the deal gives Microsoft unfair competitive advantages in AI.',
                sentiment: -0.5,
                impactScore: 8,
                affectedSymbols: ['MSFT', 'GOOGL', 'AMZN', 'META'],
                category: 'regulatory',
                priceImpactPrediction: -4.2,
                confidence: 0.82
            }),
            new NewsAnalysis({
                headline: 'Coinbase Receives Preliminary Approval for Bitcoin ETF Custody',
                source: 'CoinDesk',
                publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
                content: 'Coinbase has received preliminary approval from regulators to serve as custodian for multiple Bitcoin ETF applications, positioning it as a key infrastructure provider.',
                sentiment: 0.9,
                impactScore: 9,
                affectedSymbols: ['COIN', 'MSTR', 'RIOT', 'MARA'],
                category: 'regulatory',
                priceImpactPrediction: 12.8,
                confidence: 0.88
            }),
            new NewsAnalysis({
                headline: 'NVIDIA Partners with Mercedes-Benz for Next-Gen Autonomous Driving',
                source: 'TechCrunch',
                publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
                content: 'NVIDIA announced a multi-year partnership with Mercedes-Benz to develop next-generation autonomous driving systems using NVIDIA\'s Drive platform and AI chips.',
                sentiment: 0.7,
                impactScore: 7,
                affectedSymbols: ['NVDA', 'TSLA', 'MBLY'],
                category: 'partnership',
                priceImpactPrediction: 6.5,
                confidence: 0.80
            }),
            new NewsAnalysis({
                headline: 'Amazon Web Services Announces Major Price Cuts for AI Computing',
                source: 'AWS Blog',
                publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
                content: 'AWS announced significant price reductions for AI and machine learning computing services, cutting costs by up to 40% for GPU instances and AI model training.',
                sentiment: 0.4,
                impactScore: 6,
                affectedSymbols: ['AMZN', 'MSFT', 'GOOGL', 'NVDA'],
                category: 'earnings',
                priceImpactPrediction: 3.2,
                confidence: 0.75
            }),
            new NewsAnalysis({
                headline: 'Pfizer Discontinues COVID-19 Vaccine Development Program',
                source: 'BioPharma Dive',
                publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                content: 'Pfizer announced it will discontinue further development of its next-generation COVID-19 vaccine, citing reduced market demand and shifting focus to other therapeutic areas.',
                sentiment: -0.3,
                impactScore: 5,
                affectedSymbols: ['PFE', 'MRNA', 'BNTX'],
                category: 'clinical',
                priceImpactPrediction: -2.8,
                confidence: 0.70
            }),
            new NewsAnalysis({
                headline: 'Apple Vision Pro Sales Exceed Expectations in Q4',
                source: 'Apple Insider',
                publishedAt: new Date(Date.now() - 30 * 60 * 60 * 1000), // 30 hours ago
                content: 'Apple Vision Pro sales have exceeded internal expectations in Q4, with strong enterprise adoption driving demand beyond initial consumer interest.',
                sentiment: 0.6,
                impactScore: 6,
                affectedSymbols: ['AAPL', 'META', 'GOOGL'],
                category: 'earnings',
                priceImpactPrediction: 4.5,
                confidence: 0.77
            }),
            new NewsAnalysis({
                headline: 'Broadcom-VMware Merger Faces Final Regulatory Hurdle in EU',
                source: 'Reuters',
                publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000), // 36 hours ago
                content: 'The European Commission is conducting a final review of Broadcom\'s $61 billion acquisition of VMware, with a decision expected within two weeks.',
                sentiment: 0.2,
                impactScore: 8,
                affectedSymbols: ['AVGO', 'VMW'],
                category: 'merger',
                priceImpactPrediction: 2.1,
                confidence: 0.65
            })
        ];

        // Filter by category if specified
        if (options.filter && options.filter !== 'all') {
            return newsItems.filter(news => {
                switch(options.filter) {
                    case 'fda': return news.category === 'fda';
                    case 'earnings': return news.category === 'earnings';
                    case 'mergers': return news.category === 'merger';
                    case 'contracts': return news.category === 'contract';
                    case 'regulatory': return news.category === 'regulatory';
                    case 'breaking': return news.isBreaking();
                    default: return true;
                }
            });
        }

        // Sort by most recent first
        return newsItems.sort((a, b) => b.publishedAt - a.publishedAt);
    }

    // Catalyst Events Data (Enhanced version of existing getCatalystsData)
    getCatalystEventsData(options = {}) {
        const catalystEvents = [
            new Catalyst({
                symbol: 'MRNA',
                company: 'Moderna Inc.',
                type: 'FDA',
                description: 'FDA decision on next-generation COVID-19 vaccine expected. Approval could expand market share and boost revenue guidance for 2024.',
                expectedDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                probability: 78,
                impactLevel: 'High',
                historicalImpact: 25,
                currentPrice: 85.50,
                targetPrice: 115.00,
                bearCasePrice: 72.00,
                riskFactors: ['Regulatory rejection', 'Market saturation', 'Competition from Pfizer'],
                confidence: 0.82,
                source: 'FDA Calendar'
            }),
            new Catalyst({
                symbol: 'PLTR',
                company: 'Palantir Technologies',
                type: 'contract',
                description: 'Major government contract announcement expected from Department of Defense. Contract value estimated at $500M+ over 3 years.',
                expectedDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
                probability: 85,
                impactLevel: 'Medium',
                historicalImpact: 18,
                currentPrice: 16.25,
                targetPrice: 22.00,
                bearCasePrice: 14.50,
                riskFactors: ['Budget constraints', 'Political opposition', 'Competitor wins'],
                confidence: 0.88,
                source: 'Defense Industry Reports'
            }),
            new Catalyst({
                symbol: 'COIN',
                company: 'Coinbase Global',
                type: 'regulatory',
                description: 'SEC decision on Bitcoin ETF applications where Coinbase serves as custodian. Approval could drive significant trading volume.',
                expectedDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
                probability: 72,
                impactLevel: 'High',
                historicalImpact: 35,
                currentPrice: 95.75,
                targetPrice: 140.00,
                bearCasePrice: 78.00,
                riskFactors: ['SEC rejection', 'Regulatory uncertainty', 'Market volatility'],
                confidence: 0.75,
                source: 'SEC Filings'
            }),
            new Catalyst({
                symbol: 'TSLA',
                company: 'Tesla Inc.',
                type: 'earnings',
                description: 'Q4 earnings report with focus on Cybertruck production numbers and FSD revenue recognition. Delivery guidance critical.',
                expectedDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                probability: 68,
                impactLevel: 'High',
                historicalImpact: 22,
                currentPrice: 242.84,
                targetPrice: 295.00,
                bearCasePrice: 205.00,
                riskFactors: ['Production delays', 'Margin compression', 'Competition'],
                confidence: 0.70,
                source: 'Earnings Calendar'
            }),
            new Catalyst({
                symbol: 'NVDA',
                company: 'NVIDIA Corporation',
                type: 'earnings',
                description: 'Q4 earnings with data center revenue guidance. AI chip demand and China export restrictions impact expected.',
                expectedDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
                probability: 82,
                impactLevel: 'High',
                historicalImpact: 28,
                currentPrice: 505.48,
                targetPrice: 625.00,
                bearCasePrice: 445.00,
                riskFactors: ['China restrictions', 'Competition from AMD', 'Demand slowdown'],
                confidence: 0.85,
                source: 'Earnings Calendar'
            }),
            new Catalyst({
                symbol: 'AMZN',
                company: 'Amazon.com Inc.',
                type: 'earnings',
                description: 'Q4 earnings focusing on AWS growth acceleration and holiday season retail performance. Cloud margin expansion key.',
                expectedDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
                probability: 75,
                impactLevel: 'Medium',
                historicalImpact: 15,
                currentPrice: 145.25,
                targetPrice: 167.00,
                bearCasePrice: 128.00,
                riskFactors: ['AWS competition', 'Retail margin pressure', 'Economic slowdown'],
                confidence: 0.78,
                source: 'Earnings Calendar'
            }),
            new Catalyst({
                symbol: 'BNTX',
                company: 'BioNTech SE',
                type: 'clinical',
                description: 'Phase 3 trial results for cancer immunotherapy BNT116. Positive results could validate platform beyond COVID vaccines.',
                expectedDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
                probability: 65,
                impactLevel: 'High',
                historicalImpact: 40,
                currentPrice: 95.25,
                targetPrice: 145.00,
                bearCasePrice: 75.00,
                riskFactors: ['Trial failure', 'Safety concerns', 'Regulatory delays'],
                confidence: 0.68,
                source: 'Clinical Trials Database'
            }),
            new Catalyst({
                symbol: 'DIS',
                company: 'The Walt Disney Company',
                type: 'merger',
                description: 'Potential streaming partnership or acquisition announcement. Media consolidation rumors intensifying with activist pressure.',
                expectedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                probability: 45,
                impactLevel: 'High',
                historicalImpact: 25,
                currentPrice: 92.50,
                targetPrice: 115.00,
                bearCasePrice: 85.00,
                riskFactors: ['Deal failure', 'Regulatory opposition', 'Valuation concerns'],
                confidence: 0.50,
                source: 'Industry Reports'
            }),
            new Catalyst({
                symbol: 'GILD',
                company: 'Gilead Sciences',
                type: 'FDA',
                description: 'FDA approval decision for HIV prevention drug lenacapavir. Breakthrough therapy designation suggests high approval probability.',
                expectedDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
                probability: 88,
                impactLevel: 'Medium',
                historicalImpact: 20,
                currentPrice: 78.50,
                targetPrice: 95.00,
                bearCasePrice: 72.00,
                riskFactors: ['Safety concerns', 'Pricing pressure', 'Competition'],
                confidence: 0.90,
                source: 'FDA Calendar'
            }),
            new Catalyst({
                symbol: 'MSFT',
                company: 'Microsoft Corporation',
                type: 'partnership',
                description: 'Major AI platform announcement expected at developer conference. OpenAI integration and enterprise AI tools focus.',
                expectedDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
                probability: 80,
                impactLevel: 'Medium',
                historicalImpact: 12,
                currentPrice: 405.50,
                targetPrice: 450.00,
                bearCasePrice: 385.00,
                riskFactors: ['Antitrust concerns', 'Competition from Google', 'Execution risk'],
                confidence: 0.82,
                source: 'Company Calendar'
            })
        ];

        // Filter by type if specified
        if (options.filter && options.filter !== 'all') {
            return catalystEvents.filter(catalyst => {
                switch(options.filter) {
                    case 'fda': return catalyst.type === 'FDA';
                    case 'earnings': return catalyst.type === 'earnings';
                    case 'mergers': return catalyst.type === 'merger';
                    case 'contracts': return catalyst.type === 'contract';
                    case 'regulatory': return catalyst.type === 'regulatory';
                    case 'clinical': return catalyst.type === 'clinical';
                    case 'urgent': return catalyst.getDaysUntil() <= 7;
                    default: return true;
                }
            });
        }

        // Sort by expected date (soonest first)
        return catalystEvents.sort((a, b) => a.expectedDate - b.expectedDate);
    }

    clearCache() {
        this.cache.clear();
    }

    getCacheSize() {
        return this.cache.size;
    }
}

// Create global API instance
const API = new APIEndpoints();

// Export for use in other files
    // Forex Analysis Data
    getForexData(options = {}) {
        const forexRecommendations = [
            // Major Currency Pairs
            new ForexRecommendation({
                symbol: 'EUR/USD',
                baseCurrency: 'EUR',
                quoteCurrency: 'USD',
                assetType: 'forex',
                action: 'buy',
                entryPrice: 1.0850,
                targetPrice: 1.1200,
                stopLoss: 1.0720,
                confidence: 82,
                riskLevel: 'Medium',
                timeframe: '2-4 weeks',
                catalyst: 'ECB Rate Hike Expectations & USD Weakness',
                description: 'EUR strength expected on hawkish ECB policy divergence from Fed dovish pivot',
                reasoning: [
                    'ECB maintaining hawkish stance while Fed signals pause',
                    'Eurozone inflation remaining elevated above target',
                    'Technical breakout above 1.0800 resistance level',
                    'USD showing signs of weakness on recession fears'
                ],
                interestRateDiff: -1.75, // EUR rate - USD rate
                economicEvents: [
                    new EconomicEvent({
                        country: 'Eurozone',
                        event: 'ECB Interest Rate Decision',
                        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        impact: 'High',
                        forecast: 4.50,
                        previous: 4.25
                    }),
                    new EconomicEvent({
                        country: 'United States',
                        event: 'Federal Reserve Meeting',
                        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                        impact: 'High',
                        forecast: 5.25,
                        previous: 5.50
                    }),
                    new EconomicEvent({
                        country: 'Eurozone',
                        event: 'CPI Inflation Rate',
                        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                        impact: 'Medium',
                        forecast: 2.8,
                        previous: 2.9
                    })
                ],
                technicalLevels: {
                    support: [1.0720, 1.0650, 1.0580],
                    resistance: [1.0920, 1.1050, 1.1200],
                    trend: 'bullish'
                },
                category: 'major-pair'
            }),
            new ForexRecommendation({
                symbol: 'GBP/USD',
                baseCurrency: 'GBP',
                quoteCurrency: 'USD',
                assetType: 'forex',
                action: 'sell',
                entryPrice: 1.2650,
                targetPrice: 1.2200,
                stopLoss: 1.2780,
                confidence: 78,
                riskLevel: 'Medium',
                timeframe: '3-5 weeks',
                catalyst: 'UK Economic Slowdown & Political Uncertainty',
                description: 'GBP weakness expected on deteriorating UK economic fundamentals and political instability',
                reasoning: [
                    'UK GDP growth slowing significantly',
                    'Bank of England dovish pivot on recession concerns',
                    'Political uncertainty affecting investor confidence',
                    'Brexit-related trade issues persisting'
                ],
                interestRateDiff: -0.25,
                economicEvents: [
                    new EconomicEvent({
                        country: 'United Kingdom',
                        event: 'Bank of England Rate Decision',
                        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                        impact: 'High',
                        forecast: 5.00,
                        previous: 5.25
                    }),
                    new EconomicEvent({
                        country: 'United Kingdom',
                        event: 'GDP Growth Rate',
                        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                        impact: 'High',
                        forecast: -0.2,
                        previous: 0.1
                    }),
                    new EconomicEvent({
                        country: 'United Kingdom',
                        event: 'Employment Change',
                        date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
                        impact: 'Medium',
                        forecast: -15000,
                        previous: 8000
                    })
                ],
                technicalLevels: {
                    support: [1.2200, 1.2100, 1.2000],
                    resistance: [1.2780, 1.2850, 1.2950],
                    trend: 'bearish'
                },
                category: 'major-pair'
            }),
            new ForexRecommendation({
                symbol: 'USD/JPY',
                baseCurrency: 'USD',
                quoteCurrency: 'JPY',
                assetType: 'forex',
                action: 'sell',
                entryPrice: 149.50,
                targetPrice: 145.00,
                stopLoss: 151.20,
                confidence: 85,
                riskLevel: 'High',
                timeframe: '1-3 weeks',
                catalyst: 'Bank of Japan Intervention Risk & Fed Dovish Pivot',
                description: 'USD/JPY vulnerable to BoJ intervention and Fed policy shift reducing rate differential',
                reasoning: [
                    'BoJ intervention risk increasing near 150 level',
                    'Fed signaling potential rate cuts reducing yield advantage',
                    'Technical resistance at 150 psychological level',
                    'Risk-off sentiment supporting JPY safe haven demand'
                ],
                interestRateDiff: 5.25,
                economicEvents: [
                    new EconomicEvent({
                        country: 'Japan',
                        event: 'Bank of Japan Policy Meeting',
                        date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
                        impact: 'High',
                        forecast: -0.10,
                        previous: -0.10
                    }),
                    new EconomicEvent({
                        country: 'United States',
                        event: 'Non-Farm Payrolls',
                        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
                        impact: 'High',
                        forecast: 180000,
                        previous: 150000
                    }),
                    new EconomicEvent({
                        country: 'Japan',
                        event: 'CPI Inflation Rate',
                        date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
                        impact: 'Medium',
                        forecast: 3.2,
                        previous: 3.0
                    })
                ],
                technicalLevels: {
                    support: [145.00, 143.50, 142.00],
                    resistance: [151.20, 152.00, 153.50],
                    trend: 'bearish'
                },
                category: 'major-pair'
            }),
            // Exotic Currency Pairs
            new ForexRecommendation({
                symbol: 'USD/TRY',
                baseCurrency: 'USD',
                quoteCurrency: 'TRY',
                assetType: 'forex',
                action: 'buy',
                entryPrice: 28.50,
                targetPrice: 32.00,
                stopLoss: 27.20,
                confidence: 70,
                riskLevel: 'High',
                timeframe: '4-8 weeks',
                catalyst: 'Turkish Lira Weakness on Political & Economic Instability',
                description: 'TRY expected to weaken further on unorthodox monetary policy and geopolitical tensions',
                reasoning: [
                    'Central Bank maintaining negative real interest rates',
                    'High inflation eroding currency purchasing power',
                    'Political tensions affecting investor confidence',
                    'Current account deficit widening'
                ],
                interestRateDiff: -10.25,
                economicEvents: [
                    new EconomicEvent({
                        country: 'Turkey',
                        event: 'Central Bank Rate Decision',
                        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                        impact: 'High',
                        forecast: 35.00,
                        previous: 35.00
                    }),
                    new EconomicEvent({
                        country: 'Turkey',
                        event: 'Inflation Rate',
                        date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
                        impact: 'High',
                        forecast: 65.0,
                        previous: 61.5
                    })
                ],
                technicalLevels: {
                    support: [27.20, 26.50, 25.80],
                    resistance: [30.00, 32.00, 34.50],
                    trend: 'bullish'
                },
                category: 'exotic-pair'
            }),
            new ForexRecommendation({
                symbol: 'USD/ZAR',
                baseCurrency: 'USD',
                quoteCurrency: 'ZAR',
                assetType: 'forex',
                action: 'sell',
                entryPrice: 18.75,
                targetPrice: 17.20,
                stopLoss: 19.50,
                confidence: 75,
                riskLevel: 'High',
                timeframe: '3-6 weeks',
                catalyst: 'South African Rand Strength on Commodity Prices & Political Stability',
                description: 'ZAR expected to strengthen on higher commodity prices and improved political outlook',
                reasoning: [
                    'Gold and platinum prices supporting ZAR',
                    'Political stability improving investor sentiment',
                    'South African Reserve Bank maintaining hawkish stance',
                    'Emerging market currencies showing resilience'
                ],
                interestRateDiff: -2.75,
                economicEvents: [
                    new EconomicEvent({
                        country: 'South Africa',
                        event: 'SARB Interest Rate Decision',
                        date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
                        impact: 'High',
                        forecast: 8.25,
                        previous: 8.25
                    }),
                    new EconomicEvent({
                        country: 'South Africa',
                        event: 'GDP Growth Rate',
                        date: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
                        impact: 'Medium',
                        forecast: 1.2,
                        previous: 0.8
                    })
                ],
                technicalLevels: {
                    support: [17.20, 16.80, 16.40],
                    resistance: [19.50, 20.00, 20.80],
                    trend: 'bearish'
                },
                category: 'exotic-pair'
            }),
            // Commodity Currency Pairs
            new ForexRecommendation({
                symbol: 'AUD/USD',
                baseCurrency: 'AUD',
                quoteCurrency: 'USD',
                assetType: 'forex',
                action: 'buy',
                entryPrice: 0.6650,
                targetPrice: 0.7100,
                stopLoss: 0.6480,
                confidence: 80,
                riskLevel: 'Medium',
                timeframe: '4-6 weeks',
                catalyst: 'Australian Dollar Strength on China Recovery & Commodity Demand',
                description: 'AUD expected to strengthen on Chinese economic recovery boosting commodity demand',
                reasoning: [
                    'China reopening driving iron ore and coal demand',
                    'Reserve Bank of Australia maintaining hawkish stance',
                    'Australian employment data showing strength',
                    'Risk-on sentiment supporting commodity currencies'
                ],
                interestRateDiff: -1.00,
                economicEvents: [
                    new EconomicEvent({
                        country: 'Australia',
                        event: 'RBA Interest Rate Decision',
                        date: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
                        impact: 'High',
                        forecast: 4.35,
                        previous: 4.35
                    }),
                    new EconomicEvent({
                        country: 'Australia',
                        event: 'Employment Change',
                        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        impact: 'Medium',
                        forecast: 25000,
                        previous: 64900
                    }),
                    new EconomicEvent({
                        country: 'China',
                        event: 'Manufacturing PMI',
                        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                        impact: 'Medium',
                        forecast: 50.2,
                        previous: 49.8
                    })
                ],
                technicalLevels: {
                    support: [0.6480, 0.6420, 0.6350],
                    resistance: [0.6850, 0.7100, 0.7250],
                    trend: 'bullish'
                },
                category: 'commodity-currency'
            }),
            new ForexRecommendation({
                symbol: 'USD/CAD',
                baseCurrency: 'USD',
                quoteCurrency: 'CAD',
                assetType: 'forex',
                action: 'sell',
                entryPrice: 1.3650,
                targetPrice: 1.3200,
                stopLoss: 1.3850,
                confidence: 77,
                riskLevel: 'Medium',
                timeframe: '3-5 weeks',
                catalyst: 'Canadian Dollar Strength on Oil Prices & BoC Hawkish Policy',
                description: 'CAD expected to strengthen on higher oil prices and Bank of Canada maintaining rates',
                reasoning: [
                    'WTI crude oil prices above $80 supporting CAD',
                    'Bank of Canada likely to maintain current rates longer',
                    'Canadian employment data showing resilience',
                    'USMCA trade agreement providing stability'
                ],
                interestRateDiff: 0.25,
                economicEvents: [
                    new EconomicEvent({
                        country: 'Canada',
                        event: 'Bank of Canada Rate Decision',
                        date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
                        impact: 'High',
                        forecast: 5.00,
                        previous: 5.00
                    }),
                    new EconomicEvent({
                        country: 'Canada',
                        event: 'Employment Change',
                        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
                        impact: 'Medium',
                        forecast: 22000,
                        previous: 17500
                    }),
                    new EconomicEvent({
                        country: 'Global',
                        event: 'WTI Crude Oil Inventory',
                        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
                        impact: 'Medium',
                        forecast: -2.5,
                        previous: -1.8
                    })
                ],
                technicalLevels: {
                    support: [1.3200, 1.3100, 1.3000],
                    resistance: [1.3850, 1.3950, 1.4100],
                    trend: 'bearish'
                },
                category: 'commodity-currency'
            }),
            new ForexRecommendation({
                symbol: 'NZD/USD',
                baseCurrency: 'NZD',
                quoteCurrency: 'USD',
                assetType: 'forex',
                action: 'buy',
                entryPrice: 0.6050,
                targetPrice: 0.6400,
                stopLoss: 0.5920,
                confidence: 73,
                riskLevel: 'Medium',
                timeframe: '5-8 weeks',
                catalyst: 'New Zealand Dollar Recovery on RBNZ Policy & Dairy Prices',
                description: 'NZD expected to recover on RBNZ maintaining rates and improving dairy export prices',
                reasoning: [
                    'Reserve Bank of New Zealand maintaining hawkish stance',
                    'Dairy prices showing signs of recovery',
                    'Tourism sector recovering post-pandemic',
                    'Risk appetite improving for carry trades'
                ],
                interestRateDiff: 0.25,
                economicEvents: [
                    new EconomicEvent({
                        country: 'New Zealand',
                        event: 'RBNZ Interest Rate Decision',
                        date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
                        impact: 'High',
                        forecast: 5.50,
                        previous: 5.50
                    }),
                    new EconomicEvent({
                        country: 'New Zealand',
                        event: 'GlobalDairyTrade Price Index',
                        date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
                        impact: 'Medium',
                        forecast: 2.5,
                        previous: -1.2
                    })
                ],
                technicalLevels: {
                    support: [0.5920, 0.5850, 0.5780],
                    resistance: [0.6200, 0.6400, 0.6550],
                    trend: 'bullish'
                },
                category: 'commodity-currency'
            })
        ];

        // Filter by category if specified
        if (options.filter && options.filter !== 'all') {
            return forexRecommendations.filter(rec => {
                switch(options.filter) {
                    case 'major': return rec.category === 'major-pair';
                    case 'exotic': return rec.category === 'exotic-pair';
                    case 'commodities': return rec.category === 'commodity-currency';
                    default: return true;
                }
            });
        }

        return forexRecommendations;
    }}


// Create singleton instance
const API = new APIEndpoints();

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIEndpoints, API };
}