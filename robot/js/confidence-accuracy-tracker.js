// Confidence and Accuracy Tracking System
// Implementation of Task 7.2

/**
 * Historical Accuracy Tracker
 * Tracks recommendation performance over time
 */
class AccuracyTracker {
    constructor() {
        this.recommendations = new Map();
        this.performanceHistory = [];
        this.accuracyByType = new Map();
        this.confidenceCalibration = new Map();
    }

    /**
     * Record a new recommendation for tracking
     * @param {Object} recommendation - Recommendation data
     */
    recordRecommendation(recommendation) {
        const trackingData = {
            id: recommendation.id,
            symbol: recommendation.symbol,
            assetType: recommendation.assetType,
            action: recommendation.action,
            entryPrice: recommendation.entryPrice,
            targetPrice: recommendation.targetPrice,
            stopLoss: recommendation.stopLoss,
            confidence: recommendation.confidence,
            category: recommendation.category,
            timeframe: recommendation.timeframe,
            createdAt: new Date(),
            status: 'active',
            actualOutcome: null,
            actualReturn: null,
            daysToTarget: null,
            hitTarget: false,
            hitStopLoss: false
        };

        this.recommendations.set(recommendation.id, trackingData);
        this.saveToStorage();
    }

    /**
     * Update recommendation outcome
     * @param {string} recommendationId - ID of the recommendation
     * @param {Object} outcome - Actual outcome data
     */
    updateOutcome(recommendationId, outcome) {
        const recommendation = this.recommendations.get(recommendationId);
        if (!recommendation) return;

        recommendation.actualOutcome = outcome;
        recommendation.actualReturn = outcome.actualReturn;
        recommendation.daysToTarget = outcome.daysToTarget;
        recommendation.hitTarget = outcome.hitTarget;
        recommendation.hitStopLoss = outcome.hitStopLoss;
        recommendation.status = 'completed';
        recommendation.completedAt = new Date();

        // Add to performance history
        this.performanceHistory.push({
            ...recommendation,
            success: outcome.hitTarget,
            timeToComplete: outcome.daysToTarget
        });

        // Update accuracy by type
        this.updateAccuracyByType(recommendation);
        
        // Update confidence calibration
        this.updateConfidenceCalibration(recommendation);

        this.saveToStorage();
    }

    /**
     * Update accuracy statistics by recommendation type
     * @param {Object} recommendation - Completed recommendation
     */
    updateAccuracyByType(recommendation) {
        const key = `${recommendation.assetType}_${recommendation.category}`;
        
        if (!this.accuracyByType.has(key)) {
            this.accuracyByType.set(key, {
                total: 0,
                successful: 0,
                totalReturn: 0,
                avgDaysToTarget: 0,
                confidenceSum: 0
            });
        }

        const stats = this.accuracyByType.get(key);
        stats.total++;
        stats.confidenceSum += recommendation.confidence;
        
        if (recommendation.hitTarget) {
            stats.successful++;
            stats.totalReturn += recommendation.actualReturn;
            stats.avgDaysToTarget = ((stats.avgDaysToTarget * (stats.successful - 1)) + recommendation.daysToTarget) / stats.successful;
        }

        this.accuracyByType.set(key, stats);
    }

    /**
     * Update confidence calibration data
     * @param {Object} recommendation - Completed recommendation
     */
    updateConfidenceCalibration(recommendation) {
        const confidenceBucket = Math.floor(recommendation.confidence / 10) * 10;
        
        if (!this.confidenceCalibration.has(confidenceBucket)) {
            this.confidenceCalibration.set(confidenceBucket, {
                total: 0,
                successful: 0,
                avgActualReturn: 0,
                totalReturn: 0
            });
        }

        const calibration = this.confidenceCalibration.get(confidenceBucket);
        calibration.total++;
        calibration.totalReturn += recommendation.actualReturn || 0;
        calibration.avgActualReturn = calibration.totalReturn / calibration.total;
        
        if (recommendation.hitTarget) {
            calibration.successful++;
        }

        this.confidenceCalibration.set(confidenceBucket, calibration);
    }

