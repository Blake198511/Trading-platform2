/**
 * Breakthrough Technology Detection System
 * Monitors and analyzes breakthrough technology announcements for trading opportunities
 */

class BreakthroughTechDetector {
    constructor() {
        this.config = window.breakthroughConfig || { get: () => null };
        this.categories = BREAKTHROUGH_CATEGORIES;
        this.sources = TECH_NEWS_SOURCES;
        this.impactScorer = new TechImpactScorer();
        this.credibilityAnalyzer = new CredibilityAnalyzer();
        this.competitorAnalyzer = new CompetitorAnalyzer();
        this.alertManager = new AlertManager();
        this.isMonitoring = false;
        this.detectionInterval = null;
        this.cache = new Map();
    }

    async startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        console.log('🔬 Breakthrough Tech Detector: Monitoring started');
        
        // Initial scan
        await this.scanForBreakthroughs();
        
        // Set up periodic monitoring with configurable interval
        const interval = this.config.get('monitoring.scanInterval') || 15 * 60 * 1000;
        this.detectionInterval = setInterval(() => {
            this.scanForBreakthroughs();
        }, interval);
        
        // Add visibility change listener for resource optimization
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    stopMonitoring() {
        this.isMonitoring = false;
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
        
        // Clean up event listeners and resources
        this.cleanup();
        console.log('🔬 Breakthrough Tech Detector: Monitoring stopped');
    }

    cleanup() {
        // Remove any event listeners
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Clear any cached data older than 1 hour
        this.clearOldCache();
        
        // Reset analyzers if they have cleanup methods
        [this.impactScorer, this.credibilityAnalyzer, this.competitorAnalyzer].forEach(analyzer => {
            if (analyzer && typeof analyzer.cleanup === 'function') {
                analyzer.cleanup();
            }
        });
    }

    clearOldCache() {
        // Implementation for clearing old cached data
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        // Clear any cached announcements older than 1 hour
        // This would be implemented based on your caching strategy
    }

    handleVisibilityChange = () => {
        if (document.hidden && this.isMonitoring) {
            // Pause monitoring when tab is not visible to save resources
            this.pauseMonitoring();
        } else if (!document.hidden && this.wasMonitoring) {
            // Resume monitoring when tab becomes visible
            this.resumeMonitoring();
        }
    }

    pauseMonitoring() {
        this.wasMonitoring = this.isMonitoring;
        this.stopMonitoring();
    }

    resumeMonitoring() {
        if (this.wasMonitoring) {
            this.startMonitoring();
        }
    }

    async scanForBreakthroughs() {
        try {
            const announcements = await this.fetchTechAnnouncements();
            const breakthroughs = [];

            for (const announcement of announcements) {
                const analysis = await this.analyzeAnnouncement(announcement);
                if (analysis.isBreakthrough) {
                    breakthroughs.push(analysis);
                }
            }

            if (breakthroughs.length > 0) {
                this.processBreakthroughs(breakthroughs);
            }

            return breakthroughs;
        } catch (error) {
            console.error('Error scanning for breakthroughs:', error);
            return [];
        }
    }

    async analyzeAnnouncement(announcement) {
        try {
            // Multi-step analysis pipeline with error handling
            const categoryMatch = this.categorizeAnnouncement(announcement);
            
            const [credibilityScore, impactScore, competitorAnalysis] = await Promise.allSettled([
                this.credibilityAnalyzer.analyze(announcement),
                this.impactScorer.calculateImpact(announcement, categoryMatch),
                this.competitorAnalyzer.analyze(announcement)
            ]);
            
            // Extract values or use defaults for failed promises
            const credibility = credibilityScore.status === 'fulfilled' ? credibilityScore.value : 0.5;
            const impact = impactScore.status === 'fulfilled' ? impactScore.value : 0;
            const competitors = competitorAnalysis.status === 'fulfilled' ? competitorAnalysis.value : null;
            
            return {
                ...announcement,
                category: categoryMatch,
                credibilityScore: credibility,
                impactScore: impact,
                competitorAnalysis: competitors,
                isBreakthrough: impact >= 7 && credibility >= 0.7,
                timestamp: new Date().toISOString(),
                analysisErrors: this.getAnalysisErrors([credibilityScore, impactScore, competitorAnalysis])
            };
        } catch (error) {
            console.error('Error analyzing announcement:', error);
            return {
                ...announcement,
                category: null,
                credibilityScore: 0,
                impactScore: 0,
                competitorAnalysis: null,
                isBreakthrough: false,
                timestamp: new Date().toISOString(),
                analysisErrors: ['Analysis failed completely']
            };
        }
    }
    
