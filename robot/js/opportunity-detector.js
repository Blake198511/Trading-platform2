/**
 * Opportunity Detector
 * Finds trading opportunities from breaking news like:
 * "QBTS, IONQ, RGTI: Quantum Stocks Plunge as Rival Xanadu Eyes U.S. Listing"
 */

class OpportunityDetector {
    constructor() {
        this.opportunities = [];
        
        // Keywords that indicate trading opportunities
        this.opportunityKeywords = {
            // Price movement keywords
            priceMovement: ['plunge', 'surge', 'soar', 'crash', 'rally', 'spike', 'tumble', 'jump', 'skyrocket', 'nosedive'],
            
            // Competitive threats
            competitive: ['rival', 'competitor', 'competition', 'threatens', 'challenges', 'disrupts'],
            
            // Catalysts
            catalysts: ['listing', 'IPO', 'merger', 'acquisition', 'approval', 'contract', 'partnership', 'breakthrough'],
            
            // Sectors to watch
            hotSectors: ['quantum', 'AI', 'artificial intelligence', 'biotech', 'crypto', 'EV', 'electric vehicle', 'semiconductor', 'chip'],
            
            // Negative events (buying opportunities)
            negative: ['plunge', 'crash', 'tumble', 'decline', 'drop', 'fall', 'sink'],
            
            // Positive events
            positive: ['surge', 'soar', 'rally', 'gain', 'rise', 'climb', 'advance']
        };
    }

    /**
     * Analyze news headline for trading opportunities
     */
    analyzeHeadline(headline) {
        const opportunities = [];
        const lowerHeadline = headline.toLowerCase();
        
        // Extract stock symbols (3-5 uppercase letters)
        const symbols = headline.match(/\b[A-Z]{2,5}\b/g) || [];
        
        // Check for price movement
        const hasPriceMovement = this.opportunityKeywords.priceMovement.some(kw => lowerHeadline.includes(kw));
        
        // Check for competitive threats
        const hasCompetitiveThreat = this.opportunityKeywords.competitive.some(kw => lowerHeadline.includes(kw));
        
        // Check for catalysts
        const hasCatalyst = this.opportunityKeywords.catalysts.some(kw => lowerHeadline.includes(kw));
        
        // Check for hot sectors
        const hotSector = this.opportunityKeywords.hotSectors.find(kw => lowerHeadline.includes(kw));
        
        // Check if negative (buying opportunity)
        const isNegative = this.opportunityKeywords.negative.some(kw => lowerHeadline.includes(kw));
        
        // Check if positive
        const isPositive = this.opportunityKeywords.positive.some(kw => lowerHeadline.includes(kw));
        
        // Example: "QBTS, IONQ, RGTI: Quantum Stocks Plunge as Rival Xanadu Eyes U.S. Listing"
        if (symbols.length > 0 && (hasPriceMovement || hasCatalyst || hasCompetitiveThreat)) {
            opportunities.push({
                type: 'NEWS_OPPORTUNITY',
                symbols: symbols,
                headline: headline,
                sector: hotSector || 'General',
                sentiment: isNegative ? 'BEARISH' : isPositive ? 'BULLISH' : 'NEUTRAL',
                opportunityType: this.determineOpportunityType(lowerHeadline, isNegative, hasCompetitiveThreat, hasCatalyst),
                confidence: this.calculateConfidence(symbols.length, hasPriceMovement, hasCatalyst, hotSector),
                actionable: true,
                reasoning: this.generateReasoning(symbols, isNegative, hasCompetitiveThreat, hasCatalyst, hotSector)
            });
        }
        
        return opportunities;
    }

    /**
     * Determine opportunity type
     */
    determineOpportunityType(headline, isNegative, hasCompetitiveThreat, hasCatalyst) {
        if (isNegative && hasCompetitiveThreat) {
            return 'BUY_THE_DIP'; // Stocks plunging due to competitor = buying opportunity
        } else if (isNegative) {
            return 'OVERSOLD'; // Stocks plunging = potential bounce
        } else if (hasCatalyst) {
            return 'CATALYST_PLAY'; // IPO, merger, etc.
        } else if (hasCompetitiveThreat) {
            return 'COMPETITIVE_THREAT'; // Watch for further decline
        } else {
            return 'MOMENTUM_PLAY'; // Riding the trend
        }
    }

    /**
     * Calculate confidence score
     */
    calculateConfidence(symbolCount, hasPriceMovement, hasCatalyst, hotSector) {
        let confidence = 50;
        
        if (symbolCount >= 3) confidence += 15; // Multiple stocks = sector move
        if (hasPriceMovement) confidence += 15; // Clear price action
        if (hasCatalyst) confidence += 10; // Specific catalyst
        if (hotSector) confidence += 10; // Hot sector
        
        return Math.min(confidence, 95);
    }

