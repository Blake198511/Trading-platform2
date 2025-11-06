// Risk Assessment and Scoring System
// Implementation of Task 7.1 and 7.2

/**
 * RiskAssessment Interface
 * Defines the structure for risk assessment data
 */
class RiskAssessment {
    constructor(data = {}) {
        this.overallRisk = data.overallRisk || 'Medium';
        this.factors = {
            volatility: data.factors?.volatility || 0,
            liquidity: data.factors?.liquidity || 0,
            marketCap: data.factors?.marketCap || 0,
            newsRisk: data.factors?.newsRisk || 0,
            technicalRisk: data.factors?.technicalRisk || 0
        };
        this.maxLoss = data.maxLoss || 0;
        this.probabilityOfLoss = data.probabilityOfLoss || 0;
        this.riskScore = data.riskScore || 0;
    }
}

/**
 * Universal Risk Scoring Algorithm
 * Calculates risk scores based on multiple factors
 */
class RiskScorer {
    
    /**
     * Calculate volatility risk based on price movements
     * @param {Object} priceData - Historical price data
     * @returns {number} Risk score 0-100
     */
    static calculateVolatilityRisk(priceData) {
        if (!priceData || !priceData.prices || priceData.prices.length < 2) {
            return 50; // Default medium risk if no data
        }
        
        // Calculate daily returns
        const returns = [];
        for (let i = 1; i < priceData.prices.length; i++) {
            const dailyReturn = (priceData.prices[i] - priceData.prices[i-1]) / priceData.prices[i-1];
            returns.push(dailyReturn);
        }
        
        // Calculate standard deviation (volatility)
        const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
        const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
        const volatility = Math.sqrt(variance);
        
        // Convert volatility to risk score (0-100)
        // Higher volatility = higher risk
        const volatilityRisk = Math.min(volatility * 1000, 100);
        
        return Math.round(volatilityRisk);
    }
    
    /**
     * Calculate liquidity risk based on volume and market cap
     * @param {Object} liquidityData - Volume and market cap data
     * @returns {number} Risk score 0-100
     */
    static calculateLiquidityRisk(liquidityData) {
        const { avgVolume = 0, marketCap = 0, spread = 0 } = liquidityData;
        
        let liquidityRisk = 0;
        
        // Volume risk (lower volume = higher risk)
        if (avgVolume < 100000) liquidityRisk += 40;
        else if (avgVolume < 500000) liquidityRisk += 25;
        else if (avgVolume < 1000000) liquidityRisk += 15;
        else liquidityRisk += 5;
        
        // Market cap risk (smaller cap = higher risk)
        if (marketCap < 100000000) liquidityRisk += 30; // < $100M
        else if (marketCap < 1000000000) liquidityRisk += 20; // < $1B
        else if (marketCap < 10000000000) liquidityRisk += 10; // < $10B
        else liquidityRisk += 5;
        
        // Bid-ask spread risk (wider spread = higher risk)
        if (spread > 0.05) liquidityRisk += 20; // > 5%
        else if (spread > 0.02) liquidityRisk += 10; // > 2%
        else liquidityRisk += 5;
        
        return Math.min(liquidityRisk, 100);
    }
    
    /**
     * Calculate market cap risk based on company size
     * @param {number} marketCap - Market capitalization in dollars
     * @returns {number} Risk score 0-100
     */
    static calculateMarketCapRisk(marketCap) {
        if (marketCap >= 200000000000) return 10; // Mega cap (>$200B)
        if (marketCap >= 10000000000) return 20;  // Large cap ($10B-$200B)
        if (marketCap >= 2000000000) return 35;   // Mid cap ($2B-$10B)
        if (marketCap >= 300000000) return 55;    // Small cap ($300M-$2B)
        if (marketCap >= 50000000) return 75;     // Micro cap ($50M-$300M)
        return 90; // Nano cap (<$50M)
    }
    
    /**
     * Calculate news risk based on sentiment and impact
     * @param {Object} newsData - News sentiment and impact data
     * @returns {number} Risk score 0-100
     */
    static calculateNewsRisk(newsData) {
        const { sentiment = 0, impactScore = 0, volatilityIncrease = 0, controversyLevel = 0 } = newsData;
        
        let newsRisk = 0;
        
        // Sentiment risk (negative sentiment = higher risk)
        if (sentiment < -0.5) newsRisk += 30;
        else if (sentiment < -0.2) newsRisk += 20;
        else if (sentiment < 0.2) newsRisk += 10;
        else newsRisk += 5;
        
        // Impact score risk (higher impact = higher volatility risk)
        newsRisk += Math.min(impactScore * 5, 25);
        
        // Volatility increase from news
        newsRisk += Math.min(volatilityIncrease * 20, 30);
        
        // Controversy level (regulatory issues, scandals, etc.)
        newsRisk += Math.min(controversyLevel * 15, 20);
        
        return Math.min(newsRisk, 100);
    }
    