    getAnalysisErrors(results) {
        return results
            .filter(result => result.status === 'rejected')
            .map(result => result.reason?.message || 'Unknown error');
    }

    categorizeAnnouncement(announcement) {
        const text = `${announcement.title} ${announcement.content}`.toLowerCase();
        
        for (const [category, keywords] of Object.entries(this.categories)) {
            const matches = keywords.filter(keyword => text.includes(keyword.toLowerCase()));
            if (matches.length >= 2) {
                return {
                    category,
                    matchedKeywords: matches,
                    confidence: matches.length / keywords.length
                };
            }
        }
        
        return null;
    }

    async fetchTechAnnouncements() {
        // Simulate fetching from multiple tech news sources
        // In production, this would integrate with real APIs
        return DEMO_TECH_ANNOUNCEMENTS;
    }

    processBreakthroughs(breakthroughs) {
        // Sort by impact score
        breakthroughs.sort((a, b) => b.impactScore - a.impactScore);
        
        // Send alerts for high-impact breakthroughs
        breakthroughs.forEach(breakthrough => {
            if (breakthrough.impactScore >= 8) {
                this.alertManager.sendHighPriorityAlert(breakthrough);
            }
        });

        // Update UI
        this.updateBreakthroughDashboard(breakthroughs);
        
        // Trigger custom event for other systems
        document.dispatchEvent(new CustomEvent('breakthroughsDetected', {
            detail: { breakthroughs }
        }));
    }

    updateBreakthroughDashboard(breakthroughs) {
        const container = document.getElementById('breakthroughResults');
        if (!container) return;

        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        
        breakthroughs.forEach(breakthrough => {
            const cardElement = this.createBreakthroughCardElement(breakthrough);
            fragment.appendChild(cardElement);
        });
        
        // Clear and append in one operation
        container.innerHTML = '';
        container.appendChild(fragment);
    }
    
    createBreakthroughCardElement(breakthrough) {
        const cardDiv = document.createElement('div');
        cardDiv.className = `breakthrough-card impact-${Math.floor(breakthrough.impactScore)}`;
        cardDiv.innerHTML = this.renderBreakthroughCard(breakthrough);
        return cardDiv;
    }

    renderBreakthroughCard(breakthrough) {
        const { company, title, category, impactScore, credibilityScore, stockSymbol, competitorAnalysis } = breakthrough;
        
        return `
            <div class="breakthrough-card impact-${Math.floor(impactScore)}">
                <div class="breakthrough-header">
                    <div class="company-info">
                        <div class="company-name">${company}</div>
                        <div class="stock-symbol">${stockSymbol || 'N/A'}</div>
                    </div>
                    <div class="impact-badge">Impact: ${impactScore}/10</div>
                </div>
                <div class="breakthrough-title">${title}</div>
                <div class="category-tag">${category.category}</div>
                <div class="metrics">
                    <div class="metric">
                        <span>Credibility:</span>
                        <span class="score">${Math.round(credibilityScore * 100)}%</span>
                    </div>
                    <div class="metric">
                        <span>Timeline:</span>
                        <span>${breakthrough.timeline || '2-5 years'}</span>
                    </div>
                </div>
                ${competitorAnalysis ? this.renderCompetitorImpact(competitorAnalysis) : ''}
            </div>`;
    }

    renderCompetitorImpact(analysis) {
        return `
            <div class="competitor-impact">
                <h4>Market Impact</h4>
                <div class="affected-stocks">
                    ${analysis.affectedStocks.map(stock => 
                        `<span class="stock-tag ${stock.impact}">${stock.symbol}</span>`
                    ).join('')}
                </div>
            </div>`;
    }
}

// Supporting classes for the breakthrough detection system

