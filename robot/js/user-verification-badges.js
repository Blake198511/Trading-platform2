// User Verification and Badge System
// Implementation for Task 8.3: Implement user verification and badges

// ============================================================================
// VERIFIED TRADER BADGE SYSTEM
// ============================================================================

class VerifiedTraderBadgeSystem {
    constructor() {
        this.badgeTypes = {
            verified_trader: {
                name: 'Verified Trader',
                icon: '✅',
                color: '#00FF41',
                description: 'Verified trading history and account',
                requirements: ['trading_history_verified', 'account_verified']
            },
            performance_tracker: {
                name: 'Performance Tracker',
                icon: '📊',
                color: '#FFD700',
                description: 'Tracks and shares public stock picks',
                requirements: ['public_picks_enabled', 'min_5_picks']
            },
            accuracy_master: {
                name: 'Accuracy Master',
                icon: '🎯',
                color: '#FF6B35',
                description: '80%+ accuracy on public predictions',
                requirements: ['accuracy_above_80', 'min_20_picks']
            },
            screenshot_verified: {
                name: 'Screenshot Verified',
                icon: '📸',
                color: '#9B59B6',
                description: 'Verified trade screenshots',
                requirements: ['screenshot_verified']
            },
            community_leader: {
                name: 'Community Leader',
                icon: '👑',
                color: '#E74C3C',
                description: 'Top contributor to community discussions',
                requirements: ['high_reputation', 'helpful_posts']
            }
        };
        
        this.userBadges = new Map(); // userId -> badges array
        this.badgeRequirements = new Map(); // userId -> requirements progress
    }

    // Award badge to user
    awardBadge(userId, badgeType) {
        if (!this.badgeTypes[badgeType]) {
            throw new Error(`Invalid badge type: ${badgeType}`);
        }

        if (!this.userBadges.has(userId)) {
            this.userBadges.set(userId, []);
        }

        const userBadges = this.userBadges.get(userId);
        
        // Check if user already has this badge
        if (userBadges.some(badge => badge.type === badgeType)) {
            return false; // Already has badge
        }

        const badge = {
            type: badgeType,
            ...this.badgeTypes[badgeType],
            earnedAt: Date.now(),
            id: this.generateBadgeId()
        };

        userBadges.push(badge);
        this.userBadges.set(userId, userBadges);

        // Update user database
        const user = userDatabase.get(userId);
        if (user) {
            if (!user.badges) user.badges = [];
            user.badges.push(badge);
            user.reputation += 25; // Bonus reputation for earning badge
        }

        return true;
    }

    // Check if user meets badge requirements
    checkBadgeRequirements(userId, badgeType) {
        const requirements = this.badgeTypes[badgeType]?.requirements;
        if (!requirements) return false;

        const user = userDatabase.get(userId);
        if (!user) return false;

        switch (badgeType) {
            case 'verified_trader':
                return user.verified && user.verificationData;
            
            case 'performance_tracker':
                return user.publicPicks && user.publicPicks.length >= 5;
            
            case 'accuracy_master':
                return this.calculateAccuracy(userId) >= 0.8 && 
                       (user.publicPicks?.length || 0) >= 20;
            
            case 'screenshot_verified':
                return user.screenshotVerified;
            
            case 'community_leader':
                return user.reputation >= 500 && 
                       (user.helpfulPosts || 0) >= 10;
            
            default:
                return false;
        }
    }

    // Get user badges
    getUserBadges(userId) {
        return this.userBadges.get(userId) || [];
    }

    // Generate badge display HTML
    generateBadgeHTML(badges) {
        if (!badges || badges.length === 0) {
            return '<span class="no-badges">No badges earned</span>';
        }

        return badges.map(badge => `
            <span class="user-badge" style="background-color: ${badge.color}20; border: 1px solid ${badge.color}; color: ${badge.color};" 
                  title="${badge.description}">
                ${badge.icon} ${badge.name}
            </span>
        `).join('');
    }

    generateBadgeId() {
        return 'badge_' + Math.random().toString(36).substr(2, 9);
    }

