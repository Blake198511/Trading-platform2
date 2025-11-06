/**
 * Universal Recommendation Card System
 * Creates consistent recommendation displays across all asset classes
 */

class RecommendationCardSystem {
    /**
     * Generate a universal recommendation card
     * @param {Object} recommendation - Recommendation data object
     * @returns {string} HTML string for the recommendation card
     */
    static generateCard(recommendation) {
        const {
            id,
            symbol,
            assetType,
            action,
            entryPrice,
            targetPrice,
            stopLoss,
            confidence,
            riskLevel,
            timeframe,
            riskRewardRatio,
            catalyst,
            description,
            reasoning = [],
            positionSize,
            profitTargets = [],
            companyName = ''
        } = recommendation;

        // Generate asset-specific details
        const assetSpecificHTML = this.generateAssetSpecificDetails(recommendation);

        return `
            <div class="recommendation-card ${assetType.toLowerCase()}" data-rec-id="${id}">
                ${this.generateHeader(symbol, companyName, assetType, action)}
                ${this.generatePricingSection(entryPrice, targetPrice, stopLoss, assetType)}
                ${assetSpecificHTML}
                ${this.generateMetricsSection(confidence, riskLevel, timeframe, riskRewardRatio)}
                ${catalyst ? this.generateCatalystSection(catalyst, description) : ''}
                ${reasoning.length > 0 ? this.generateReasoningSection(reasoning) : ''}
                ${profitTargets.length > 0 ? this.generateProfitTargetsSection(profitTargets, entryPrice) : ''}
                ${positionSize ? this.generatePositionSizingSection(positionSize) : ''}
                ${this.generateStrategySection(recommendation)}
                ${this.generateActionButtons(symbol, assetType)}
            </div>
        `;
    }

    /**
     * Generate card header with symbol and action badge
     */
    static generateHeader(symbol, companyName, assetType, action) {
        return `
            <div class="rec-header">
                <div class="rec-symbol-section">
                    <div class="rec-symbol">${symbol}</div>
                    ${companyName ? `<div class="rec-company-name">${companyName}</div>` : ''}
                    <span class="rec-asset-type">${assetType}</span>
                </div>
                <div class="rec-action-badge ${action.toLowerCase()}">
                    ${action === 'buy' ? '🟢 BUY' : '🔴 SELL'}
                </div>
            </div>
        `;
    }

