// News Analysis and Catalyst Tracking Models
// Data models for news processing and catalyst monitoring

// NewsAnalysis class for processing and scoring news items
class NewsAnalysis {
    constructor(data) {
        this.id = data.id || this.generateId();
        this.headline = data.headline;
        this.source = data.source;
        this.publishedAt = new Date(data.publishedAt);
        this.content = data.content || '';
        this.url = data.url || '';
        
        // Sentiment analysis (-1 to 1)
        this.sentiment = data.sentiment || 0;
        
        // Impact scoring (1-10)
        this.impactScore = data.impactScore || 5;
        
        // Affected symbols
        this.affectedSymbols = data.affectedSymbols || [];
        
        // News categorization
        this.category = data.category || 'general';
        
        // Price impact prediction (expected % move)
        this.priceImpactPrediction = data.priceImpactPrediction || 0;
        
        // Processing metadata
        this.processedAt = new Date();
        this.confidence = data.confidence || 0.5;
    }

    generateId() {
        return 'news_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Calculate sentiment class for UI display
    getSentimentClass() {
        if (this.sentiment > 0.3) return 'profit-positive';
        if (this.sentiment < -0.3) return 'profit-negative';
        return 'neutral';
    }

    // Get impact level for display
    getImpactLevel() {
        if (this.impactScore >= 8) return 'High';
        if (this.impactScore >= 5) return 'Medium';
        return 'Low';
    }

    // Get impact class for styling
    getImpactClass() {
        const level = this.getImpactLevel();
        if (level === 'High') return 'profit-positive';
        if (level === 'Medium') return 'warning';
        return 'profit-negative';
    }

    // Format published date for display
    getFormattedDate() {
        const now = new Date();
        const diffMs = now - this.publishedAt;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return this.publishedAt.toLocaleDateString();
    }

    // Get category display name
    getCategoryDisplay() {
        const categories = {
            'fda': '💊 FDA',
            'earnings': '📊 Earnings',
            'merger': '🤝 M&A',
            'government': '🏛️ Government',
            'contract': '📋 Contract',
            'regulatory': '⚖️ Regulatory',
            'clinical': '🧪 Clinical',
            'partnership': '🤝 Partnership',
            'general': '📰 General'
        };
        return categories[this.category] || '📰 News';
    }

    // Check if news is breaking (within last 2 hours)
    isBreaking() {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        return this.publishedAt > twoHoursAgo;
    }

    // Get recommendation based on sentiment and impact
    getRecommendation() {
        if (this.sentiment > 0.5 && this.impactScore >= 7) {
            return {
                action: 'Strong Buy Signal',
                class: 'profit-positive',
                reasoning: 'Highly positive news with significant impact potential'
            };
        } else if (this.sentiment > 0.2 && this.impactScore >= 5) {
            return {
                action: 'Buy Signal',
                class: 'profit-positive',
                reasoning: 'Positive news with moderate impact'
            };
        } else if (this.sentiment < -0.5 && this.impactScore >= 7) {
            return {
                action: 'Strong Sell Signal',
                class: 'profit-negative',
                reasoning: 'Highly negative news with significant impact'
            };
        } else if (this.sentiment < -0.2 && this.impactScore >= 5) {
            return {
                action: 'Sell Signal',
                class: 'profit-negative',
                reasoning: 'Negative news with moderate impact'
            };
        } else {
            return {
                action: 'Monitor',
                class: 'neutral',
                reasoning: 'Mixed or low-impact news - watch for developments'
            };
        }
    }
}

// Catalyst class for tracking upcoming events
class Catalyst {
    constructor(data) {
        this.id = data.id || this.generateId();
        this.symbol = data.symbol;
        this.company = data.company;
        this.type = data.type; // 'FDA', 'earnings', 'merger', 'contract', etc.
        this.description = data.description;
        this.expectedDate = new Date(data.expectedDate);
        
        // Probability scoring (0-100)
        this.probability = data.probability || 50;
        
        // Impact assessment
        this.impactLevel = data.impactLevel || 'Medium'; // Low, Medium, High
        this.historicalImpact = data.historicalImpact || 0; // Average % move for similar events
        
        // Price targets
        this.currentPrice = data.currentPrice || 0;
        this.targetPrice = data.targetPrice || 0;
        this.bearCasePrice = data.bearCasePrice || 0;
        
        // Risk assessment
        this.riskFactors = data.riskFactors || [];
        this.confidence = data.confidence || 0.5;
        
        // Metadata
        this.createdAt = new Date();
        this.lastUpdated = new Date();
        this.source = data.source || 'Internal Analysis';
    }

