// Confidence and Accuracy Integration
// Integration functions for Task 7.2

/**
 * Enhanced recommendation generator with confidence and accuracy tracking
 */
class EnhancedRecommendationGenerator {
    
    /**
     * Generate recommendation with confidence score and historical performance
     * @param {Object} recommendationData - Base recommendation data
     * @returns {Object} Enhanced recommendation with confidence and accuracy data
     */
    static generateEnhancedRecommendation(recommendationData) {
        // Calculate confidence score
        const confidence = ConfidenceCalculator.calculateConfidence({
            technicalAnalysis: recommendationData.technicalAnalysis,
            fundamentalAnalysis: recommendationData.fundamentalAnalysis,
            newsAnalysis: recommendationData.newsAnalysis,
            marketConditions: recommendationData.marketConditions,
            historicalAccuracy: this.getHistoricalAccuracy(recommendationData),
            riskAssessment: recommendationData.riskAssessment,
            volumeAnalysis: recommendationData.volumeAnalysis,
            catalystStrength: recommendationData.catalystStrength
        });

        // Calculate success probability
        const successProbability = ConfidenceCalculator.calculateSuccessProbability({
            confidence: confidence,
            timeframe: recommendationData.timeframe,
            historicalAccuracy: this.getHistoricalAccuracy(recommendationData),
            marketConditions: recommendationData.marketConditions?.overallTrend,
            riskLevel: recommendationData.riskAssessment?.overallRisk
        });

        // Get similar historical setups
        const similarSetups = globalAccuracyTracker.getSimilarSetups(recommendationData);

        // Enhanced recommendation object
        const enhancedRecommendation = {
            ...recommendationData,
            confidence: confidence,
            successProbability: successProbability,
            historicalPerformance: this.formatHistoricalPerformance(similarSetups),
            accuracyStats: this.getAccuracyStats(recommendationData),
            confidenceCalibration: this.getConfidenceCalibration(confidence),
            trackingId: this.generateTrackingId()
        };

        // Record for tracking
        globalAccuracyTracker.recordRecommendation(enhancedRecommendation);

        return enhancedRecommendation;
    }

    /**
     * Get historical accuracy for similar recommendation types
     * @param {Object} recommendationData - Recommendation data
     * @returns {Object} Historical accuracy data
     */
    static getHistoricalAccuracy(recommendationData) {
        return globalAccuracyTracker.getAccuracyByType(
            recommendationData.assetType,
            recommendationData.category
        );
    }

    /**
     * Format historical performance data for display
     * @param {Array} similarSetups - Similar historical recommendations
     * @returns {Object} Formatted historical performance
     */
    static formatHistoricalPerformance(similarSetups) {
        if (similarSetups.length === 0) {
            return {
                count: 0,
                avgReturn: 0,
                successRate: 0,
                avgTimeToTarget: 0,
                examples: []
            };
        }

        const successful = similarSetups.filter(setup => setup.success);
        const avgReturn = successful.length > 0 
            ? successful.reduce((sum, setup) => sum + setup.actualReturn, 0) / successful.length
            : 0;
        const avgTimeToTarget = successful.length > 0
            ? successful.reduce((sum, setup) => sum + setup.timeToComplete, 0) / successful.length
            : 0;

        return {
            count: similarSetups.length,
            avgReturn: Math.round(avgReturn * 100) / 100,
            successRate: Math.round((successful.length / similarSetups.length) * 100),
            avgTimeToTarget: Math.round(avgTimeToTarget),
            examples: similarSetups.slice(0, 3).map(setup => ({
                symbol: setup.symbol,
                return: setup.actualReturn,
                daysToTarget: setup.timeToComplete,
                success: setup.success,
                date: setup.createdAt
            }))
        };
    }

    /**
     * Get accuracy statistics for recommendation type
     * @param {Object} recommendationData - Recommendation data
     * @returns {Object} Accuracy statistics
     */
    static getAccuracyStats(recommendationData) {
        const typeStats = globalAccuracyTracker.getAccuracyByType(
            recommendationData.assetType,
            recommendationData.category
        );
        const overallStats = globalAccuracyTracker.getOverallAccuracy();

        return {
            typeAccuracy: typeStats.accuracy,
            overallAccuracy: overallStats.overallAccuracy,
            sampleSize: typeStats.totalRecommendations,
            avgReturn: typeStats.avgReturn,
            avgTimeToTarget: typeStats.avgDaysToTarget
        };
    }