    /**
     * Generate reasoning for the opportunity
     */
    generateReasoning(symbols, isNegative, hasCompetitiveThreat, hasCatalyst, hotSector) {
        const reasons = [];
        
        if (symbols.length >= 3) {
            reasons.push(`Sector-wide move affecting ${symbols.length} stocks`);
        }
        
        if (isNegative && hasCompetitiveThreat) {
            reasons.push('Stocks oversold due to competitive threat - potential buying opportunity');
            reasons.push('Market may be overreacting to competitor news');
            reasons.push('Established players often recover from competitive threats');
        }
        
        if (hasCatalyst) {
            reasons.push('Catalyst-driven move creates trading opportunity');
        }
        
        if (hotSector) {
            reasons.push(`${hotSector.toUpperCase()} sector has high volatility and recovery potential`);
        }
        
        if (isNegative) {
            reasons.push('Consider buying the dip if fundamentals remain strong');
            reasons.push('Set tight stop losses due to volatility');
        }
        
        return reasons;
    }

    /**
     * Generate trading recommendations from opportunity
     */
    generateRecommendations(opportunity) {
        const recommendations = [];
        
        opportunity.symbols.forEach(symbol => {
            if (opportunity.opportunityType === 'BUY_THE_DIP') {
                // Generate buy recommendation
                recommendations.push({
                    symbol: symbol,
                    action: 'BUY',
                    strategy: 'Buy the Dip',
                    entry: 'Current price (after 10-15% drop)',
                    target: '+20-30% from entry',
                    stopLoss: '-8% from entry',
                    timeframe: '2-4 weeks',
                    confidence: opportunity.confidence,
                    reasoning: [
                        `${symbol} oversold due to ${opportunity.sector} sector news`,
                        'Competitive threats often create buying opportunities',
                        'Market overreaction provides entry point',
                        ...opportunity.reasoning
                    ]
                });
                
                // Also generate options play
                recommendations.push({
                    symbol: symbol,
                    action: 'BUY',
                    strategy: 'Call Options',
                    optionType: 'call',
                    strike: 'At-the-money or slightly OTM',
                    expiration: '30-45 days',
                    confidence: opportunity.confidence - 10,
                    reasoning: [
                        'Leverage recovery bounce with options',
                        'Limited risk, high reward potential',
                        'Expect 50-100% return if stock recovers 15-20%'
                    ]
                });
            } else if (opportunity.opportunityType === 'OVERSOLD') {
                recommendations.push({
                    symbol: symbol,
                    action: 'WATCH',
                    strategy: 'Wait for Reversal Signal',
                    entry: 'After RSI < 30 and showing divergence',
                    target: '+15-25% from entry',
                    stopLoss: '-5% from entry',
                    timeframe: '1-3 weeks',
                    confidence: opportunity.confidence - 15,
                    reasoning: [
                        'Stock oversold, wait for reversal confirmation',
                        'Look for volume spike and green candles',
                        'RSI divergence signals potential bottom'
                    ]
                });
            }
        });
        
        return recommendations;
    }

    /**
     * Scan news for opportunities
     */
    async scanNews(newsItems) {
        const allOpportunities = [];
        
        for (const newsItem of newsItems) {
            const opportunities = this.analyzeHeadline(newsItem.headline || newsItem.title);
            
            opportunities.forEach(opp => {
                opp.source = newsItem.source;
                opp.publishedAt = newsItem.publishedAt || new Date();
                opp.url = newsItem.url;
                
                // Generate recommendations
                opp.recommendations = this.generateRecommendations(opp);
                
                allOpportunities.push(opp);
            });
        }
        
        return allOpportunities;
    }

    /**
     * Example: Process the quantum stocks news
     */
    processQuantumStocksNews() {
        const headline = "QBTS, IONQ, RGTI: Quantum Stocks Plunge as Rival Xanadu Eyes U.S. Listing";
        
        const opportunities = this.analyzeHeadline(headline);
        
        if (opportunities.length > 0) {
            const opp = opportunities[0];
            console.log('🎯 OPPORTUNITY DETECTED!');
            console.log('Symbols:', opp.symbols.join(', '));
            console.log('Type:', opp.opportunityType);
            console.log('Sector:', opp.sector);
            console.log('Confidence:', opp.confidence + '%');
            console.log('Reasoning:', opp.reasoning);
            
            const recs = this.generateRecommendations(opp);
            console.log('\n📊 RECOMMENDATIONS:');
            recs.forEach((rec, i) => {
                console.log(`\n${i + 1}. ${rec.symbol} - ${rec.strategy}`);
                console.log('   Action:', rec.action);
                console.log('   Confidence:', rec.confidence + '%');
            });
            
            return { opportunity: opp, recommendations: recs };
        }
        
        return null;
    }
}

// Create singleton instance
const opportunityDetector = new OpportunityDetector();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = opportunityDetector;
}

// Test with quantum stocks example
console.log('🔍 Opportunity Detector loaded');
console.log('💡 Test: opportunityDetector.processQuantumStocksNews()');