    /**
     * Calculate technical risk based on chart patterns and indicators
     * @param {Object} technicalData - Technical analysis data
     * @returns {number} Risk score 0-100
     */
    static calculateTechnicalRisk(technicalData) {
        const { 
            trendStrength = 0, 
            supportLevel = 0, 
            resistanceLevel = 0, 
            rsi = 50, 
            macdSignal = 0,
            volumeConfirmation = true,
            breakoutProbability = 0.5
        } = technicalData;
        
        let technicalRisk = 0;
        
        // Trend strength risk (weak trends = higher risk)
        if (trendStrength < 0.3) technicalRisk += 25;
        else if (trendStrength < 0.6) technicalRisk += 15;
        else technicalRisk += 5;
        
        // RSI overbought/oversold risk
        if (rsi > 80 || rsi < 20) technicalRisk += 20;
        else if (rsi > 70 || rsi < 30) technicalRisk += 10;
        else technicalRisk += 5;
        
        // MACD signal risk
        if (Math.abs(macdSignal) < 0.1) technicalRisk += 15; // Weak signal
        else technicalRisk += 5;
        
        // Volume confirmation risk
        if (!volumeConfirmation) technicalRisk += 20;
        
        // Breakout probability risk
        if (breakoutProbability < 0.3) technicalRisk += 20;
        else if (breakoutProbability < 0.6) technicalRisk += 10;
        
        return Math.min(technicalRisk, 100);
    }
    
    /**
     * Calculate maximum potential loss
     * @param {Object} positionData - Position and price data
     * @returns {Object} Maximum loss data
     */
    static calculateMaximumLoss(positionData) {
        const { 
            entryPrice, 
            positionSize, 
            stopLoss, 
            volatility, 
            timeframe = 30,
            assetType = 'stock'
        } = positionData;
        
        let maxLossPercent = 0;
        let maxLossDollar = 0;
        
        if (stopLoss && stopLoss > 0) {
            // Calculate loss if stop loss is hit
            maxLossPercent = Math.abs((stopLoss - entryPrice) / entryPrice) * 100;
            maxLossDollar = Math.abs((stopLoss - entryPrice) * positionSize);
        } else {
            // Estimate maximum loss based on volatility and asset type
            switch (assetType) {
                case 'stock':
                    maxLossPercent = Math.min(volatility * Math.sqrt(timeframe) * 2, 100);
                    break;
                case 'option':
                    maxLossPercent = 100; // Options can go to zero
                    break;
                case 'crypto':
                    maxLossPercent = Math.min(volatility * Math.sqrt(timeframe) * 3, 100);
                    break;
                case 'forex':
                    maxLossPercent = Math.min(volatility * Math.sqrt(timeframe) * 1.5, 50);
                    break;
                default:
                    maxLossPercent = 50;
            }
            maxLossDollar = (maxLossPercent / 100) * entryPrice * positionSize;
        }
        
        return {
            maxLossPercent: Math.round(maxLossPercent * 100) / 100,
            maxLossDollar: Math.round(maxLossDollar * 100) / 100,
            stopLossRecommended: !stopLoss || stopLoss <= 0
        };
    }
    
    /**
     * Calculate probability of loss based on historical data and risk factors
     * @param {Object} probabilityData - Historical and risk data
     * @returns {number} Probability of loss (0-100)
     */
    static calculateProbabilityOfLoss(probabilityData) {
        const {
            historicalWinRate = 0.5,
            marketConditions = 'neutral',
            volatilityLevel = 'medium',
            newsRisk = 50,
            technicalRisk = 50,
            timeframe = 30
        } = probabilityData;
        
        let baseProbability = (1 - historicalWinRate) * 100;
        
        // Adjust for market conditions
        switch (marketConditions) {
            case 'bullish':
                baseProbability *= 0.8;
                break;
            case 'bearish':
                baseProbability *= 1.3;
                break;
            case 'volatile':
                baseProbability *= 1.2;
                break;
            default: // neutral
                baseProbability *= 1.0;
        }
        
        // Adjust for volatility
        switch (volatilityLevel) {
            case 'low':
                baseProbability *= 0.9;
                break;
            case 'high':
                baseProbability *= 1.2;
                break;
            default: // medium
                baseProbability *= 1.0;
        }
        
        // Adjust for news and technical risk
        const riskAdjustment = (newsRisk + technicalRisk) / 200; // 0-1 scale
        baseProbability *= (1 + riskAdjustment * 0.5);
        
        // Adjust for timeframe (longer timeframe = higher uncertainty)
        const timeframeMultiplier = 1 + (timeframe / 365) * 0.3;
        baseProbability *= timeframeMultiplier;
        
        return Math.min(Math.round(baseProbability), 100);
    }
    