    calculateAccuracy(userId) {
        const user = userDatabase.get(userId);
        if (!user || !user.publicPicks) return 0;

        const completedPicks = user.publicPicks.filter(pick => pick.status === 'completed');
        if (completedPicks.length === 0) return 0;

        const correctPicks = completedPicks.filter(pick => pick.correct);
        return correctPicks.length / completedPicks.length;
    }
}

// ============================================================================
// TRADING HISTORY VERIFICATION PROCESS
// ============================================================================

class TradingHistoryVerification {
    constructor() {
        this.verificationSteps = [
            'broker_connection',
            'account_validation', 
            'trading_activity_check',
            'performance_analysis',
            'final_approval'
        ];
        
        this.supportedBrokers = [
            'robinhood',
            'td_ameritrade', 
            'e_trade',
            'fidelity',
            'charles_schwab',
            'interactive_brokers',
            'webull'
        ];
    }

    // Start trading history verification
    async startTradingVerification(userId, brokerType, credentials) {
        const verification = {
            id: this.generateVerificationId(),
            userId: userId,
            brokerType: brokerType,
            status: 'in_progress',
            currentStep: 0,
            steps: [],
            startedAt: Date.now(),
            completedAt: null,
            tradingData: null,
            errors: []
        };

        try {
            // Step 1: Broker Connection
            await this.verifyBrokerConnection(verification, credentials);
            
            // Step 2: Account Validation
            await this.validateAccount(verification);
            
            // Step 3: Trading Activity Check
            await this.checkTradingActivity(verification);
            
            // Step 4: Performance Analysis
            await this.analyzePerformance(verification);
            
            // Step 5: Final Approval
            await this.finalApproval(verification);
            
            verification.status = 'completed';
            verification.completedAt = Date.now();
            
            return verification;
            
        } catch (error) {
            verification.status = 'failed';
            verification.errors.push(error.message);
            verification.completedAt = Date.now();
            throw error;
        }
    }

    async verifyBrokerConnection(verification, credentials) {
        verification.steps.push({
            step: 'broker_connection',
            status: 'in_progress',
            startedAt: Date.now()
        });

        // Simulate broker API connection
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock connection validation
        const connectionSuccess = Math.random() > 0.1; // 90% success rate
        
        if (!connectionSuccess) {
            throw new Error('Failed to connect to broker API');
        }

        verification.steps[verification.currentStep].status = 'completed';
        verification.steps[verification.currentStep].completedAt = Date.now();
        verification.currentStep++;
    }

    async validateAccount(verification) {
        verification.steps.push({
            step: 'account_validation',
            status: 'in_progress',
            startedAt: Date.now()
        });

        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock account validation
        const mockAccountData = {
            accountNumber: 'XXX-' + Math.random().toString().substr(2, 6),
            accountType: 'individual',
            accountAge: Math.floor(Math.random() * 1000) + 30, // 30-1030 days
            isActive: Math.random() > 0.05, // 95% active
            hasOptions: Math.random() > 0.3 // 70% have options
        };

        if (!mockAccountData.isActive || mockAccountData.accountAge < 30) {
            throw new Error('Account does not meet minimum requirements');
        }

        verification.accountData = mockAccountData;
        verification.steps[verification.currentStep].status = 'completed';
        verification.steps[verification.currentStep].completedAt = Date.now();
        verification.currentStep++;
    }

    async checkTradingActivity(verification) {
        verification.steps.push({
            step: 'trading_activity_check',
            status: 'in_progress',
            startedAt: Date.now()
        });

        await new Promise(resolve => setTimeout(resolve, 2500));

        // Mock trading activity data
        const mockTradingActivity = {
            totalTrades: Math.floor(Math.random() * 200) + 10,
            stockTrades: Math.floor(Math.random() * 150) + 5,
            optionTrades: Math.floor(Math.random() * 100),
            cryptoTrades: Math.floor(Math.random() * 50),
            avgTradeSize: Math.floor(Math.random() * 5000) + 100,
            tradingFrequency: Math.random() * 10 + 1, // trades per week
            lastTradeDate: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000 // within 30 days
        };

        if (mockTradingActivity.totalTrades < 5) {
            throw new Error('Insufficient trading activity');
        }

        verification.tradingActivity = mockTradingActivity;
        verification.steps[verification.currentStep].status = 'completed';
        verification.steps[verification.currentStep].completedAt = Date.now();
        verification.currentStep++;
    }