    /**
     * Get accuracy statistics for a specific recommendation type
     * @param {string} assetType - Asset type (stock, option, crypto, forex)
     * @param {string} category - Recommendation category
     * @returns {Object} Accuracy statistics
     */
    getAccuracyByType(assetType, category) {
        const key = `${assetType}_${category}`;
        const stats = this.accuracyByType.get(key);
        
        if (!stats || stats.total === 0) {
            return {
                accuracy: 0,
                totalRecommendations: 0,
                avgReturn: 0,
                avgDaysToTarget: 0,
                avgConfidence: 0
            };
        }

        return {
            accuracy: Math.round((stats.successful / stats.total) * 100),
            totalRecommendations: stats.total,
            avgReturn: Math.round((stats.totalReturn / stats.successful) * 100) / 100 || 0,
            avgDaysToTarget: Math.round(stats.avgDaysToTarget),
            avgConfidence: Math.round(stats.confidenceSum / stats.total)
        };
    }

    /**
     * Get overall accuracy statistics
     * @returns {Object} Overall accuracy data
     */
    getOverallAccuracy() {
        if (this.performanceHistory.length === 0) {
            return {
                overallAccuracy: 0,
                totalRecommendations: 0,
                avgReturn: 0,
                avgTimeToTarget: 0,
                bestPerformingType: null,
                worstPerformingType: null
            };
        }

        const successful = this.performanceHistory.filter(r => r.success).length;
        const totalReturn = this.performanceHistory.reduce((sum, r) => sum + (r.actualReturn || 0), 0);
        const avgTimeToTarget = this.performanceHistory
            .filter(r => r.success)
            .reduce((sum, r) => sum + r.timeToComplete, 0) / successful || 0;

        // Find best and worst performing types
        let bestType = null;
        let worstType = null;
        let bestAccuracy = 0;
        let worstAccuracy = 100;

        for (const [key, stats] of this.accuracyByType.entries()) {
            const accuracy = (stats.successful / stats.total) * 100;
            if (accuracy > bestAccuracy) {
                bestAccuracy = accuracy;
                bestType = key;
            }
            if (accuracy < worstAccuracy) {
                worstAccuracy = accuracy;
                worstType = key;
            }
        }

        return {
            overallAccuracy: Math.round((successful / this.performanceHistory.length) * 100),
            totalRecommendations: this.performanceHistory.length,
            avgReturn: Math.round((totalReturn / this.performanceHistory.length) * 100) / 100,
            avgTimeToTarget: Math.round(avgTimeToTarget),
            bestPerformingType: bestType,
            worstPerformingType: worstType,
            bestAccuracy: Math.round(bestAccuracy),
            worstAccuracy: Math.round(worstAccuracy)
        };
    }

    /**
     * Get historical performance for similar setups
     * @param {Object} currentRecommendation - Current recommendation to find similar setups for
     * @returns {Array} Similar historical recommendations
     */
    getSimilarSetups(currentRecommendation) {
        const similar = this.performanceHistory.filter(historical => {
            // Match by asset type and category
            if (historical.assetType !== currentRecommendation.assetType) return false;
            if (historical.category !== currentRecommendation.category) return false;
            
            // Match by similar confidence range (±10)
            const confidenceDiff = Math.abs(historical.confidence - currentRecommendation.confidence);
            if (confidenceDiff > 10) return false;
            
            // Match by similar price range (±20%)
            const priceDiff = Math.abs(historical.entryPrice - currentRecommendation.entryPrice) / historical.entryPrice;
            if (priceDiff > 0.2) return false;
            
            return true;
        });

        // Sort by most recent first
        similar.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        return similar.slice(0, 10); // Return top 10 most similar
    }

    /**
     * Save tracking data to localStorage
     */
    saveToStorage() {
        try {
            const data = {
                recommendations: Array.from(this.recommendations.entries()),
                performanceHistory: this.performanceHistory,
                accuracyByType: Array.from(this.accuracyByType.entries()),
                confidenceCalibration: Array.from(this.confidenceCalibration.entries())
            };
            localStorage.setItem('accuracyTracker', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving accuracy tracker data:', error);
        }
    }

    /**
     * Load tracking data from localStorage
     */
    loadFromStorage() {
        try {
            const data = JSON.parse(localStorage.getItem('accuracyTracker') || '{}');
            
            if (data.recommendations) {
                this.recommendations = new Map(data.recommendations);
            }
            if (data.performanceHistory) {
                this.performanceHistory = data.performanceHistory;
            }
            if (data.accuracyByType) {
                this.accuracyByType = new Map(data.accuracyByType);
            }
            if (data.confidenceCalibration) {
                this.confidenceCalibration = new Map(data.confidenceCalibration);
            }
        } catch (error) {
            console.error('Error loading accuracy tracker data:', error);
        }
    }
}

/**
 * Confidence Score Calculator
 * Calculates confidence scores for recommendations
 */
class ConfidenceCalculator {
    