    /**
     * Get confidence calibration data
     * @param {number} confidence - Confidence score
     * @returns {Object} Confidence calibration data
     */
    static getConfidenceCalibration(confidence) {
        const bucket = Math.floor(confidence / 10) * 10;
        const calibrationData = globalAccuracyTracker.confidenceCalibration.get(bucket);

        if (!calibrationData || calibrationData.total === 0) {
            return {
                expectedAccuracy: confidence,
                actualAccuracy: null,
                sampleSize: 0,
                calibrated: true
            };
        }

        const actualAccuracy = (calibrationData.successful / calibrationData.total) * 100;
        const calibrated = Math.abs(actualAccuracy - confidence) <= 10;

        return {
            expectedAccuracy: confidence,
            actualAccuracy: Math.round(actualAccuracy),
            sampleSize: calibrationData.total,
            calibrated: calibrated
        };
    }

    /**
     * Generate unique tracking ID
     * @returns {string} Unique tracking ID
     */
    static generateTrackingId() {
        return 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Update recommendation outcome
     * @param {string} trackingId - Tracking ID of the recommendation
     * @param {Object} outcomeData - Outcome data
     */
    static updateRecommendationOutcome(trackingId, outcomeData) {
        globalAccuracyTracker.updateOutcome(trackingId, outcomeData);
    }
}

/**
 * Confidence and accuracy display utilities
 */
class ConfidenceDisplayUtils {
    
    /**
     * Generate confidence score HTML
     * @param {number} confidence - Confidence score (1-100)
     * @param {Object} calibration - Confidence calibration data
     * @returns {string} HTML for confidence display
     */
    static generateConfidenceHTML(confidence, calibration = {}) {
        const confidenceClass = this.getConfidenceClass(confidence);
        const calibrationText = calibration.calibrated ? '✓ Calibrated' : '⚠ Check History';
        
        return `
            <div class="confidence-score">
                <div class="score-label">
                    Confidence Score
                    ${calibration.sampleSize > 0 ? `<span class="calibration-indicator ${calibration.calibrated ? 'calibrated' : 'uncalibrated'}">${calibrationText}</span>` : ''}
                </div>
                <div class="score-bar">
                    <div class="score-fill ${confidenceClass}" style="width: ${confidence}%"></div>
                </div>
                <div class="score-value ${confidenceClass}">${confidence}/100</div>
            </div>
        `;
    }

