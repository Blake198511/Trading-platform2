// Universal Recommendation Data Models
// Based on the design document specifications

// Base Recommendation Interface
class Recommendation {
    constructor(data) {
        this.id = data.id || this.generateId();
        this.symbol = data.symbol;
        this.assetType = data.assetType; // 'stock' | 'option' | 'crypto' | 'forex'
        this.action = data.action; // 'buy' | 'sell'
        
        // Pricing
        this.entryPrice = data.entryPrice;
        this.targetPrice = data.targetPrice;
        this.stopLoss = data.stopLoss;
        
        // Analysis
        this.confidence = data.confidence; // 1-100
        this.riskLevel = data.riskLevel; // 'Low' | 'Medium' | 'High'
        this.timeframe = data.timeframe;
        this.riskRewardRatio = data.riskRewardRatio;
        
        // Context
        this.catalyst = data.catalyst;
        this.description = data.description;
        this.reasoning = data.reasoning || [];
        
        // Position Management
        this.positionSize = data.positionSize;
        this.profitTargets = data.profitTargets || [];
        
        // Metadata
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
        this.category = data.category;
    }

    generateId() {
        return 'rec_' + Math.random().toString(36).substr(2, 9);
    }

    calculateUpside() {
        return ((this.targetPrice - this.entryPrice) / this.entryPrice * 100).toFixed(1);
    }

    getRiskColor() {
        switch(this.riskLevel) {
            case 'Low': return '#00FF41';
            case 'Medium': return '#FFD700';
            case 'High': return '#FF3333';
            default: return '#B0B0B0';
        }
    }
}

// Profit Target Interface
class ProfitTarget {
    constructor(percentage, price, allocation) {
        this.percentage = percentage; // % gain target
        this.price = price; // target price
        this.allocation = allocation; // % of position to sell
    }
}

// Insider Trade Data Model
class InsiderTrade {
    constructor(data) {
        this.name = data.name;
        this.role = data.role;
        this.category = data.category; // 'politician' | 'hedgefund' | 'bank' | 'insider'
        this.symbol = data.symbol;
        this.action = data.action; // 'buy' | 'sell'
        this.shares = data.shares;
        this.value = data.value;
        this.date = data.date;
        this.price = data.price;
        this.currentPrice = data.currentPrice;
        this.successRate = data.successRate;
        this.avgReturn = data.avgReturn;
        this.confidence = data.confidence;
        this.why = data.why;
        this.strategy = data.strategy || [];
    }

    getGainPercent() {
        return ((this.currentPrice - this.price) / this.price * 100).toFixed(1);
    }

    getGainClass() {
        return this.getGainPercent() >= 0 ? 'profit-positive' : 'profit-negative';
    }

    getCategoryColor() {
        switch(this.category) {
            case 'politician': return 'linear-gradient(90deg, #1E3A8A, #3B82F6)';
            case 'hedgefund': return 'linear-gradient(90deg, #7C3AED, #A78BFA)';
            case 'bank': return 'linear-gradient(90deg, #059669, #10B981)';
            case 'insider': return 'linear-gradient(90deg, #DC2626, #F87171)';
            default: return 'linear-gradient(90deg, #2A2A2A, #4A4A4A)';
        }
    }
}

// Catalyst Data Model
class Catalyst {
    constructor(data) {
        this.symbol = data.symbol;
        this.type = data.type; // 'FDA' | 'earnings' | 'merger' | 'contract' | 'split'
        this.description = data.description;
        this.expectedDate = data.expectedDate;
        this.probability = data.probability;
        this.historicalImpact = data.historicalImpact;
        this.impactLevel = data.impactLevel; // 'Low' | 'Medium' | 'High'
        this.company = data.company;
        this.currentPrice = data.currentPrice;
        this.targetPrice = data.targetPrice;
    }

    getImpactColor() {
        switch(this.impactLevel) {
            case 'High': return '#00FF41';
            case 'Medium': return '#FFD700';
            case 'Low': return '#FF3333';
            default: return '#B0B0B0';
        }
    }

    getDaysUntil() {
        const today = new Date();
        const eventDate = new Date(this.expectedDate);
        const diffTime = eventDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
}

// Biotech Play Data Model
class BiotechPlay {
    constructor(data) {
        this.symbol = data.symbol;
        this.company = data.company;
        this.drugName = data.drugName;
        this.indication = data.indication;
        this.trialPhase = data.trialPhase; // 'Phase1' | 'Phase2' | 'Phase3' | 'FDA Review'
        this.marketSize = data.marketSize;
        this.partnerships = data.partnerships || [];
        this.catalystDates = data.catalystDates || [];
        this.currentPrice = data.currentPrice;
        this.targetPrice = data.targetPrice;
        this.probability = data.probability;
        this.riskLevel = data.riskLevel;
    }