    /**
     * Calculate confidence score for a recommendation
     * @param {Object} recommendationData - All data for confidence calculation
     * @returns {number} Confidence score (1-100)
     */
    static calculateConfidence(recommendationData) {
        const {
            technicalAnalysis,
            fundamentalAnalysis,
            newsAnalysis,
            marketConditions,
            historicalAccuracy,
            riskAssessment,
            volumeAnalysis,
            catalystStrength
        } = recommendationData;

        let confidence = 50; // Base confidence

        // Technical analysis contribution (25% weight)
        if (technicalAnalysis) {
            confidence += this.calculateTechnicalConfidence(technicalAnalysis) * 0.25;
        }

        // Fundamental analysis contribution (20% weight)
        if (fundamentalAnalysis) {
            confidence += this.calculateFundamentalConfidence(fundamentalAnalysis) * 0.20;
        }

        // News analysis contribution (15% weight)
        if (newsAnalysis) {
            confidence += this.calculateNewsConfidence(newsAnalysis) * 0.15;
        }

        // Market conditions contribution (15% weight)
        if (marketConditions) {
            confidence += this.calculateMarketConfidence(marketConditions) * 0.15;
        }

        // Historical accuracy contribution (10% weight)
        if (historicalAccuracy) {
            confidence += this.calculateHistoricalConfidence(historicalAccuracy) * 0.10;
        }

        // Risk assessment contribution (10% weight)
        if (riskAssessment) {
            confidence += this.calculateRiskConfidence(riskAssessment) * 0.10;
        }

        // Volume analysis contribution (5% weight)
        if (volumeAnalysis) {
            confidence += this.calculateVolumeConfidence(volumeAnalysis) * 0.05;
        }

        // Catalyst strength bonus (up to 10 points)
        if (catalystStrength) {
            confidence += Math.min(catalystStrength * 10, 10);
        }

        // Ensure confidence is within bounds
        return Math.max(1, Math.min(100, Math.round(confidence)));
    }

    /**
     * Calculate technical analysis confidence component
     * @param {Object} technical - Technical analysis data
     * @returns {number} Technical confidence (-20 to +20)
     */
    static calculateTechnicalConfidence(technical) {
        const {
            trendStrength = 0.5,
            supportResistance = 0.5,
            momentum = 0.5,
            volumeConfirmation = false,
            patternStrength = 0.5
        } = technical;

        let techConfidence = 0;

        // Strong trend adds confidence
        if (trendStrength > 0.8) techConfidence += 8;
        else if (trendStrength > 0.6) techConfidence += 5;
        else if (trendStrength < 0.3) techConfidence -= 5;

        // Clear support/resistance levels
        if (supportResistance > 0.8) techConfidence += 6;
        else if (supportResistance > 0.6) techConfidence += 3;

        // Momentum alignment
        if (momentum > 0.7) techConfidence += 4;
        else if (momentum < 0.3) techConfidence -= 4;

        // Volume confirmation
        if (volumeConfirmation) techConfidence += 4;

        // Pattern strength
        if (patternStrength > 0.8) techConfidence += 3;
        else if (patternStrength < 0.3) techConfidence -= 2;

        return Math.max(-20, Math.min(20, techConfidence));
    }