    generateId() {
        return 'catalyst_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Calculate days until catalyst
    getDaysUntil() {
        const now = new Date();
        const diffMs = this.expectedDate - now;
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

    // Get urgency level based on days until event
    getUrgencyLevel() {
        const days = this.getDaysUntil();
        if (days <= 3) return 'Immediate';
        if (days <= 7) return 'This Week';
        if (days <= 30) return 'This Month';
        return 'Future';
    }

    // Get urgency class for styling
    getUrgencyClass() {
        const urgency = this.getUrgencyLevel();
        if (urgency === 'Immediate') return 'profit-negative';
        if (urgency === 'This Week') return 'warning';
        return 'profit-positive';
    }

    // Calculate potential upside
    getUpside() {
        if (this.currentPrice && this.targetPrice) {
            return ((this.targetPrice - this.currentPrice) / this.currentPrice * 100).toFixed(1);
        }
        return 0;
    }

    // Calculate potential downside
    getDownside() {
        if (this.currentPrice && this.bearCasePrice) {
            return ((this.bearCasePrice - this.currentPrice) / this.currentPrice * 100).toFixed(1);
        }
        return 0;
    }

    // Get impact class for styling
    getImpactClass() {
        if (this.impactLevel === 'High') return 'profit-positive';
        if (this.impactLevel === 'Medium') return 'warning';
        return 'profit-negative';
    }

    // Get probability class for styling
    getProbabilityClass() {
        if (this.probability >= 75) return 'profit-positive';
        if (this.probability >= 50) return 'warning';
        return 'profit-negative';
    }

    // Get type display with emoji
    getTypeDisplay() {
        const types = {
            'FDA': '💊 FDA Approval',
            'earnings': '📊 Earnings',
            'merger': '🤝 Merger/Acquisition',
            'contract': '📋 Government Contract',
            'regulatory': '⚖️ Regulatory Decision',
            'clinical': '🧪 Clinical Trial',
            'partnership': '🤝 Partnership',
            'split': '✂️ Stock Split',
            'dividend': '💰 Special Dividend',
            'spinoff': '🔄 Spin-off'
        };
        return types[this.type] || '📅 Event';
    }

    // Check if catalyst is overdue
    isOverdue() {
        return this.getDaysUntil() < 0;
    }

    // Get formatted expected date
    getFormattedDate() {
        return this.expectedDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    // Calculate risk-adjusted return
    getRiskAdjustedReturn() {
        const upside = parseFloat(this.getUpside());
        const downside = Math.abs(parseFloat(this.getDownside()));
        const probabilityDecimal = this.probability / 100;
        
        return (upside * probabilityDecimal - downside * (1 - probabilityDecimal)).toFixed(1);
    }

    // Get trading strategy recommendation
    getTradingStrategy() {
        const days = this.getDaysUntil();
        const upside = parseFloat(this.getUpside());
        const probability = this.probability;

        if (probability >= 75 && upside >= 20) {
            return {
                strategy: 'Strong Buy',
                reasoning: 'High probability, high reward catalyst',
                positionSize: '3-5% of portfolio',
                timeframe: `Hold until ${this.getFormattedDate()}`
            };
        } else if (probability >= 60 && upside >= 10) {
            return {
                strategy: 'Moderate Buy',
                reasoning: 'Good probability with decent upside',
                positionSize: '2-3% of portfolio',
                timeframe: `Monitor closely until ${this.getFormattedDate()}`
            };
        } else if (probability >= 40 && upside >= 15) {
            return {
                strategy: 'Speculative Play',
                reasoning: 'Lower probability but high reward potential',
                positionSize: '1-2% of portfolio',
                timeframe: 'High risk - consider options instead'
            };
        } else {
            return {
                strategy: 'Monitor Only',
                reasoning: 'Low probability or limited upside',
                positionSize: 'Watch list only',
                timeframe: 'Wait for better entry or higher probability'
            };
        }
    }
}

// Export classes for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NewsAnalysis, Catalyst };
} else {
    // Browser environment
    window.NewsAnalysis = NewsAnalysis;
    window.Catalyst = Catalyst;
}