    getPhaseColor() {
        switch(this.trialPhase) {
            case 'FDA Review': return '#00FF41';
            case 'Phase3': return '#FFD700';
            case 'Phase2': return '#FF8C00';
            case 'Phase1': return '#FF3333';
            default: return '#B0B0B0';
        }
    }

    getUpside() {
        return ((this.targetPrice - this.currentPrice) / this.currentPrice * 100).toFixed(1);
    }
}

// Options Recommendation Data Model
class OptionsRecommendation extends Recommendation {
    constructor(data) {
        super(data);
        this.optionType = data.optionType; // 'call' | 'put' | 'spread' | 'straddle' | 'strangle'
        this.strike = data.strike;
        this.expiration = data.expiration;
        this.impliedVolatility = data.impliedVolatility;
        this.timeDecay = data.timeDecay;
        this.delta = data.delta;
        this.gamma = data.gamma;
        this.expectedMove = data.expectedMove;
    }

    getDaysToExpiration() {
        const today = new Date();
        const expDate = new Date(this.expiration);
        const diffTime = expDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    getTimeDecayRisk() {
        const daysLeft = this.getDaysToExpiration();
        if (daysLeft < 7) return 'High';
        if (daysLeft < 30) return 'Medium';
        return 'Low';
    }
}

// Crypto Recommendation Data Model
class CryptoRecommendation extends Recommendation {
    constructor(data) {
        super(data);
        this.project = data.project;
        this.sector = data.sector; // 'Layer1' | 'Layer2' | 'DeFi' | 'IoT' | 'Storage' | 'Computing' | 'Oracle'
        this.marketCap = data.marketCap;
        this.totalSupply = data.totalSupply;
        this.networkMetrics = data.networkMetrics || {};
        this.upcomingEvents = data.upcomingEvents || [];
    }

    getSectorColor() {
        switch(this.sector) {
            case 'Layer1': return '#1E3A8A';
            case 'IoT': return '#059669';
            case 'Storage': return '#7C3AED';
            case 'Computing': return '#DC2626';
            case 'Oracle': return '#EA580C';
            default: return '#6B7280';
        }
    }
}

// Forex Recommendation Data Model
class ForexRecommendation extends Recommendation {
    constructor(data) {
        super(data);
        this.baseCurrency = data.baseCurrency;
        this.quoteCurrency = data.quoteCurrency;
        this.interestRateDiff = data.interestRateDiff;
        this.economicEvents = data.economicEvents || [];
        this.technicalLevels = data.technicalLevels || {};
    }

    getCurrencyPair() {
        return `${this.baseCurrency}/${this.quoteCurrency}`;
    }
}

// Economic Event Data Model
class EconomicEvent {
    constructor(data) {
        this.country = data.country;
        this.event = data.event;
        this.date = data.date;
        this.impact = data.impact; // 'Low' | 'Medium' | 'High'
        this.forecast = data.forecast;
        this.previous = data.previous;
    }

    getImpactColor() {
        switch(this.impact) {
            case 'High': return '#FF3333';
            case 'Medium': return '#FFD700';
            case 'Low': return '#00FF41';
            default: return '#B0B0B0';
        }
    }
}

// News Analysis Data Model
class NewsAnalysis {
    constructor(data) {
        this.headline = data.headline;
        this.source = data.source;
        this.publishedAt = data.publishedAt;
        this.sentiment = data.sentiment; // -1 to 1
        this.impactScore = data.impactScore; // 1-10
        this.affectedSymbols = data.affectedSymbols || [];
        this.category = data.category; // 'earnings' | 'FDA' | 'merger' | 'government' | 'general'
        this.priceImpactPrediction = data.priceImpactPrediction; // expected % move
    }

    getSentimentColor() {
        if (this.sentiment > 0.3) return '#00FF41';
        if (this.sentiment < -0.3) return '#FF3333';
        return '#FFD700';
    }

    getSentimentText() {
        if (this.sentiment > 0.3) return 'Bullish';
        if (this.sentiment < -0.3) return 'Bearish';
        return 'Neutral';
    }
}

// Risk Assessment Data Model
class RiskAssessment {
    constructor(data) {
        this.overallRisk = data.overallRisk; // 'Low' | 'Medium' | 'High'
        this.factors = data.factors || {};
        this.maxLoss = data.maxLoss;
        this.probabilityOfLoss = data.probabilityOfLoss;
    }

    getRiskScore() {
        const factors = this.factors;
        return (
            (factors.volatility || 0) * 0.3 +
            (factors.liquidity || 0) * 0.2 +
            (factors.marketCap || 0) * 0.2 +
            (factors.newsRisk || 0) * 0.15 +
            (factors.technicalRisk || 0) * 0.15
        );
    }
}

// Export all models for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Recommendation,
        ProfitTarget,
        InsiderTrade,
        Catalyst,
        BiotechPlay,
        OptionsRecommendation,
        CryptoRecommendation,
        ForexRecommendation,
        EconomicEvent,
        NewsAnalysis,
        RiskAssessment
    };
}