    /**
     * Calculate fundamental analysis confidence component
     * @param {Object} fundamental - Fundamental analysis data
     * @returns {number} Fundamental confidence (-15 to +15)
     */
    static calculateFundamentalConfidence(fundamental) {
        const {
            financialHealth = 0.5,
            growthProspects = 0.5,
            valuation = 0.5,
            competitivePosition = 0.5,
            managementQuality = 0.5
        } = fundamental;

        let fundConfidence = 0;

        // Financial health
        if (financialHealth > 0.8) fundConfidence += 4;
        else if (financialHealth > 0.6) fundConfidence += 2;
        else if (financialHealth < 0.3) fundConfidence -= 3;

        // Growth prospects
        if (growthProspects > 0.8) fundConfidence += 4;
        else if (growthProspects > 0.6) fundConfidence += 2;
        else if (growthProspects < 0.3) fundConfidence -= 3;

        // Valuation attractiveness
        if (valuation > 0.7) fundConfidence += 3;
        else if (valuation < 0.3) fundConfidence -= 2;

        // Competitive position
        if (competitivePosition > 0.8) fundConfidence += 2;
        else if (competitivePosition < 0.3) fundConfidence -= 2;

        // Management quality
        if (managementQuality > 0.8) fundConfidence += 2;

        return Math.max(-15, Math.min(15, fundConfidence));
    }

    /**
     * Calculate news analysis confidence component
     * @param {Object} news - News analysis data
     * @returns {number} News confidence (-10 to +10)
     */
    static calculateNewsConfidence(news) {
        const {
            sentiment = 0,
            impactScore = 0,
            sourceCredibility = 0.5,
            recency = 1,
            relevance = 0.5
        } = news;

        let newsConfidence = 0;

        // Positive sentiment adds confidence
        if (sentiment > 0.5) newsConfidence += 4;
        else if (sentiment > 0.2) newsConfidence += 2;
        else if (sentiment < -0.2) newsConfidence -= 2;
        else if (sentiment < -0.5) newsConfidence -= 4;

        // High impact news
        if (impactScore > 8) newsConfidence += 3;
        else if (impactScore > 6) newsConfidence += 2;

        // Source credibility
        if (sourceCredibility > 0.8) newsConfidence += 2;
        else if (sourceCredibility < 0.3) newsConfidence -= 2;

        // Recent news is more relevant
        if (recency < 0.5) newsConfidence += 1; // Recent news

        return Math.max(-10, Math.min(10, newsConfidence));
    }

    /**
     * Calculate market conditions confidence component
     * @param {Object} market - Market conditions data
     * @returns {number} Market confidence (-10 to +10)
     */
    static calculateMarketConfidence(market) {
        const {
            overallTrend = 'neutral',
            volatility = 'medium',
            volume = 'normal',
            sectorPerformance = 0.5
        } = market;

        let marketConfidence = 0;

        // Overall market trend
        switch (overallTrend) {
            case 'bullish':
                marketConfidence += 4;
                break;
            case 'bearish':
                marketConfidence -= 3;
                break;
            case 'volatile':
                marketConfidence -= 2;
                break;
        }

        // Market volatility
        switch (volatility) {
            case 'low':
                marketConfidence += 2;
                break;
            case 'high':
                marketConfidence -= 3;
                break;
        }

        // Volume conditions
        switch (volume) {
            case 'high':
                marketConfidence += 2;
                break;
            case 'low':
                marketConfidence -= 2;
                break;
        }

        // Sector performance
        if (sectorPerformance > 0.7) marketConfidence += 2;
        else if (sectorPerformance < 0.3) marketConfidence -= 2;

        return Math.max(-10, Math.min(10, marketConfidence));
    }

    /**
     * Calculate historical accuracy confidence component
     * @param {Object} historical - Historical accuracy data
     * @returns {number} Historical confidence (-5 to +5)
     */
    static calculateHistoricalConfidence(historical) {
        const { accuracy = 50, sampleSize = 0 } = historical;

        let histConfidence = 0;

        if (sampleSize >= 10) {
            if (accuracy > 80) histConfidence += 5;
            else if (accuracy > 70) histConfidence += 3;
            else if (accuracy > 60) histConfidence += 1;
            else if (accuracy < 40) histConfidence -= 3;
            else if (accuracy < 30) histConfidence -= 5;
        } else if (sampleSize >= 5) {
            // Reduced confidence for smaller sample sizes
            if (accuracy > 80) histConfidence += 2;
            else if (accuracy < 40) histConfidence -= 2;
        }

        return histConfidence;
    }

