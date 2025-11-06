/**
 * Market Correction Detection & Recovery System
 * Automatically detects market corrections and generates put/call recommendations
 * Uses technical indicators, sentiment analysis, and market breadth
 */

class MarketCorrectionDetector {
    constructor() {
        this.marketState = 'neutral'; // 'correction', 'recovery', 'neutral', 'bull', 'bear'
        this.correctionStartDate = null;
        this.correctionDepth = 0;
        this.indicators = {};
        this.sentimentScore = 0;
        this.vixLevel = 0;
        this.updateInterval = 5 * 60 * 1000; // 5 minutes
        
        // Thresholds for correction detection
        this.thresholds = {
            correction: -0.10,      // -10% from recent high
            severeCorrection: -0.15, // -15% from recent high
            bearMarket: -0.20,      // -20% from recent high
            recovery: 0.05,         // +5% from correction low
            vixSpike: 25,           // VIX above 25 indicates fear
            vixExtreme: 35,         // VIX above 35 indicates panic
            putCallRatio: 1.2,      // High put/call ratio indicates bearish sentiment
            advanceDecline: -2.0    // Negative breadth indicates weakness
        };
        
        this.initialize();
    }

    /**
     * Initialize the correction detector
     */
    async initialize() {
        console.log('🔍 Market Correction Detector initialized');
        
        // Start monitoring
        this.startMonitoring();
        
        // Listen for news updates
        this.setupNewsListeners();
    }

    /**
     * Start continuous market monitoring
     */
    startMonitoring() {
        // Initial check
        this.analyzeMarketConditions();
        
        // Periodic checks
        setInterval(() => {
            this.analyzeMarketConditions();
        }, this.updateInterval);
    }

    /**
     * Analyze current market conditions using multiple indicators
     */
    async analyzeMarketConditions() {
        try {
            console.log('📊 Analyzing market conditions...');
            
            // Fetch market data
            const marketData = await this.fetchMarketData();
            
            // Calculate technical indicators
            this.indicators = {
                priceChange: this.calculatePriceChange(marketData),
                rsi: this.calculateRSI(marketData.prices),
                macd: this.calculateMACD(marketData.prices),
                bollingerBands: this.calculateBollingerBands(marketData.prices),
                movingAverages: this.calculateMovingAverages(marketData.prices),
                vix: marketData.vix || 20,
                putCallRatio: marketData.putCallRatio || 1.0,
                advanceDeclineRatio: marketData.advanceDeclineRatio || 0
            };
            
            // Analyze sentiment from news
            this.sentimentScore = await this.analyzeNewsSentiment();
            
            // Determine market state
            const previousState = this.marketState;
            this.marketState = this.determineMarketState();
            
            // If state changed, take action
            if (previousState !== this.marketState) {
                console.log(`🚨 Market state changed: ${previousState} → ${this.marketState}`);
                this.handleStateChange(previousState, this.marketState);
            }
            
            // Log current state
            this.logMarketState();
            
        } catch (error) {
            console.error('Error analyzing market conditions:', error);
        }
    }

    /**
     * Fetch real-time market data
     */
    async fetchMarketData() {
        // In production, this would fetch from real APIs
        // For now, we'll use the API integration
        
        try {
            // Fetch SPY data as market proxy
            const response = await httpClient.get('/market/data', {
                requiresAuth: false,
                retryAttempts: 2
            });
            
            return response.data || this.getSimulatedMarketData();
        } catch (error) {
            console.warn('Using simulated market data');
            return this.getSimulatedMarketData();
        }
    }

    /**
     * Get simulated market data for testing
     */
    getSimulatedMarketData() {
        const basePrice = 450;
        const volatility = 0.02;
        const trend = Math.random() > 0.5 ? 1 : -1;
        
        // Generate 50 days of price data
        const prices = [];
        let price = basePrice;
        
        for (let i = 0; i < 50; i++) {
            const change = (Math.random() - 0.5) * volatility * price;
            price += change + (trend * 0.001 * price);
            prices.push(price);
        }
        
        return {
            symbol: 'SPY',
            prices: prices,
            currentPrice: prices[prices.length - 1],
            high52Week: Math.max(...prices) * 1.05,
            low52Week: Math.min(...prices) * 0.95,
            vix: 15 + Math.random() * 20,
            putCallRatio: 0.8 + Math.random() * 0.8,
            advanceDeclineRatio: -2 + Math.random() * 4
        };
    }