    /**
     * Generate pricing section with entry, target, and stop-loss
     */
    static generatePricingSection(entryPrice, targetPrice, stopLoss, assetType) {
        const upside = ((targetPrice - entryPrice) / entryPrice * 100).toFixed(1);
        const downside = ((entryPrice - stopLoss) / entryPrice * 100).toFixed(1);

        return `
            <div class="rec-pricing">
                <div class="rec-pricing-grid">
                    <div class="rec-price-item">
                        <div class="rec-price-label">Entry Price</div>
                        <div class="rec-price-value entry">${this.formatPrice(entryPrice, assetType)}</div>
                    </div>
                    <div class="rec-price-item">
                        <div class="rec-price-label">Target Price</div>
                        <div class="rec-price-value target">${this.formatPrice(targetPrice, assetType)}</div>
                        <div style="color: var(--primary-green); font-size: 0.85rem; margin-top: 4px;">
                            +${upside}%
                        </div>
                    </div>
                    <div class="rec-price-item">
                        <div class="rec-price-label">Stop Loss</div>
                        <div class="rec-price-value stop-loss">${this.formatPrice(stopLoss, assetType)}</div>
                        <div style="color: var(--danger); font-size: 0.85rem; margin-top: 4px;">
                            -${downside}%
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate metrics section with confidence, risk, timeframe, and R:R ratio
     */
    static generateMetricsSection(confidence, riskLevel, timeframe, riskRewardRatio) {
        return `
            <div class="rec-metrics">
                <div class="rec-metric-box">
                    <div class="rec-metric-label">Confidence Score</div>
                    <div class="confidence-display">
                        <div class="confidence-bar">
                            <div class="confidence-fill" style="width: ${confidence}%"></div>
                        </div>
                        <div class="confidence-number">${confidence}</div>
                    </div>
                </div>
                <div class="rec-metric-box">
                    <div class="rec-metric-label">Risk Level</div>
                    <div class="rec-metric-value">
                        <span class="risk-badge ${riskLevel.toLowerCase()}">${riskLevel}</span>
                    </div>
                </div>
                <div class="rec-metric-box">
                    <div class="rec-metric-label">Timeframe</div>
                    <div class="rec-metric-value">
                        <div class="timeframe-display">${timeframe}</div>
                    </div>
                </div>
                <div class="rec-metric-box">
                    <div class="rec-metric-label">Risk:Reward Ratio</div>
                    <div class="rec-metric-value">
                        <div class="risk-reward-display">1:${riskRewardRatio.toFixed(1)}</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate catalyst section
     */
    static generateCatalystSection(catalyst, description) {
        return `
            <div class="rec-catalyst">
                <div class="catalyst-title">⚡ Primary Catalyst</div>
                <div class="catalyst-description">
                    <strong>${catalyst}</strong>
                    ${description ? `<br><span style="color: var(--text-gray);">${description}</span>` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Generate reasoning section
     */
    static generateReasoningSection(reasoning) {
        return `
            <div class="rec-reasoning">
                <div class="rec-section-title">💡 Why This Trade</div>
                <ul class="reasoning-list">
                    ${reasoning.map(reason => `
                        <li class="reasoning-item">${reason}</li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    /**
     * Generate profit targets section
     */
    static generateProfitTargetsSection(profitTargets, entryPrice) {
        return `
            <div class="rec-profit-targets">
                <div class="rec-section-title">🎯 Profit Targets</div>
                ${profitTargets.map((target, index) => {
                    const gainPercent = ((target.price - entryPrice) / entryPrice * 100).toFixed(1);
                    return `
                        <div class="profit-target-item">
                            <div class="profit-target-info">
                                <div class="profit-target-label">Target ${index + 1}</div>
                                <div class="profit-target-price">${this.formatPrice(target.price, 'stock')} <span style="color: var(--text-gray); font-size: 0.9rem;">(+${gainPercent}%)</span></div>
                            </div>
                            <div class="profit-target-allocation">
                                <div class="allocation-percent">${target.allocation}%</div>
                                <div class="allocation-label">Sell</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    /**
     * Generate position sizing section
     */
    static generatePositionSizingSection(positionSize) {
        return `
            <div class="position-sizing">
                <div class="rec-section-title">📊 Position Sizing</div>
                <div class="position-size-value">${positionSize}% of portfolio</div>
                <div class="position-size-note">
                    Recommended allocation based on risk tolerance and account size
                </div>
            </div>
        `;
    }

    /**
     * Generate entry/exit strategy section
     */
    static generateStrategySection(recommendation) {
        const { entryPrice, targetPrice, stopLoss, timeframe, assetType } = recommendation;
        
        return `
            <div class="rec-strategy">
                <div class="strategy-title">📋 Entry/Exit Strategy</div>
                <div class="strategy-grid">
                    <div class="strategy-item">
                        <div class="strategy-item-label">Entry Zone</div>
                        <div class="strategy-item-value">${this.formatPrice(entryPrice * 0.98, assetType)} - ${this.formatPrice(entryPrice * 1.02, assetType)}</div>
                    </div>
                    <div class="strategy-item">
                        <div class="strategy-item-label">Exit Target</div>
                        <div class="strategy-item-value" style="color: var(--primary-green);">${this.formatPrice(targetPrice, assetType)}</div>
                    </div>
                    <div class="strategy-item">
                        <div class="strategy-item-label">Stop Loss</div>
                        <div class="strategy-item-value" style="color: var(--danger);">${this.formatPrice(stopLoss, assetType)}</div>
                    </div>
                    <div class="strategy-item">
                        <div class="strategy-item-label">Hold Time</div>
                        <div class="strategy-item-value">${timeframe}</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate asset-specific details (options, crypto, forex)
     */
    static generateAssetSpecificDetails(recommendation) {
        switch (recommendation.assetType.toLowerCase()) {
            case 'option':
                return this.generateOptionsDetails(recommendation);
            case 'crypto':
                return this.generateCryptoDetails(recommendation);
            case 'forex':
                return this.generateForexDetails(recommendation);
            default:
                return '';
        }
    }

    /**
     * Generate options-specific details
     */
    static generateOptionsDetails(recommendation) {
        const {
            optionType,
            strike,
            expiration,
            impliedVolatility,
            delta,
            gamma,
            expectedMove
        } = recommendation;

        if (!optionType) return '';

        return `
            <div class="options-details">
                <div class="rec-section-title">📊 Options Details</div>
                <div class="options-grid">
                    <div class="option-detail">
                        <div class="option-detail-label">Type</div>
                        <div class="option-detail-value">${optionType.toUpperCase()}</div>
                    </div>
                    <div class="option-detail">
                        <div class="option-detail-label">Strike</div>
                        <div class="option-detail-value">$${strike}</div>
                    </div>
                    <div class="option-detail">
                        <div class="option-detail-label">Expiration</div>
                        <div class="option-detail-value">${expiration}</div>
                    </div>
                    <div class="option-detail">
                        <div class="option-detail-label">IV</div>
                        <div class="option-detail-value">${impliedVolatility}%</div>
                    </div>
                </div>
                ${delta || gamma ? `
                    <div class="greeks-display">
                        ${delta ? `
                            <div class="greek-item">
                                <div class="greek-label">Delta</div>
                                <div class="greek-value">${delta}</div>
                            </div>
                        ` : ''}
                        ${gamma ? `
                            <div class="greek-item">
                                <div class="greek-label">Gamma</div>
                                <div class="greek-value">${gamma}</div>
                            </div>
                        ` : ''}
                        ${expectedMove ? `
                            <div class="greek-item">
                                <div class="greek-label">Expected Move</div>
                                <div class="greek-value">${expectedMove}%</div>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Generate crypto-specific details
     */
    static generateCryptoDetails(recommendation) {
        const {
            project,
            sector,
            marketCap,
            networkMetrics
        } = recommendation;

        if (!project) return '';

        return `
            <div class="crypto-metrics">
                ${sector ? `
                    <div class="crypto-metric">
                        <div class="crypto-metric-label">Sector</div>
                        <div class="crypto-metric-value">${sector}</div>
                    </div>
                ` : ''}
                ${marketCap ? `
                    <div class="crypto-metric">
                        <div class="crypto-metric-label">Market Cap</div>
                        <div class="crypto-metric-value">$${(marketCap / 1000000).toFixed(0)}M</div>
                    </div>
                ` : ''}
                ${networkMetrics?.activeUsers ? `
                    <div class="crypto-metric">
                        <div class="crypto-metric-label">Active Users</div>
                        <div class="crypto-metric-value">${this.formatNumber(networkMetrics.activeUsers)}</div>
                    </div>
                ` : ''}
                ${networkMetrics?.transactionVolume ? `
                    <div class="crypto-metric">
                        <div class="crypto-metric-label">TX Volume</div>
                        <div class="crypto-metric-value">$${this.formatNumber(networkMetrics.transactionVolume)}</div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Generate forex-specific details
     */
    static generateForexDetails(recommendation) {
        const {
            baseCurrency,
            quoteCurrency,
            interestRateDiff,
            economicEvents = []
        } = recommendation;

        if (!baseCurrency) return '';

        return `
            <div style="margin: 20px 0;">
                <div class="forex-pair">${baseCurrency}/${quoteCurrency}</div>
                ${interestRateDiff ? `
                    <div style="color: var(--text-gray); margin-bottom: 15px;">
                        Interest Rate Differential: <span style="color: var(--primary-yellow); font-weight: 700;">${interestRateDiff}%</span>
                    </div>
                ` : ''}
                ${economicEvents.length > 0 ? `
                    <div class="economic-events">
                        <div class="rec-section-title">📅 Upcoming Economic Events</div>
                        ${economicEvents.map(event => `
                            <div class="economic-event">
                                <strong>${event.event}</strong>
                                <span class="event-impact ${event.impact.toLowerCase()}">${event.impact}</span>
                                <div style="color: var(--text-gray); font-size: 0.85rem; margin-top: 4px;">
                                    ${event.date} - ${event.country}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Generate action buttons
     */
    static generateActionButtons(symbol, assetType) {
        return `
            <div class="rec-actions">
                <button class="rec-btn rec-btn-primary" onclick="RecommendationCardSystem.handleTrade('${symbol}', '${assetType}')">
                    📈 Trade Now
                </button>
                <button class="rec-btn rec-btn-secondary" onclick="RecommendationCardSystem.handleSetAlert('${symbol}')">
                    🔔 Set Alert
                </button>
                <button class="rec-btn rec-btn-secondary" onclick="RecommendationCardSystem.handleAnalyze('${symbol}')">
                    📊 Analyze
                </button>
                <button class="rec-btn rec-btn-secondary" onclick="RecommendationCardSystem.handleCopy('${symbol}')">
                    📋 Copy Details
                </button>
            </div>
        `;
    }

    /**
     * Format price based on asset type
     */
    static formatPrice(price, assetType) {
        if (assetType === 'crypto' && price < 1) {
            return `$${price.toFixed(6)}`;
        } else if (assetType === 'forex') {
            return price.toFixed(5);
        } else if (price < 1) {
            return `$${price.toFixed(4)}`;
        } else {
            return `$${price.toFixed(2)}`;
        }
    }

    /**
     * Format large numbers with K, M, B suffixes
     */
    static formatNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + 'B';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    /**
     * Render multiple recommendations to a container
     */
    static renderRecommendations(recommendations, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return;
        }

        if (recommendations.length === 0) {
            container.innerHTML = this.generateEmptyState();
            return;
        }

        const html = recommendations.map(rec => this.generateCard(rec)).join('');
        container.innerHTML = html;
    }

    /**
     * Generate empty state
     */
    static generateEmptyState() {
        return `
            <div class="rec-empty-state">
                <div class="rec-empty-icon">📊</div>
                <div class="rec-empty-message">No recommendations available</div>
                <div style="color: var(--text-gray); font-size: 0.9rem;">
                    Check back soon for new trading opportunities
                </div>
            </div>
        `;
    }

    /**
     * Generate loading state
     */
    static generateLoadingState() {
        return `
            <div class="rec-card-loading">
                <div class="rec-spinner"></div>
                <div>Loading recommendations...</div>
            </div>
        `;
    }

    /**
     * Show loading state in container
     */
    static showLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = this.generateLoadingState();
        }
    }

    // Action Handlers
    static handleTrade(symbol, assetType) {
        alert(`Opening ${symbol} (${assetType}) in your broker...`);
    }

    static handleSetAlert(symbol) {
        alert(`Price alert set for ${symbol}`);
    }

    static handleAnalyze(symbol) {
        alert(`Opening detailed analysis for ${symbol}...`);
    }

    static handleCopy(symbol) {
        const card = document.querySelector(`[data-rec-id*="${symbol}"]`);
        if (card) {
            const text = card.innerText;
            navigator.clipboard.writeText(text).then(() => {
                alert(`${symbol} recommendation copied to clipboard!`);
            });
        }
    }
}