    /**
     * Calculate risk assessment confidence component
     * @param {Object} risk - Risk assessment data
     * @returns {number} Risk confidence (-5 to +5)
     */
    static calculateRiskConfidence(risk) {
        const { overallRisk = 'Medium', riskScore = 50 } = risk;

        let riskConfidence = 0;

        // Lower risk increases confidence
        if (overallRisk === 'Low' || riskScore < 30) {
            riskConfidence += 3;
        } else if (overallRisk === 'High' || riskScore > 70) {
            riskConfidence -= 3;
        }

        return riskConfidence;
    }

    /**
     * Calculate volume analysis confidence component
     * @param {Object} volume - Volume analysis data
     * @returns {number} Volume confidence (-3 to +3)
     */
    static calculateVolumeConfidence(volume) {
        const { 
            volumeIncrease = 0, 
            institutionalFlow = 'neutral',
            liquidityLevel = 'normal'
        } = volume;

        let volConfidence = 0;

        // Volume increase
        if (volumeIncrease > 2) volConfidence += 2;
        else if (volumeIncrease > 1.5) volConfidence += 1;

        // Institutional flow
        if (institutionalFlow === 'buying') volConfidence += 1;
        else if (institutionalFlow === 'selling') volConfidence -= 1;

        return volConfidence;
    }

    /**
     * Calculate success probability with timeframe
     * @param {Object} probabilityData - Data for probability calculation
     * @returns {Object} Success probability data
     */
    static calculateSuccessProbability(probabilityData) {
        const {
            confidence,
            timeframe,
            historicalAccuracy,
            marketConditions,
            riskLevel
        } = probabilityData;

        // Base probability from confidence score
        let baseProbability = confidence;

        // Adjust for timeframe
        const timeframeAdjustment = this.getTimeframeAdjustment(timeframe);
        baseProbability *= timeframeAdjustment;

        // Adjust for historical accuracy
        if (historicalAccuracy && historicalAccuracy.accuracy > 0) {
            const accuracyFactor = historicalAccuracy.accuracy / 100;
            baseProbability = (baseProbability * 0.7) + (accuracyFactor * 100 * 0.3);
        }

        // Adjust for market conditions
        const marketAdjustment = this.getMarketAdjustment(marketConditions);
        baseProbability *= marketAdjustment;

        // Adjust for risk level
        const riskAdjustment = this.getRiskAdjustment(riskLevel);
        baseProbability *= riskAdjustment;

        // Calculate probability ranges for different timeframes
        const shortTerm = Math.max(10, Math.min(90, baseProbability * 0.8)); // 1-7 days
        const mediumTerm = Math.max(15, Math.min(85, baseProbability)); // 1-4 weeks
        const longTerm = Math.max(20, Math.min(80, baseProbability * 1.1)); // 1-6 months

        return {
            overall: Math.round(baseProbability),
            shortTerm: Math.round(shortTerm),
            mediumTerm: Math.round(mediumTerm),
            longTerm: Math.round(longTerm),
            timeframe: timeframe
        };
    }

    /**
     * Get timeframe adjustment factor
     * @param {string} timeframe - Timeframe string
     * @returns {number} Adjustment factor
     */
    static getTimeframeAdjustment(timeframe) {
        if (!timeframe) return 1.0;
        
        const lower = timeframe.toLowerCase();
        if (lower.includes('day') || lower.includes('week')) return 0.9;
        if (lower.includes('month')) return 1.0;
        if (lower.includes('year')) return 1.1;
        return 1.0;
    }

    /**
     * Get market conditions adjustment factor
     * @param {string} marketConditions - Market conditions
     * @returns {number} Adjustment factor
     */
    static getMarketAdjustment(marketConditions) {
        switch (marketConditions) {
            case 'bullish': return 1.1;
            case 'bearish': return 0.8;
            case 'volatile': return 0.9;
            case 'neutral': 
            default: return 1.0;
        }
    }

    /**
     * Get risk level adjustment factor
     * @param {string} riskLevel - Risk level
     * @returns {number} Adjustment factor
     */
    static getRiskAdjustment(riskLevel) {
        switch (riskLevel) {
            case 'Low': return 1.05;
            case 'High': return 0.9;
            case 'Medium':
            default: return 1.0;
        }
    }
}

// Initialize global accuracy tracker
const globalAccuracyTracker = new AccuracyTracker();
globalAccuracyTracker.loadFromStorage();

// Export classes for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AccuracyTracker, ConfidenceCalculator };
}