class TechImpactScorer {
    async calculateImpact(announcement, categoryMatch) {
        if (!categoryMatch) return 0;
        
        let score = 5; // Base score
        
        // Category-specific scoring
        const categoryMultipliers = {
            'quantum-computing': 1.8,
            'ai-ml': 1.6,
            'semiconductor': 1.5,
            'energy-battery': 1.7,
            'biotechnology': 1.4,
            'materials-science': 1.3
        };
        
        score *= (categoryMultipliers[categoryMatch.category] || 1.0);
        
        // Market cap consideration
        if (announcement.marketCap > 100e9) score += 1; // Large cap
        if (announcement.marketCap < 10e9) score += 0.5; // Small cap bonus
        
        // Technical indicators
        if (announcement.content.includes('breakthrough')) score += 1;
        if (announcement.content.includes('revolutionary')) score += 1;
        if (announcement.content.includes('first-ever')) score += 1.5;
        
        return Math.min(Math.max(score, 0), 10);
    }
}

class CredibilityAnalyzer {
    async analyze(announcement) {
        let credibility = 0.5; // Base credibility
        
        // Source credibility
        const highCredibilitySources = ['nature', 'science', 'ieee', 'official press release'];
        if (highCredibilitySources.some(source => 
            announcement.source.toLowerCase().includes(source))) {
            credibility += 0.3;
        }
        
        // Technical detail presence
        if (announcement.content.length > 500) credibility += 0.1;
        if (announcement.content.includes('peer-reviewed')) credibility += 0.2;
        if (announcement.content.includes('clinical trial')) credibility += 0.2;
        
        // Hype detection (reduces credibility)
        const hypeWords = ['revolutionary', 'game-changing', 'disrupting'];
        const hypeCount = hypeWords.filter(word => 
            announcement.content.toLowerCase().includes(word)).length;
        credibility -= (hypeCount * 0.05);
        
        return Math.min(Math.max(credibility, 0), 1);
    }
}

class CompetitorAnalyzer {
    async analyze(announcement) {
        // Simulate competitor analysis
        const competitors = this.getCompetitors(announcement.company);
        const affectedStocks = competitors.map(competitor => ({
            symbol: competitor.symbol,
            impact: this.calculateCompetitorImpact(announcement, competitor)
        }));
        
        return {
            directCompetitors: competitors,
            affectedStocks,
            supplyChainImpact: this.analyzeSupplyChain(announcement)
        };
    }
    
    getCompetitors(company) {
        const competitorMap = {
            'NVIDIA': [{ symbol: 'AMD', name: 'AMD' }, { symbol: 'INTC', name: 'Intel' }],
            'Tesla': [{ symbol: 'GM', name: 'General Motors' }, { symbol: 'F', name: 'Ford' }],
            'Apple': [{ symbol: 'GOOGL', name: 'Google' }, { symbol: 'MSFT', name: 'Microsoft' }]
        };
        
        return competitorMap[company] || [];
    }
    
    calculateCompetitorImpact(announcement, competitor) {
        // Analyze competitor impact based on announcement content and competitor profile
        const impactFactors = {
            directCompetition: announcement.category?.category === competitor.primarySector ? 0.8 : 0.3,
            marketShare: competitor.marketShare || 0.1,
            innovationGap: this.assessInnovationGap(announcement, competitor)
        };
        
        const impactScore = (impactFactors.directCompetition * impactFactors.marketShare * impactFactors.innovationGap);
        
        if (impactScore > 0.6) return 'negative';
        if (impactScore > 0.3) return 'neutral';
        return 'positive';
    }
    
    assessInnovationGap(announcement, competitor) {
        // Simple heuristic based on announcement significance
        const significanceKeywords = ['breakthrough', 'revolutionary', 'first-ever'];
        const hasSignificance = significanceKeywords.some(keyword => 
            announcement.content.toLowerCase().includes(keyword));
        return hasSignificance ? 1.2 : 0.8;
    }
    
    analyzeSupplyChain(announcement) {
        // Extract supply chain implications from announcement content
        const supplyChainKeywords = {
            suppliers: ['semiconductor', 'chip', 'manufacturing', 'materials'],
            beneficiaries: ['software', 'platform', 'integration', 'services']
        };
        
        const content = announcement.content.toLowerCase();
        
        return {
            suppliers: supplyChainKeywords.suppliers.filter(keyword => content.includes(keyword)),
            beneficiaries: supplyChainKeywords.beneficiaries.filter(keyword => content.includes(keyword)),
            riskFactors: this.identifyRiskFactors(announcement)
        };
    }
    
    identifyRiskFactors(announcement) {
        const riskKeywords = ['regulatory', 'approval', 'trial', 'patent'];
        return riskKeywords.filter(keyword => 
            announcement.content.toLowerCase().includes(keyword));
    }
}