    /**
     * Generate success probability HTML
     * @param {Object} successProbability - Success probability data
     * @returns {string} HTML for success probability display
     */
    static generateSuccessProbabilityHTML(successProbability) {
        return `
            <div class="success-probability">
                <div class="probability-header">
                    <span class="probability-label">Success Probability</span>
                    <span class="probability-value">${successProbability.overall}%</span>
                </div>
                <div class="probability-breakdown">
                    <div class="timeframe-prob">
                        <span class="timeframe-label">Short-term (1-7 days):</span>
                        <span class="timeframe-value">${successProbability.shortTerm}%</span>
                    </div>
                    <div class="timeframe-prob">
                        <span class="timeframe-label">Medium-term (1-4 weeks):</span>
                        <span class="timeframe-value">${successProbability.mediumTerm}%</span>
                    </div>
                    <div class="timeframe-prob">
                        <span class="timeframe-label">Long-term (1-6 months):</span>
                        <span class="timeframe-value">${successProbability.longTerm}%</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate historical performance HTML
     * @param {Object} historicalPerformance - Historical performance data
     * @returns {string} HTML for historical performance display
     */
    static generateHistoricalPerformanceHTML(historicalPerformance) {
        if (historicalPerformance.count === 0) {
            return `
                <div class="historical-performance">
                    <div class="performance-header">📊 Historical Performance</div>
                    <div class="no-history">No similar setups found in history</div>
                </div>
            `;
        }

        const examplesHTML = historicalPerformance.examples.map(example => `
            <div class="performance-example">
                <span class="example-symbol">${example.symbol}</span>
                <span class="example-return ${example.success ? 'profit-positive' : 'profit-negative'}">
                    ${example.success ? '+' : ''}${example.return}%
                </span>
                <span class="example-days">${example.daysToTarget}d</span>
            </div>
        `).join('');

        return `
            <div class="historical-performance">
                <div class="performance-header">📊 Historical Performance (${historicalPerformance.count} similar setups)</div>
                <div class="performance-stats">
                    <div class="stat-item">
                        <span class="stat-label">Success Rate:</span>
                        <span class="stat-value ${historicalPerformance.successRate >= 60 ? 'profit-positive' : 'profit-negative'}">
                            ${historicalPerformance.successRate}%
                        </span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Avg Return:</span>
                        <span class="stat-value ${historicalPerformance.avgReturn >= 0 ? 'profit-positive' : 'profit-negative'}">
                            ${historicalPerformance.avgReturn >= 0 ? '+' : ''}${historicalPerformance.avgReturn}%
                        </span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Avg Time:</span>
                        <span class="stat-value">${historicalPerformance.avgTimeToTarget} days</span>
                    </div>
                </div>
                ${historicalPerformance.examples.length > 0 ? `
                    <div class="performance-examples">
                        <div class="examples-header">Recent Examples:</div>
                        ${examplesHTML}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Generate accuracy statistics HTML
     * @param {Object} accuracyStats - Accuracy statistics
     * @returns {string} HTML for accuracy statistics display
     */
    static generateAccuracyStatsHTML(accuracyStats) {
        return `
            <div class="accuracy-stats">
                <div class="accuracy-header">🎯 Accuracy Statistics</div>
                <div class="accuracy-grid">
                    <div class="accuracy-item">
                        <div class="accuracy-label">This Type</div>
                        <div class="accuracy-value ${accuracyStats.typeAccuracy >= 60 ? 'profit-positive' : 'profit-negative'}">
                            ${accuracyStats.typeAccuracy}%
                        </div>
                        <div class="accuracy-sample">(${accuracyStats.sampleSize} trades)</div>
                    </div>
                    <div class="accuracy-item">
                        <div class="accuracy-label">Overall</div>
                        <div class="accuracy-value ${accuracyStats.overallAccuracy >= 60 ? 'profit-positive' : 'profit-negative'}">
                            ${accuracyStats.overallAccuracy}%
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get confidence class for styling
     * @param {number} confidence - Confidence score
     * @returns {string} CSS class name
     */
    static getConfidenceClass(confidence) {
        if (confidence >= 80) return 'confidence-high';
        if (confidence >= 60) return 'confidence-medium';
        return 'confidence-low';
    }

    /**
     * Generate complete enhanced recommendation card
     * @param {Object} recommendation - Enhanced recommendation object
     * @returns {string} Complete HTML for enhanced recommendation card
     */
    static generateEnhancedRecommendationCard(recommendation) {
        const confidenceHTML = this.generateConfidenceHTML(recommendation.confidence, recommendation.confidenceCalibration);
        const probabilityHTML = this.generateSuccessProbabilityHTML(recommendation.successProbability);
        const historicalHTML = this.generateHistoricalPerformanceHTML(recommendation.historicalPerformance);
        const accuracyHTML = this.generateAccuracyStatsHTML(recommendation.accuracyStats);

        return `
            <div class="enhanced-recommendation-card" data-tracking-id="${recommendation.trackingId}">
                <!-- Existing recommendation content -->
                <div class="recommendation-header">
                    <div class="symbol-info">
                        <div class="symbol">${recommendation.symbol}</div>
                        <div class="action ${recommendation.action}">${recommendation.action.toUpperCase()}</div>
                    </div>
                    <div class="price-info">
                        <div class="entry-price">Entry: ${recommendation.entryPrice}</div>
                        <div class="target-price">Target: ${recommendation.targetPrice}</div>
                    </div>
                </div>

                <!-- Enhanced confidence and accuracy section -->
                <div class="confidence-accuracy-section">
                    ${confidenceHTML}
                    ${probabilityHTML}
                    ${accuracyHTML}
                    ${historicalHTML}
                </div>

                <!-- Action buttons -->
                <div class="action-buttons">
                    <button class="btn btn-primary btn-small" onclick="openBrokerLink('${recommendation.symbol}')">
                        📱 Trade ${recommendation.symbol}
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="trackRecommendationOutcome('${recommendation.trackingId}')">
                        📊 Track Outcome
                    </button>
                </div>
            </div>
        `;
    }
}

/**
 * Outcome tracking utilities
 */
class OutcomeTracker {
    
    /**
     * Show outcome tracking modal
     * @param {string} trackingId - Tracking ID of the recommendation
     */
    static showOutcomeModal(trackingId) {
        const recommendation = globalAccuracyTracker.recommendations.get(trackingId);
        if (!recommendation) {
            alert('Recommendation not found');
            return;
        }

        const modalHTML = `
            <div class="outcome-modal" id="outcomeModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Track Recommendation Outcome</h3>
                        <span class="close" onclick="closeOutcomeModal()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="recommendation-summary">
                            <strong>${recommendation.symbol}</strong> - ${recommendation.action.toUpperCase()}
                            <br>Entry: ${recommendation.entryPrice} | Target: ${recommendation.targetPrice}
                            <br>Date: ${new Date(recommendation.createdAt).toLocaleDateString()}
                        </div>
                        
                        <form id="outcomeForm">
                            <div class="form-group">
                                <label>Current Price:</label>
                                <input type="number" id="currentPrice" step="0.01" required>
                            </div>
                            
                            <div class="form-group">
                                <label>Outcome:</label>
                                <select id="outcome" required>
                                    <option value="">Select outcome...</option>
                                    <option value="target_hit">Target Hit</option>
                                    <option value="stop_hit">Stop Loss Hit</option>
                                    <option value="manual_exit">Manual Exit</option>
                                    <option value="still_active">Still Active</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Days Held:</label>
                                <input type="number" id="daysHeld" min="0" required>
                            </div>
                            
                            <div class="form-buttons">
                                <button type="submit" class="btn btn-primary">Update Outcome</button>
                                <button type="button" class="btn btn-secondary" onclick="closeOutcomeModal()">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add form submit handler
        document.getElementById('outcomeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitOutcome(trackingId);
        });
    }

    /**
     * Submit outcome data
     * @param {string} trackingId - Tracking ID
     */
    static submitOutcome(trackingId) {
        const currentPrice = parseFloat(document.getElementById('currentPrice').value);
        const outcome = document.getElementById('outcome').value;
        const daysHeld = parseInt(document.getElementById('daysHeld').value);

        const recommendation = globalAccuracyTracker.recommendations.get(trackingId);
        if (!recommendation) return;

        // Calculate actual return
        const actualReturn = ((currentPrice - recommendation.entryPrice) / recommendation.entryPrice) * 100;
        
        // Determine if target or stop loss was hit
        const hitTarget = outcome === 'target_hit' || 
            (recommendation.action === 'buy' && currentPrice >= recommendation.targetPrice) ||
            (recommendation.action === 'sell' && currentPrice <= recommendation.targetPrice);
            
        const hitStopLoss = outcome === 'stop_hit' ||
            (recommendation.stopLoss && 
             ((recommendation.action === 'buy' && currentPrice <= recommendation.stopLoss) ||
              (recommendation.action === 'sell' && currentPrice >= recommendation.stopLoss)));

        const outcomeData = {
            actualReturn: actualReturn,
            daysToTarget: daysHeld,
            hitTarget: hitTarget,
            hitStopLoss: hitStopLoss,
            finalPrice: currentPrice,
            outcomeType: outcome
        };

        // Update the outcome
        EnhancedRecommendationGenerator.updateRecommendationOutcome(trackingId, outcomeData);
        
        // Close modal and show success message
        this.closeOutcomeModal();
        alert(`Outcome recorded successfully! Return: ${actualReturn.toFixed(2)}%`);
        
        // Refresh any displayed statistics
        this.refreshAccuracyDisplays();
    }

    /**
     * Close outcome modal
     */
    static closeOutcomeModal() {
        const modal = document.getElementById('outcomeModal');
        if (modal) {
            modal.remove();
        }
    }

    /**
     * Refresh accuracy displays on the page
     */
    static refreshAccuracyDisplays() {
        // Update any displayed accuracy statistics
        const accuracyElements = document.querySelectorAll('.accuracy-stats');
        accuracyElements.forEach(element => {
            // Refresh accuracy data - implementation depends on specific use case
            console.log('Refreshing accuracy display');
        });
    }
}

// Global functions for HTML onclick handlers
function trackRecommendationOutcome(trackingId) {
    OutcomeTracker.showOutcomeModal(trackingId);
}

function closeOutcomeModal() {
    OutcomeTracker.closeOutcomeModal();
}

// Export classes for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        EnhancedRecommendationGenerator, 
        ConfidenceDisplayUtils, 
        OutcomeTracker 
    };
}