    async analyzePerformance(verification) {
        verification.steps.push({
            step: 'performance_analysis',
            status: 'in_progress',
            startedAt: Date.now()
        });

        await new Promise(resolve => setTimeout(resolve, 3000));

        // Mock performance analysis
        const mockPerformance = {
            totalReturn: (Math.random() - 0.3) * 100, // -30% to +70%
            winRate: Math.random() * 0.4 + 0.3, // 30% to 70%
            avgWin: Math.random() * 20 + 5, // 5% to 25%
            avgLoss: -(Math.random() * 15 + 2), // -2% to -17%
            sharpeRatio: Math.random() * 2 - 0.5, // -0.5 to 1.5
            maxDrawdown: -(Math.random() * 30 + 5), // -5% to -35%
            profitFactor: Math.random() * 2 + 0.5 // 0.5 to 2.5
        };

        verification.performanceData = mockPerformance;
        verification.steps[verification.currentStep].status = 'completed';
        verification.steps[verification.currentStep].completedAt = Date.now();
        verification.currentStep++;
    }

    async finalApproval(verification) {
        verification.steps.push({
            step: 'final_approval',
            status: 'in_progress',
            startedAt: Date.now()
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Approval criteria
        const meetsRequirements = 
            verification.tradingActivity.totalTrades >= 5 &&
            verification.accountData.accountAge >= 30 &&
            verification.performanceData.winRate >= 0.2; // At least 20% win rate

        if (!meetsRequirements) {
            throw new Error('Does not meet verification requirements');
        }

        // Update user record
        const user = userDatabase.get(verification.userId);
        if (user) {
            user.verified = true;
            user.verificationData = {
                broker: verification.brokerType,
                accountData: verification.accountData,
                tradingActivity: verification.tradingActivity,
                performance: verification.performanceData,
                verifiedAt: Date.now()
            };
        }

        verification.steps[verification.currentStep].status = 'completed';
        verification.steps[verification.currentStep].completedAt = Date.now();
        verification.currentStep++;
    }

    generateVerificationId() {
        return 'trading_verify_' + Math.random().toString(36).substr(2, 9);
    }
}

// ============================================================================
// PERFORMANCE TRACKING FOR PUBLIC STOCK PICKS
// ============================================================================

class PublicStockPicksTracker {
    constructor() {
        this.activePicks = new Map(); // userId -> picks array
        this.completedPicks = new Map(); // userId -> completed picks array
        this.leaderboard = [];
    }

    // Create new public stock pick
    createPublicPick(userId, pickData) {
        const pick = {
            id: this.generatePickId(),
            userId: userId,
            symbol: pickData.symbol,
            action: pickData.action, // 'buy' or 'sell'
            entryPrice: pickData.entryPrice,
            targetPrice: pickData.targetPrice,
            stopLoss: pickData.stopLoss,
            reasoning: pickData.reasoning,
            timeframe: pickData.timeframe,
            confidence: pickData.confidence,
            createdAt: Date.now(),
            status: 'active',
            currentPrice: pickData.entryPrice,
            performance: 0,
            followers: [],
            likes: 0,
            comments: []
        };

        if (!this.activePicks.has(userId)) {
            this.activePicks.set(userId, []);
        }

        this.activePicks.get(userId).push(pick);

        // Update user database
        const user = userDatabase.get(userId);
        if (user) {
            if (!user.publicPicks) user.publicPicks = [];
            user.publicPicks.push(pick);
        }

        return pick;
    }

    // Update pick performance
    updatePickPerformance(pickId, currentPrice) {
        let pick = null;
        let userId = null;

        // Find pick in active picks
        for (const [uid, picks] of this.activePicks.entries()) {
            const foundPick = picks.find(p => p.id === pickId);
            if (foundPick) {
                pick = foundPick;
                userId = uid;
                break;
            }
        }

        if (!pick) return null;

        pick.currentPrice = currentPrice;
        
        // Calculate performance
        if (pick.action === 'buy') {
            pick.performance = ((currentPrice - pick.entryPrice) / pick.entryPrice) * 100;
        } else {
            pick.performance = ((pick.entryPrice - currentPrice) / pick.entryPrice) * 100;
        }

        // Check if target or stop loss hit
        if (pick.action === 'buy') {
            if (currentPrice >= pick.targetPrice) {
                this.completePick(pickId, 'target_hit', true);
            } else if (currentPrice <= pick.stopLoss) {
                this.completePick(pickId, 'stop_loss_hit', false);
            }
        } else {
            if (currentPrice <= pick.targetPrice) {
                this.completePick(pickId, 'target_hit', true);
            } else if (currentPrice >= pick.stopLoss) {
                this.completePick(pickId, 'stop_loss_hit', false);
            }
        }

        return pick;
    }

    // Complete a pick
    completePick(pickId, reason, correct) {
        let pick = null;
        let userId = null;

        // Find and remove from active picks
        for (const [uid, picks] of this.activePicks.entries()) {
            const pickIndex = picks.findIndex(p => p.id === pickId);
            if (pickIndex !== -1) {
                pick = picks.splice(pickIndex, 1)[0];
                userId = uid;
                break;
            }
        }

        if (!pick) return null;

        pick.status = 'completed';
        pick.completedAt = Date.now();
        pick.completionReason = reason;
        pick.correct = correct;
        pick.finalPerformance = pick.performance;

        // Add to completed picks
        if (!this.completedPicks.has(userId)) {
            this.completedPicks.set(userId, []);
        }
        this.completedPicks.get(userId).push(pick);

        // Update user stats
        this.updateUserStats(userId);

        return pick;
    }

    // Update user statistics
    updateUserStats(userId) {
        const user = userDatabase.get(userId);
        if (!user) return;

        const completedPicks = this.completedPicks.get(userId) || [];
        const activePicks = this.activePicks.get(userId) || [];

        const stats = {
            totalPicks: completedPicks.length + activePicks.length,
            completedPicks: completedPicks.length,
            activePicks: activePicks.length,
            correctPicks: completedPicks.filter(p => p.correct).length,
            accuracy: completedPicks.length > 0 ? 
                (completedPicks.filter(p => p.correct).length / completedPicks.length) * 100 : 0,
            avgPerformance: completedPicks.length > 0 ?
                completedPicks.reduce((sum, p) => sum + p.finalPerformance, 0) / completedPicks.length : 0,
            bestPick: completedPicks.length > 0 ?
                Math.max(...completedPicks.map(p => p.finalPerformance)) : 0,
            worstPick: completedPicks.length > 0 ?
                Math.min(...completedPicks.map(p => p.finalPerformance)) : 0
        };

        user.pickStats = stats;

        // Update reputation based on performance
        if (stats.accuracy >= 80 && stats.completedPicks >= 10) {
            user.reputation += 10;
        } else if (stats.accuracy >= 60 && stats.completedPicks >= 5) {
            user.reputation += 5;
        }
    }

    // Get user's public picks
    getUserPicks(userId, includeCompleted = true) {
        const active = this.activePicks.get(userId) || [];
        const completed = includeCompleted ? (this.completedPicks.get(userId) || []) : [];
        
        return [...active, ...completed].sort((a, b) => b.createdAt - a.createdAt);
    }

    // Get leaderboard
    getLeaderboard(limit = 10) {
        const users = Array.from(userDatabase.values())
            .filter(user => user.pickStats && user.pickStats.completedPicks >= 5)
            .sort((a, b) => {
                // Sort by accuracy first, then by average performance
                if (Math.abs(a.pickStats.accuracy - b.pickStats.accuracy) < 5) {
                    return b.pickStats.avgPerformance - a.pickStats.avgPerformance;
                }
                return b.pickStats.accuracy - a.pickStats.accuracy;
            })
            .slice(0, limit);

        return users.map((user, index) => ({
            rank: index + 1,
            userId: user.id,
            username: user.username,
            accuracy: user.pickStats.accuracy,
            avgPerformance: user.pickStats.avgPerformance,
            totalPicks: user.pickStats.totalPicks,
            badges: user.badges || []
        }));
    }

    generatePickId() {
        return 'pick_' + Math.random().toString(36).substr(2, 9);
    }
}

// ============================================================================
// TRADE SCREENSHOT VERIFICATION SYSTEM
// ============================================================================

class TradeScreenshotVerification {
    constructor() {
        this.verificationQueue = [];
        this.verifiedScreenshots = new Map(); // userId -> screenshots array
        this.supportedBrokers = [
            'robinhood', 'td_ameritrade', 'e_trade', 'fidelity', 
            'charles_schwab', 'interactive_brokers', 'webull'
        ];
    }

    // Submit screenshot for verification
    async submitScreenshot(userId, screenshotData) {
        const submission = {
            id: this.generateSubmissionId(),
            userId: userId,
            imageData: screenshotData.imageData,
            brokerName: screenshotData.brokerName,
            tradeDetails: screenshotData.tradeDetails,
            submittedAt: Date.now(),
            status: 'pending',
            verificationResult: null,
            reviewNotes: ''
        };

        this.verificationQueue.push(submission);

        // Auto-verify (simulate AI verification)
        const verificationResult = await this.autoVerifyScreenshot(submission);
        
        return verificationResult;
    }

    // Automated screenshot verification
    async autoVerifyScreenshot(submission) {
        // Simulate AI analysis delay
        await new Promise(resolve => setTimeout(resolve, 3000));

        const analysis = {
            isAuthentic: Math.random() > 0.15, // 85% authentic
            brokerMatches: Math.random() > 0.1, // 90% broker match
            dataConsistent: Math.random() > 0.2, // 80% data consistent
            noManipulation: Math.random() > 0.05, // 95% no manipulation
            qualityScore: Math.random() * 40 + 60 // 60-100 quality score
        };

        const isValid = analysis.isAuthentic && 
                       analysis.brokerMatches && 
                       analysis.dataConsistent && 
                       analysis.noManipulation &&
                       analysis.qualityScore >= 70;

        submission.status = isValid ? 'approved' : 'rejected';
        submission.verificationResult = analysis;
        submission.reviewNotes = isValid ? 
            'Screenshot verified successfully' : 
            'Screenshot failed verification checks';

        if (isValid) {
            this.approveScreenshot(submission);
        }

        // Remove from queue
        const queueIndex = this.verificationQueue.findIndex(s => s.id === submission.id);
        if (queueIndex !== -1) {
            this.verificationQueue.splice(queueIndex, 1);
        }

        return submission;
    }

    // Approve screenshot and update user
    approveScreenshot(submission) {
        if (!this.verifiedScreenshots.has(submission.userId)) {
            this.verifiedScreenshots.set(submission.userId, []);
        }

        const userScreenshots = this.verifiedScreenshots.get(submission.userId);
        userScreenshots.push({
            ...submission,
            verifiedAt: Date.now()
        });

        // Update user database
        const user = userDatabase.get(submission.userId);
        if (user) {
            user.screenshotVerified = true;
            if (!user.verifiedScreenshots) user.verifiedScreenshots = [];
            user.verifiedScreenshots.push(submission);
            user.reputation += 15; // Bonus for screenshot verification
        }
    }

    // Get user's verified screenshots
    getUserScreenshots(userId) {
        return this.verifiedScreenshots.get(userId) || [];
    }

    // Validate screenshot metadata
    validateScreenshotMetadata(metadata) {
        const required = ['broker', 'symbol', 'action', 'quantity', 'price', 'timestamp'];
        return required.every(field => metadata.hasOwnProperty(field));
    }

    generateSubmissionId() {
        return 'screenshot_' + Math.random().toString(36).substr(2, 9);
    }
}

// ============================================================================
// GLOBAL INSTANCES AND EXPORTS
// ============================================================================

// Create global instances
const badgeSystem = new VerifiedTraderBadgeSystem();
const tradingVerification = new TradingHistoryVerification();
const pickTracker = new PublicStockPicksTracker();
const screenshotVerification = new TradeScreenshotVerification();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        VerifiedTraderBadgeSystem,
        TradingHistoryVerification,
        PublicStockPicksTracker,
        TradeScreenshotVerification,
        badgeSystem,
        tradingVerification,
        pickTracker,
        screenshotVerification
    };
}