    /**
     * Generate comprehensive risk assessment
     * @param {Object} assessmentData - All risk assessment data
     * @returns {RiskAssessment} Complete risk assessment
     */
    static generateRiskAssessment(assessmentData) {
        const {
            priceData,
            liquidityData,
            marketCap,
            newsData,
            technicalData,
            positionData,
            probabilityData
        } = assessmentData;
        
        // Calculate individual risk factors
        const volatilityRisk = this.calculateVolatilityRisk(priceData);
        const liquidityRisk = this.calculateLiquidityRisk(liquidityData);
        const marketCapRisk = this.calculateMarketCapRisk(marketCap);
        const newsRisk = this.calculateNewsRisk(newsData);
        const technicalRisk = this.calculateTechnicalRisk(technicalData);
        
        // Calculate maximum loss and probability
        const maxLossData = this.calculateMaximumLoss(positionData);
        const probabilityOfLoss = this.calculateProbabilityOfLoss(probabilityData);
        
        // Calculate overall risk score (weighted average)
        const weights = {
            volatility: 0.25,
            liquidity: 0.20,
            marketCap: 0.15,
            news: 0.20,
            technical: 0.20
        };
        
        const overallRiskScore = Math.round(
            volatilityRisk * weights.volatility +
            liquidityRisk * weights.liquidity +
            marketCapRisk * weights.marketCap +
            newsRisk * weights.news +
            technicalRisk * weights.technical
        );
        
        // Determine overall risk level
        let overallRisk = 'Medium';
        if (overallRiskScore <= 30) overallRisk = 'Low';
        else if (overallRiskScore >= 70) overallRisk = 'High';
        
        return new RiskAssessment({
            overallRisk,
            factors: {
                volatility: volatilityRisk,
                liquidity: liquidityRisk,
                marketCap: marketCapRisk,
                newsRisk: newsRisk,
                technicalRisk: technicalRisk
            },
            maxLoss: maxLossData.maxLossPercent,
            maxLossDollar: maxLossData.maxLossDollar,
            probabilityOfLoss: probabilityOfLoss,
            riskScore: overallRiskScore,
            stopLossRecommended: maxLossData.stopLossRecommended
        });
    }
}

/**
 * Position Sizing Calculator
 * Calculates appropriate position sizes based on risk tolerance
 */
class PositionSizer {
    
    /**
     * Calculate position size based on risk tolerance
     * @param {Object} sizingData - Position sizing parameters
     * @returns {Object} Position sizing recommendations
     */
    static calculatePositionSize(sizingData) {
        const {
            accountSize,
            riskTolerance = 0.02, // 2% default
            entryPrice,
            stopLoss,
            riskScore,
            maxLossPercent
        } = sizingData;
        
        const maxRiskAmount = accountSize * riskTolerance;
        
        let recommendedSize = 0;
        let adjustedRiskTolerance = riskTolerance;
        
        // Adjust risk tolerance based on risk score
        if (riskScore > 70) {
            adjustedRiskTolerance *= 0.5; // Reduce position size for high risk
        } else if (riskScore < 30) {
            adjustedRiskTolerance *= 1.2; // Slightly increase for low risk
        }
        
        if (stopLoss && stopLoss > 0) {
            // Calculate based on stop loss
            const riskPerShare = Math.abs(entryPrice - stopLoss);
            recommendedSize = Math.floor((accountSize * adjustedRiskTolerance) / riskPerShare);
        } else {
            // Calculate based on estimated maximum loss
            const estimatedRiskPerShare = entryPrice * (maxLossPercent / 100);
            recommendedSize = Math.floor((accountSize * adjustedRiskTolerance) / estimatedRiskPerShare);
        }
        
        // Calculate position as percentage of account
        const positionValue = recommendedSize * entryPrice;
        const positionPercent = (positionValue / accountSize) * 100;
        
        return {
            recommendedShares: Math.max(recommendedSize, 0),
            positionValue: Math.round(positionValue * 100) / 100,
            positionPercent: Math.round(positionPercent * 100) / 100,
            maxRiskAmount: Math.round(maxRiskAmount * 100) / 100,
            adjustedRiskTolerance: Math.round(adjustedRiskTolerance * 10000) / 100 // Convert to percentage
        };
    }
}

// Export classes for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RiskAssessment, RiskScorer, PositionSizer };
}