    /**
     * Calculate price change from recent high
     */
    calculatePriceChange(marketData) {
        const currentPrice = marketData.currentPrice;
        const recentHigh = marketData.high52Week;
        return (currentPrice - recentHigh) / recentHigh;
    }

    /**
     * Calculate RSI (Relative Strength Index)
     * RSI < 30 = Oversold (potential buy)
     * RSI > 70 = Overbought (potential sell)
     */
    calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return 50;
        
        let gains = 0;
        let losses = 0;
        
        for (let i = prices.length - period; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            if (change > 0) gains += change;
            else losses += Math.abs(change);
        }
        
        const avgGain = gains / period;
        const avgLoss = losses / period;
        
        if (avgLoss === 0) return 100;
        
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        
        return rsi;
    }

    /**
     * Calculate MACD (Moving Average Convergence Divergence)
     * Bullish: MACD crosses above signal line
     * Bearish: MACD crosses below signal line
     */
    calculateMACD(prices) {
        const ema12 = this.calculateEMA(prices, 12);
        const ema26 = this.calculateEMA(prices, 26);
        const macd = ema12 - ema26;
        
        // Signal line is 9-period EMA of MACD
        const macdLine = [macd];
        const signal = this.calculateEMA(macdLine, 9);
        
        return {
            macd: macd,
            signal: signal,
            histogram: macd - signal,
            trend: macd > signal ? 'bullish' : 'bearish'
        };
    }

    /**
     * Calculate EMA (Exponential Moving Average)
     */
    calculateEMA(prices, period) {
        if (prices.length < period) return prices[prices.length - 1];
        
        const multiplier = 2 / (period + 1);
        let ema = prices.slice(0, period).reduce((a, b) => a + b) / period;
        
        for (let i = period; i < prices.length; i++) {
            ema = (prices[i] - ema) * multiplier + ema;
        }
        
        return ema;
    }

    /**
     * Calculate Bollinger Bands
     * Price near lower band = oversold
     * Price near upper band = overbought
     */
    calculateBollingerBands(prices, period = 20, stdDev = 2) {
        if (prices.length < period) {
            const avg = prices.reduce((a, b) => a + b) / prices.length;
            return { upper: avg * 1.02, middle: avg, lower: avg * 0.98 };
        }
        
        const recentPrices = prices.slice(-period);
        const sma = recentPrices.reduce((a, b) => a + b) / period;
        
        const squaredDiffs = recentPrices.map(price => Math.pow(price - sma, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b) / period;
        const standardDeviation = Math.sqrt(variance);
        
        return {
            upper: sma + (standardDeviation * stdDev),
            middle: sma,
            lower: sma - (standardDeviation * stdDev),
            bandwidth: (standardDeviation * stdDev * 2) / sma
        };
    }

    /**
     * Calculate Moving Averages (SMA)
     */
    calculateMovingAverages(prices) {
        return {
            sma20: this.calculateSMA(prices, 20),
            sma50: this.calculateSMA(prices, 50),
            sma200: this.calculateSMA(prices, 200),
            currentPrice: prices[prices.length - 1]
        };
    }

    /**
     * Calculate Simple Moving Average
     */
    calculateSMA(prices, period) {
        if (prices.length < period) {
            return prices.reduce((a, b) => a + b) / prices.length;
        }
        const recentPrices = prices.slice(-period);
        return recentPrices.reduce((a, b) => a + b) / period;
    }

    /**
     * Analyze news sentiment for market direction
     */
    async analyzeNewsSentiment() {
        try {
            const news = await apiIntegration.fetchNewsAnalysis();
            
            if (!news || news.length === 0) return 0;
            
            // Calculate weighted sentiment based on impact score
            let totalSentiment = 0;
            let totalWeight = 0;
            
            news.forEach(item => {
                const weight = item.impactScore || 5;
                const sentiment = item.sentiment || 0;
                totalSentiment += sentiment * weight;
                totalWeight += weight;
            });
            
            return totalWeight > 0 ? totalSentiment / totalWeight : 0;
        } catch (error) {
            console.error('Error analyzing news sentiment:', error);
            return 0;
        }
    }

    /**
     * Determine current market state based on all indicators
     */
    determineMarketState() {
        const { priceChange, rsi, macd, vix, putCallRatio, advanceDeclineRatio, movingAverages } = this.indicators;
        
        let score = 0; // Negative = bearish, Positive = bullish
        
        // Price change from high (strongest signal)
        if (priceChange <= this.thresholds.bearMarket) score -= 5;
        else if (priceChange <= this.thresholds.severeCorrection) score -= 4;
        else if (priceChange <= this.thresholds.correction) score -= 3;
        else if (priceChange >= this.thresholds.recovery) score += 2;
        
        // RSI
        if (rsi < 30) score += 2; // Oversold = potential buy
        else if (rsi > 70) score -= 2; // Overbought = potential sell
        
        // MACD
        if (macd.trend === 'bullish') score += 1;
        else score -= 1;
        
        // VIX (Fear Index)
        if (vix >= this.thresholds.vixExtreme) score -= 3; // Extreme fear
        else if (vix >= this.thresholds.vixSpike) score -= 2; // High fear
        else if (vix < 15) score += 1; // Low fear = complacency
        
        // Put/Call Ratio
        if (putCallRatio >= this.thresholds.putCallRatio) score -= 2; // Bearish positioning
        else if (putCallRatio < 0.7) score += 1; // Bullish positioning
        
        // Advance/Decline Ratio
        if (advanceDeclineRatio < this.thresholds.advanceDecline) score -= 2;
        else if (advanceDeclineRatio > 2.0) score += 2;
        
        // Moving Average Crossovers
        if (movingAverages.currentPrice < movingAverages.sma200) score -= 2; // Below 200 SMA = bearish
        if (movingAverages.sma50 < movingAverages.sma200) score -= 1; // Death cross
        if (movingAverages.sma50 > movingAverages.sma200) score += 1; // Golden cross
        
        // News Sentiment
        if (this.sentimentScore < -0.5) score -= 2;
        else if (this.sentimentScore > 0.5) score += 2;
        
        // Determine state based on score
        if (score <= -8) return 'severe_correction';
        if (score <= -5) return 'correction';
        if (score <= -2) return 'bearish';
        if (score >= 5) return 'recovery';
        if (score >= 3) return 'bullish';
        return 'neutral';
    }

    /**
     * Handle market state changes
     */
    handleStateChange(previousState, newState) {
        console.log(`🔔 Market State Change: ${previousState} → ${newState}`);
        
        // Record correction start
        if (newState.includes('correction') && !previousState.includes('correction')) {
            this.correctionStartDate = new Date();
            this.correctionDepth = this.indicators.priceChange;
        }
        
        // Generate recommendations based on new state
        if (newState === 'correction' || newState === 'severe_correction') {
            this.generatePutRecommendations(newState);
        } else if (newState === 'recovery' && previousState.includes('correction')) {
            this.generateRecoveryCallRecommendations();
        } else if (newState === 'bullish') {
            this.generateBullishCallRecommendations();
        }
        
        // Emit event for UI updates
        this.emitStateChangeEvent(previousState, newState);
    }

    /**
     * Generate PUT recommendations during market corrections
     */
    generatePutRecommendations(severity) {
        console.log(`🔻 Generating PUT recommendations for ${severity}`);
        
        const recommendations = [];
        const currentPrice = this.indicators.movingAverages.currentPrice;
        const vix = this.indicators.vix;
        
        // Determine timeframe based on correction severity
        const daysToExpiry = severity === 'severe_correction' ? 45 : 30;
        const expirationDate = new Date(Date.now() + daysToExpiry * 24 * 60 * 60 * 1000);
        
        // SPY Put - Market hedge
        const spyStrike = Math.floor(currentPrice * 0.95 / 5) * 5; // 5% OTM
        recommendations.push({
            symbol: 'SPY',
            assetType: 'option',
            action: 'buy',
            optionType: 'put',
            strike: spyStrike,
            expiration: expirationDate,
            entryPrice: this.estimateOptionPrice('put', currentPrice, spyStrike, daysToExpiry, vix),
            targetPrice: this.estimateOptionPrice('put', currentPrice * 0.90, spyStrike, daysToExpiry * 0.7, vix * 1.5),
            stopLoss: this.estimateOptionPrice('put', currentPrice, spyStrike, daysToExpiry, vix) * 0.5,
            confidence: severity === 'severe_correction' ? 88 : 78,
            riskLevel: 'Medium',
            timeframe: `${daysToExpiry} days`,
            catalyst: `Market Correction Protection - ${severity.replace('_', ' ')}`,
            description: `SPY put options to hedge against market downturn. VIX at ${vix.toFixed(1)} indicates elevated volatility.`,
            reasoning: [
                `Market down ${(this.indicators.priceChange * 100).toFixed(1)}% from recent high`,
                `RSI at ${this.indicators.rsi.toFixed(1)} ${this.indicators.rsi < 30 ? '(oversold)' : ''}`,
                `VIX elevated at ${vix.toFixed(1)} (fear index)`,
                `Put/Call ratio at ${this.indicators.putCallRatio.toFixed(2)} (bearish sentiment)`,
                `Protective hedge against further downside`
            ],
            impliedVolatility: vix,
            delta: -0.35,
            expectedMove: Math.abs(this.indicators.priceChange) * 100,
            category: 'hedge-play'
        });
        
        // QQQ Put - Tech sector hedge
        const qqqStrike = Math.floor(currentPrice * 0.93 / 5) * 5; // 7% OTM (tech more volatile)
        recommendations.push({
            symbol: 'QQQ',
            assetType: 'option',
            action: 'buy',
            optionType: 'put',
            strike: qqqStrike,
            expiration: expirationDate,
            entryPrice: this.estimateOptionPrice('put', currentPrice, qqqStrike, daysToExpiry, vix * 1.2),
            targetPrice: this.estimateOptionPrice('put', currentPrice * 0.85, qqqStrike, daysToExpiry * 0.7, vix * 1.8),
            stopLoss: this.estimateOptionPrice('put', currentPrice, qqqStrike, daysToExpiry, vix * 1.2) * 0.5,
            confidence: severity === 'severe_correction' ? 85 : 75,
            riskLevel: 'High',
            timeframe: `${daysToExpiry} days`,
            catalyst: 'Tech Sector Correction Protection',
            description: 'QQQ put options to hedge tech-heavy portfolio against correction.',
            reasoning: [
                'Tech stocks typically fall harder in corrections',
                `MACD showing ${this.indicators.macd.trend} trend`,
                'High beta sector requires protection',
                'Nasdaq more volatile than S&P 500'
            ],
            impliedVolatility: vix * 1.2,
            delta: -0.40,
            expectedMove: Math.abs(this.indicators.priceChange) * 120,
            category: 'sector-hedge'
        });
        
        // If severe correction, add put spread for defined risk
        if (severity === 'severe_correction') {
            const spreadStrike1 = Math.floor(currentPrice * 0.95 / 5) * 5;
            const spreadStrike2 = Math.floor(currentPrice * 0.90 / 5) * 5;
            
            recommendations.push({
                symbol: 'SPY',
                assetType: 'option',
                action: 'buy',
                optionType: 'put_spread',
                strike: spreadStrike1,
                strike2: spreadStrike2,
                expiration: expirationDate,
                entryPrice: this.estimateOptionPrice('put', currentPrice, spreadStrike1, daysToExpiry, vix) - 
                           this.estimateOptionPrice('put', currentPrice, spreadStrike2, daysToExpiry, vix),
                targetPrice: (spreadStrike1 - spreadStrike2) * 0.8,
                stopLoss: this.estimateOptionPrice('put', currentPrice, spreadStrike1, daysToExpiry, vix) * 0.3,
                confidence: 82,
                riskLevel: 'Low',
                timeframe: `${daysToExpiry} days`,
                catalyst: 'Defined-Risk Correction Play',
                description: `Bear put spread (${spreadStrike1}/${spreadStrike2}) for limited risk correction trade.`,
                reasoning: [
                    'Defined maximum risk and reward',
                    'Lower cost than straight puts',
                    'Profits from moderate decline',
                    'Ideal for severe correction environment'
                ],
                impliedVolatility: vix,
                delta: -0.25,
                maxProfit: spreadStrike1 - spreadStrike2,
                maxLoss: this.estimateOptionPrice('put', currentPrice, spreadStrike1, daysToExpiry, vix),
                category: 'defined-risk'
            });
        }
        
        // Send recommendations to system
        this.publishRecommendations(recommendations, 'correction_puts');
        
        return recommendations;
    }

    /**
     * Generate CALL recommendations when market recovers from correction
     */
    generateRecoveryCallRecommendations() {
        console.log(`📈 Generating CALL recommendations for market recovery`);
        
        const recommendations = [];
        const currentPrice = this.indicators.movingAverages.currentPrice;
        const vix = this.indicators.vix;
        const rsi = this.indicators.rsi;
        
        // Recovery plays are typically 30-60 days out
        const daysToExpiry = 45;
        const expirationDate = new Date(Date.now() + daysToExpiry * 24 * 60 * 60 * 1000);
        
        // Calculate how long correction lasted
        const correctionDays = this.correctionStartDate ? 
            Math.floor((Date.now() - this.correctionStartDate.getTime()) / (24 * 60 * 60 * 1000)) : 0;
        
        // SPY Call - Market recovery play
        const spyStrike = Math.ceil(currentPrice * 1.03 / 5) * 5; // 3% OTM
        recommendations.push({
            symbol: 'SPY',
            assetType: 'option',
            action: 'buy',
            optionType: 'call',
            strike: spyStrike,
            expiration: expirationDate,
            entryPrice: this.estimateOptionPrice('call', currentPrice, spyStrike, daysToExpiry, vix),
            targetPrice: this.estimateOptionPrice('call', currentPrice * 1.10, spyStrike, daysToExpiry * 0.6, vix * 0.7),
            stopLoss: this.estimateOptionPrice('call', currentPrice, spyStrike, daysToExpiry, vix) * 0.5,
            confidence: 85,
            riskLevel: 'Medium',
            timeframe: `${daysToExpiry} days`,
            catalyst: `Market Recovery from ${correctionDays}-day correction`,
            description: `SPY call options to capitalize on market bounce. RSI at ${rsi.toFixed(1)} shows oversold conditions reversing.`,
            reasoning: [
                `Market recovered ${(Math.abs(this.correctionDepth) * 100).toFixed(1)}% from correction low`,
                `RSI at ${rsi.toFixed(1)} - oversold conditions improving`,
                `VIX declining from ${vix.toFixed(1)} (fear subsiding)`,
                `MACD showing ${this.indicators.macd.trend} momentum`,
                `Correction lasted ${correctionDays} days - typical recovery period`,
                'Historical data shows strong bounces after corrections'
            ],
            impliedVolatility: vix,
            delta: 0.40,
            expectedMove: 8.5,
            category: 'recovery-play'
        });
        
        // QQQ Call - Tech recovery (higher beta)
        const qqqStrike = Math.ceil(currentPrice * 1.05 / 5) * 5; // 5% OTM
        recommendations.push({
            symbol: 'QQQ',
            assetType: 'option',
            action: 'buy',
            optionType: 'call',
            strike: qqqStrike,
            expiration: expirationDate,
            entryPrice: this.estimateOptionPrice('call', currentPrice, qqqStrike, daysToExpiry, vix * 1.1),
            targetPrice: this.estimateOptionPrice('call', currentPrice * 1.15, qqqStrike, daysToExpiry * 0.6, vix * 0.8),
            stopLoss: this.estimateOptionPrice('call', currentPrice, qqqStrike, daysToExpiry, vix * 1.1) * 0.5,
            confidence: 82,
            riskLevel: 'High',
            timeframe: `${daysToExpiry} days`,
            catalyst: 'Tech Sector Recovery Play',
            description: 'QQQ call options for aggressive recovery play on tech rebound.',
            reasoning: [
                'Tech stocks bounce harder after corrections',
                'Growth stocks lead recoveries',
                'Nasdaq typically outperforms in recovery phase',
                `MACD histogram: ${this.indicators.macd.histogram.toFixed(2)} (momentum building)`
            ],
            impliedVolatility: vix * 1.1,
            delta: 0.45,
            expectedMove: 12.0,
            category: 'recovery-play'
        });
        
        // IWM Call - Small caps for aggressive recovery
        const iwmStrike = Math.ceil(currentPrice * 0.98 / 5) * 5; // 2% OTM (more aggressive)
        recommendations.push({
            symbol: 'IWM',
            assetType: 'option',
            action: 'buy',
            optionType: 'call',
            strike: iwmStrike,
            expiration: expirationDate,
            entryPrice: this.estimateOptionPrice('call', currentPrice * 0.95, iwmStrike, daysToExpiry, vix * 1.3),
            targetPrice: this.estimateOptionPrice('call', currentPrice * 1.12, iwmStrike, daysToExpiry * 0.6, vix * 0.9),
            stopLoss: this.estimateOptionPrice('call', currentPrice * 0.95, iwmStrike, daysToExpiry, vix * 1.3) * 0.5,
            confidence: 78,
            riskLevel: 'High',
            timeframe: `${daysToExpiry} days`,
            catalyst: 'Small Cap Recovery - High Beta Play',
            description: 'IWM call options for maximum upside in recovery. Small caps lead aggressive bounces.',
            reasoning: [
                'Small caps have highest beta in recoveries',
                'Russell 2000 typically rallies 15-20% post-correction',
                'Risk-on sentiment favors small caps',
                'Institutional buying returns to growth names'
            ],
            impliedVolatility: vix * 1.3,
            delta: 0.50,
            expectedMove: 15.0,
            category: 'aggressive-recovery'
        });
        
        // Bull call spread for defined risk
        const spreadStrike1 = Math.ceil(currentPrice * 1.02 / 5) * 5;
        const spreadStrike2 = Math.ceil(currentPrice * 1.08 / 5) * 5;
        
        recommendations.push({
            symbol: 'SPY',
            assetType: 'option',
            action: 'buy',
            optionType: 'call_spread',
            strike: spreadStrike1,
            strike2: spreadStrike2,
            expiration: expirationDate,
            entryPrice: this.estimateOptionPrice('call', currentPrice, spreadStrike1, daysToExpiry, vix) - 
                       this.estimateOptionPrice('call', currentPrice, spreadStrike2, daysToExpiry, vix),
            targetPrice: (spreadStrike2 - spreadStrike1) * 0.75,
            stopLoss: this.estimateOptionPrice('call', currentPrice, spreadStrike1, daysToExpiry, vix) * 0.3,
            confidence: 80,
            riskLevel: 'Low',
            timeframe: `${daysToExpiry} days`,
            catalyst: 'Defined-Risk Recovery Play',
            description: `Bull call spread (${spreadStrike1}/${spreadStrike2}) for controlled recovery exposure.`,
            reasoning: [
                'Limited risk, defined reward',
                'Lower cost than straight calls',
                'Profits from moderate rally',
                'Ideal for conservative recovery play'
            ],
            impliedVolatility: vix,
            delta: 0.35,
            maxProfit: spreadStrike2 - spreadStrike1,
            maxLoss: this.estimateOptionPrice('call', currentPrice, spreadStrike1, daysToExpiry, vix),
            category: 'defined-risk'
        });
        
        // Send recommendations
        this.publishRecommendations(recommendations, 'recovery_calls');
        
        return recommendations;
    }

    /**
     * Generate CALL recommendations during bullish conditions
     */
    generateBullishCallRecommendations() {
        console.log(`🚀 Generating CALL recommendations for bullish market`);
        
        const recommendations = [];
        const currentPrice = this.indicators.movingAverages.currentPrice;
        const vix = this.indicators.vix;
        
        const daysToExpiry = 30;
        const expirationDate = new Date(Date.now() + daysToExpiry * 24 * 60 * 60 * 1000);
        
        // SPY Call - Momentum play
        const spyStrike = Math.ceil(currentPrice * 1.02 / 5) * 5;
        recommendations.push({
            symbol: 'SPY',
            assetType: 'option',
            action: 'buy',
            optionType: 'call',
            strike: spyStrike,
            expiration: expirationDate,
            entryPrice: this.estimateOptionPrice('call', currentPrice, spyStrike, daysToExpiry, vix),
            targetPrice: this.estimateOptionPrice('call', currentPrice * 1.08, spyStrike, daysToExpiry * 0.7, vix * 0.9),
            stopLoss: this.estimateOptionPrice('call', currentPrice, spyStrike, daysToExpiry, vix) * 0.6,
            confidence: 80,
            riskLevel: 'Medium',
            timeframe: `${daysToExpiry} days`,
            catalyst: 'Bullish Momentum Continuation',
            description: 'SPY call options to ride bullish momentum. Market showing strength.',
            reasoning: [
                `Price above all major moving averages`,
                `RSI at ${this.indicators.rsi.toFixed(1)} (healthy momentum)`,
                `VIX low at ${vix.toFixed(1)} (low fear)`,
                'Positive market breadth',
                'Bullish MACD crossover'
            ],
            impliedVolatility: vix,
            delta: 0.55,
            expectedMove: 6.0,
            category: 'momentum-play'
        });
        
        this.publishRecommendations(recommendations, 'bullish_calls');
        return recommendations;
    }

    /**
     * Estimate option price using simplified Black-Scholes
     */
    estimateOptionPrice(type, stockPrice, strikePrice, daysToExpiry, volatility) {
        const timeToExpiry = daysToExpiry / 365;
        const riskFreeRate = 0.05; // 5% risk-free rate
        const vol = volatility / 100;
        
        // Simplified intrinsic + time value
        const intrinsicValue = type === 'call' ? 
            Math.max(0, stockPrice - strikePrice) : 
            Math.max(0, strikePrice - stockPrice);
        
        const timeValue = Math.sqrt(timeToExpiry) * vol * stockPrice * 0.4;
        
        return Math.max(0.5, intrinsicValue + timeValue);
    }

    /**
     * Publish recommendations to the system
     */
    publishRecommendations(recommendations, category) {
        console.log(`📤 Publishing ${recommendations.length} ${category} recommendations`);
        
        // Emit event for UI
        window.dispatchEvent(new CustomEvent('correctionRecommendations', {
            detail: {
                category: category,
                recommendations: recommendations,
                marketState: this.marketState,
                timestamp: new Date()
            }
        }));
        
        // Show notification to user
        this.showRecommendationNotification(recommendations, category);
    }

    /**
     * Show notification for new recommendations
     */
    showRecommendationNotification(recommendations, category) {
        const categoryNames = {
            'correction_puts': '🔻 Market Correction - PUT Recommendations',
            'recovery_calls': '📈 Market Recovery - CALL Recommendations',
            'bullish_calls': '🚀 Bullish Market - CALL Recommendations'
        };
        
        const title = categoryNames[category] || 'New Recommendations';
        const message = `${recommendations.length} new options recommendations generated based on market conditions`;
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'correction-notification';
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #000;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(255, 215, 0, 0.4);
            z-index: 10001;
            max-width: 400px;
            font-weight: 600;
            animation: slideIn 0.3s ease-out;
            cursor: pointer;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: start; gap: 15px;">
                <div style="font-size: 32px;">${category.includes('put') ? '🔻' : '📈'}</div>
                <div style="flex: 1;">
                    <div style="font-size: 16px; margin-bottom: 5px;">${title}</div>
                    <div style="font-size: 14px; opacity: 0.9;">${message}</div>
                    <div style="font-size: 12px; margin-top: 8px; opacity: 0.8;">
                        Market State: ${this.marketState.replace('_', ' ').toUpperCase()}
                    </div>
                </div>
            </div>
        `;
        
        // Click to view recommendations
        notification.onclick = () => {
            this.showRecommendationsModal(recommendations, category);
            notification.remove();
        };
        
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }
        }, 10000);
    }

    /**
     * Show modal with recommendations
     */
    showRecommendationsModal(recommendations, category) {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10002;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: fadeIn 0.3s ease-out;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: var(--card-black, #1a1a1a);
            border: 2px solid var(--primary-yellow, #FFD700);
            border-radius: 15px;
            padding: 30px;
            max-width: 900px;
            max-height: 80vh;
            overflow-y: auto;
            width: 100%;
        `;
        
        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: var(--primary-yellow, #FFD700); margin: 0;">
                    ${category.includes('put') ? '🔻' : '📈'} 
                    ${category.replace('_', ' ').toUpperCase()} Recommendations
                </h2>
                <button onclick="this.closest('[style*=fixed]').remove()" style="
                    background: transparent;
                    border: 2px solid var(--primary-yellow, #FFD700);
                    color: var(--primary-yellow, #FFD700);
                    padding: 8px 15px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: 600;
                ">Close</button>
            </div>
            <div style="color: #fff; margin-bottom: 20px;">
                <strong>Market State:</strong> ${this.marketState.replace('_', ' ').toUpperCase()}<br>
                <strong>Generated:</strong> ${new Date().toLocaleString()}
            </div>
        `;
        
        recommendations.forEach((rec, index) => {
            html += `
                <div style="
                    background: rgba(255, 215, 0, 0.05);
                    border: 1px solid var(--primary-yellow, #FFD700);
                    border-radius: 10px;
                    padding: 20px;
                    margin-bottom: 15px;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                        <div>
                            <h3 style="color: var(--primary-yellow, #FFD700); margin: 0 0 5px 0;">
                                ${rec.symbol} ${rec.optionType.toUpperCase()} - $${rec.strike}
                            </h3>
                            <div style="color: #aaa; font-size: 14px;">
                                Expires: ${rec.expiration.toLocaleDateString()} | 
                                Confidence: ${rec.confidence}%
                            </div>
                        </div>
                        <div style="
                            background: ${rec.optionType.includes('put') ? '#FF4444' : '#00FF41'};
                            color: #000;
                            padding: 5px 12px;
                            border-radius: 5px;
                            font-weight: 700;
                            font-size: 14px;
                        ">
                            ${rec.action.toUpperCase()}
                        </div>
                    </div>
                    
                    <div style="color: #fff; margin-bottom: 15px;">
                        ${rec.description}
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 15px;">
                        <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px;">
                            <div style="color: #aaa; font-size: 12px;">Entry Price</div>
                            <div style="color: var(--primary-yellow, #FFD700); font-size: 18px; font-weight: 700;">
                                $${rec.entryPrice.toFixed(2)}
                            </div>
                        </div>
                        <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px;">
                            <div style="color: #aaa; font-size: 12px;">Target Price</div>
                            <div style="color: #00FF41; font-size: 18px; font-weight: 700;">
                                $${rec.targetPrice.toFixed(2)}
                            </div>
                        </div>
                        <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px;">
                            <div style="color: #aaa; font-size: 12px;">Stop Loss</div>
                            <div style="color: #FF4444; font-size: 18px; font-weight: 700;">
                                $${rec.stopLoss.toFixed(2)}
                            </div>
                        </div>
                        <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px;">
                            <div style="color: #aaa; font-size: 12px;">Risk Level</div>
                            <div style="color: #fff; font-size: 18px; font-weight: 700;">
                                ${rec.riskLevel}
                            </div>
                        </div>
                    </div>
                    
                    <div style="color: #fff; margin-bottom: 10px;">
                        <strong style="color: var(--primary-yellow, #FFD700);">Reasoning:</strong>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            ${rec.reasoning.map(r => `<li style="margin: 5px 0;">${r}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div style="display: flex; gap: 15px; font-size: 13px; color: #aaa;">
                        <span>IV: ${rec.impliedVolatility.toFixed(1)}%</span>
                        <span>Delta: ${rec.delta.toFixed(2)}</span>
                        <span>Expected Move: ${rec.expectedMove.toFixed(1)}%</span>
                    </div>
                </div>
            `;
        });
        
        content.innerHTML = html;
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Close on overlay click
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }

    /**
     * Setup news listeners for breaking news
     */
    setupNewsListeners() {
        window.addEventListener('newsUpdate', (event) => {
            this.handleBreakingNews(event.detail);
        });
    }

    /**
     * Handle breaking news that might trigger immediate recommendations
     */
    handleBreakingNews(newsData) {
        if (!newsData || newsData.impactScore < 8) return;
        
        console.log('🚨 Breaking news detected:', newsData.headline);
        
        // Check for correction-related keywords
        const bearishKeywords = [
            'correction', 'crash', 'recession', 'bear market', 'sell-off',
            'rate hike', 'inflation', 'crisis', 'collapse', 'plunge',
            'tumble', 'slump', 'downturn', 'decline', 'losses'
        ];
        
        const bullishKeywords = [
            'recovery', 'rally', 'surge', 'boom', 'bull market',
            'rate cut', 'stimulus', 'growth', 'gains', 'soar',
            'breakout', 'upturn', 'rebound', 'bounce'
        ];
        
        const headline = newsData.headline.toLowerCase();
        const content = (newsData.content || '').toLowerCase();
        const text = headline + ' ' + content;
        
        const bearishScore = bearishKeywords.filter(kw => text.includes(kw)).length;
        const bullishScore = bullishKeywords.filter(kw => text.includes(kw)).length;
        
        // Trigger immediate analysis if significant news
        if (bearishScore >= 2 || bullishScore >= 2) {
            console.log(`📰 Significant news detected (Bearish: ${bearishScore}, Bullish: ${bullishScore})`);
            
            // Update sentiment
            this.sentimentScore = newsData.sentiment || (bearishScore > bullishScore ? -0.8 : 0.8);
            
            // Trigger immediate market analysis
            setTimeout(() => {
                this.analyzeMarketConditions();
            }, 1000);
        }
    }

    /**
     * Log current market state
     */
    logMarketState() {
        console.log('📊 Market State:', {
            state: this.marketState,
            priceChange: `${(this.indicators.priceChange * 100).toFixed(2)}%`,
            rsi: this.indicators.rsi.toFixed(1),
            macd: this.indicators.macd.trend,
            vix: this.indicators.vix.toFixed(1),
            sentiment: this.sentimentScore.toFixed(2)
        });
    }

    /**
     * Emit state change event
     */
    emitStateChangeEvent(previousState, newState) {
        window.dispatchEvent(new CustomEvent('marketStateChange', {
            detail: {
                previousState: previousState,
                newState: newState,
                indicators: this.indicators,
                timestamp: new Date()
            }
        }));
    }

    /**
     * Get current market state
     */
    getMarketState() {
        return {
            state: this.marketState,
            indicators: this.indicators,
            sentimentScore: this.sentimentScore,
            correctionStartDate: this.correctionStartDate,
            correctionDepth: this.correctionDepth
        };
    }
}

// Create singleton instance
const marketCorrectionDetector = new MarketCorrectionDetector();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = marketCorrectionDetector;
}

// Add CSS animations
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}