class AlertManager {
    sendHighPriorityAlert(breakthrough) {
        console.log(`🚨 HIGH IMPACT BREAKTHROUGH: ${breakthrough.company} - ${breakthrough.title}`);
        
        // In production, this would send actual notifications
        if (window.Notification && Notification.permission === 'granted') {
            new Notification(`Breakthrough Alert: ${breakthrough.company}`, {
                body: breakthrough.title,
                icon: '/favicon.ico'
            });
        }
    }
}

// Configuration and demo data

const BREAKTHROUGH_CATEGORIES = {
    'quantum-computing': [
        'quantum', 'qubit', 'quantum supremacy', 'quantum error correction',
        'quantum entanglement', 'quantum processor', 'quantum advantage'
    ],
    'ai-ml': [
        'artificial intelligence', 'machine learning', 'neural network',
        'deep learning', 'transformer', 'GPT', 'large language model',
        'computer vision', 'natural language processing'
    ],
    'semiconductor': [
        'chip', 'processor', '3nm', '2nm', 'semiconductor', 'wafer',
        'lithography', 'transistor', 'silicon', 'TSMC', 'foundry'
    ],
    'energy-battery': [
        'battery', 'solid-state', 'lithium', 'energy density',
        'charging', 'solar', 'fusion', 'renewable', 'grid storage'
    ],
    'biotechnology': [
        'gene therapy', 'CRISPR', 'biotech', 'pharmaceutical',
        'clinical trial', 'FDA approval', 'drug discovery', 'personalized medicine'
    ],
    'materials-science': [
        'graphene', 'superconductor', 'metamaterial', 'nanotechnology',
        'carbon nanotube', 'advanced materials', 'composite'
    ]
};

const TECH_NEWS_SOURCES = [
    'TechCrunch', 'Wired', 'MIT Technology Review', 'Nature',
    'Science', 'IEEE Spectrum', 'Ars Technica', 'The Verge'
];

const DEMO_TECH_ANNOUNCEMENTS = [
    {
        id: 1,
        company: 'NVIDIA',
        stockSymbol: 'NVDA',
        title: 'NVIDIA Announces Revolutionary Quantum-AI Hybrid Processor',
        content: 'NVIDIA today unveiled its breakthrough quantum-AI hybrid processor that combines traditional GPU architecture with quantum computing elements. The new chip demonstrates quantum advantage in machine learning tasks, potentially revolutionizing AI training speeds by 1000x.',
        source: 'Official Press Release',
        timestamp: '2024-11-06T10:00:00Z',
        marketCap: 2800e9,
        timeline: '2-3 years'
    },
    {
        id: 2,
        company: 'Tesla',
        stockSymbol: 'TSLA',
        title: 'Tesla Achieves Solid-State Battery Breakthrough with 1000-Mile Range',
        content: 'Tesla researchers have successfully developed a solid-state battery technology that enables 1000-mile range for electric vehicles with 5-minute charging times. The breakthrough uses a novel lithium-metal anode design.',
        source: 'Nature Energy Journal',
        timestamp: '2024-11-06T08:30:00Z',
        marketCap: 800e9,
        timeline: '3-5 years'
    },
    {
        id: 3,
        company: 'Moderna',
        stockSymbol: 'MRNA',
        title: 'Moderna Develops Universal Cancer Vaccine Using AI-Designed Antigens',
        content: 'Moderna announces successful Phase II trials of its universal cancer vaccine that uses AI-designed neoantigens. The treatment shows 95% efficacy across multiple cancer types.',
        source: 'New England Journal of Medicine',
        timestamp: '2024-11-06T07:15:00Z',
        marketCap: 45e9,
        timeline: '5-7 years'
    }
];

// Initialize the breakthrough detector
const breakthroughDetector = new BreakthroughTechDetector();

// Global functions for UI integration
window.startBreakthroughMonitoring = () => breakthroughDetector.startMonitoring();
window.stopBreakthroughMonitoring = () => breakthroughDetector.stopMonitoring();
window.scanBreakthroughs = () => breakthroughDetector.scanForBreakthroughs();

// Auto-start monitoring when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Request notification permission
    if (window.Notification && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Start monitoring after a short delay
    setTimeout(() => {
        breakthroughDetector.startMonitoring();
    }, 2000);
});

console.log('🔬 Breakthrough Technology Detector loaded and ready');