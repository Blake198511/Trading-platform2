// Content Moderation System
// Task 8.2: Build content moderation system

// Global moderation state
let moderationSettings = {
    autoModeration: true,
    spamThreshold: 0.7,
    scamThreshold: 0.8,
    minReputationToPost: 10,
    verificationRequired: false
};

let userDatabase = new Map(); // Simulated user database
let flaggedContent = new Map(); // Flagged posts/users
let moderationQueue = []; // Posts pending review

// ============================================================================
// CONTENT MODERATION ENGINE
// ============================================================================

class ContentModerator {
    constructor() {
        this.spamKeywords = [
            'guaranteed profit', 'risk free', 'get rich quick', 'pump and dump',
            'insider tip', 'secret formula', 'double your money', 'sure thing',
            'hot tip', 'can\'t lose', 'easy money', 'instant profit',
            'telegram group', 'discord pump', 'private signal', 'vip group',
            'buy now', 'act fast', 'limited time', 'exclusive offer'
        ];
        
        this.scamPatterns = [
            /\b(telegram|discord)\s+(group|channel)\b/i,
            /\b(signal|pump)\s+(group|channel)\b/i,
            /\b(guaranteed|sure)\s+(profit|win|money)\b/i,
            /\b(risk\s*free|no\s*risk)\b/i,
            /\b(insider\s+tip|hot\s+tip)\b/i,
            /\b(double\s+your\s+money)\b/i,
            /\b(get\s+rich\s+quick)\b/i,
            /\b(easy\s+money|instant\s+profit)\b/i
        ];
        
        this.promotionalPatterns = [
            /https?:\/\/[^\s]+/g, // URLs
            /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, // Email addresses
            /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // Phone numbers
            /\b(follow|subscribe|join)\s+(me|us|our)\b/i
        ];
    }

    // Main moderation function
    moderateContent(content, userId, postType = 'post') {
        const analysis = {
            approved: true,
            confidence: 1.0,
            flags: [],
            reasons: [],
            action: 'approve', // 'approve', 'flag', 'reject', 'review'
            riskLevel: 'low' // 'low', 'medium', 'high'
        };

        // Check user reputation and verification status
        const userCheck = this.checkUserStatus(userId);
        if (!userCheck.canPost) {
            analysis.approved = false;
            analysis.action = 'reject';
            analysis.flags.push('user_verification');
            analysis.reasons.push(userCheck.reason);
            return analysis;
        }

        // Spam detection
        const spamScore = this.detectSpam(content);
        if (spamScore > moderationSettings.spamThreshold) {
            analysis.approved = false;
            analysis.action = 'reject';
            analysis.flags.push('spam');
            analysis.reasons.push(`High spam probability: ${(spamScore * 100).toFixed(1)}%`);
            analysis.riskLevel = 'high';
        }

        // Scam detection
        const scamScore = this.detectScam(content);
        if (scamScore > moderationSettings.scamThreshold) {
            analysis.approved = false;
            analysis.action = 'reject';
            analysis.flags.push('scam');
            analysis.reasons.push(`Potential scam detected: ${(scamScore * 100).toFixed(1)}%`);
            analysis.riskLevel = 'high';
        }

        // Promotional content detection
        const promoScore = this.detectPromotional(content);
        if (promoScore > 0.6) {
            analysis.approved = false;
            analysis.action = 'flag';
            analysis.flags.push('promotional');
            analysis.reasons.push('Contains promotional content or external links');
            analysis.riskLevel = 'medium';
        }

        // Pump and dump detection
        const pumpScore = this.detectPumpAndDump(content);
        if (pumpScore > 0.7) {
            analysis.approved = false;
            analysis.action = 'reject';
            analysis.flags.push('pump_dump');
            analysis.reasons.push('Potential pump and dump scheme detected');
            analysis.riskLevel = 'high';
        }

        // Calculate overall confidence
        analysis.confidence = 1 - Math.max(spamScore, scamScore, promoScore, pumpScore);

        // If flagged but not rejected, send to review queue
        if (analysis.flags.length > 0 && analysis.action !== 'reject') {
            analysis.action = 'review';
            this.addToModerationQueue(content, userId, analysis);
        }

        return analysis;
    }

    // Spam detection algorithm
    detectSpam(content) {
        let spamScore = 0;
        const text = content.toLowerCase();
        
        // Check for spam keywords
        let keywordMatches = 0;
        this.spamKeywords.forEach(keyword => {
            if (text.includes(keyword.toLowerCase())) {
                keywordMatches++;
                spamScore += 0.15;
            }
        });

        // Excessive capitalization
        const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
        if (capsRatio > 0.3) spamScore += 0.2;

        // Excessive exclamation marks
        const exclamationCount = (content.match(/!/g) || []).length;
        if (exclamationCount > 3) spamScore += 0.1;

        // Repetitive characters
        if (/(.)\1{3,}/.test(content)) spamScore += 0.15;

        // Short posts with urgent language
        if (content.length < 50 && /\b(now|urgent|fast|quick|hurry)\b/i.test(content)) {
            spamScore += 0.2;
        }

        return Math.min(spamScore, 1.0);
    }

    // Scam detection algorithm
    detectScam(content) {
        let scamScore = 0;
        
        // Check scam patterns
        this.scamPatterns.forEach(pattern => {
            if (pattern.test(content)) {
                scamScore += 0.25;
            }
        });

        // Financial promises
        if (/\b(guarantee|promise|ensure).*(profit|money|return)\b/i.test(content)) {
            scamScore += 0.3;
        }

        // Urgency + financial gain
        if (/\b(urgent|hurry|limited|act\s+now)\b/i.test(content) && 
            /\b(profit|money|gain|return)\b/i.test(content)) {
            scamScore += 0.2;
        }

        // Unrealistic returns
        if (/\b(\d+)%\s*(profit|return|gain)\b/i.test(content)) {
            const matches = content.match(/\b(\d+)%\s*(profit|return|gain)\b/i);
            if (matches && parseInt(matches[1]) > 100) {
                scamScore += 0.4;
            }
        }

        return Math.min(scamScore, 1.0);
    }

    // Promotional content detection
    detectPromotional(content) {
        let promoScore = 0;
        
        // Check for promotional patterns
        this.promotionalPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                promoScore += matches.length * 0.2;
            }
        });

        // Self-promotion indicators
        if (/\b(my|our)\s+(channel|group|service|course|book)\b/i.test(content)) {
            promoScore += 0.3;
        }

        // Call to action
        if (/\b(subscribe|follow|join|click|visit|check\s+out)\b/i.test(content)) {
            promoScore += 0.15;
        }

        return Math.min(promoScore, 1.0);
    }

    // Pump and dump detection
    detectPumpAndDump(content) {
        let pumpScore = 0;
        
        // Pump language
        if (/\b(moon|rocket|pump|squeeze|explosion)\b/i.test(content)) {
            pumpScore += 0.2;
        }

        // Coordinated buying language
        if (/\b(everyone|all|together)\s+(buy|purchase|get)\b/i.test(content)) {
            pumpScore += 0.3;
        }

        // Time pressure + stock mention
        if (/\b(now|today|immediately)\b/i.test(content) && 
            /\b[A-Z]{2,5}\b/.test(content)) {
            pumpScore += 0.25;
        }

        // Multiple stock tickers (potential spam)
        const tickers = content.match(/\b[A-Z]{2,5}\b/g);
        if (tickers && tickers.length > 3) {
            pumpScore += 0.2;
        }

        return Math.min(pumpScore, 1.0);
    }

    // Check user status and permissions
    checkUserStatus(userId) {
        const user = userDatabase.get(userId) || this.createDefaultUser(userId);
        
        const result = {
            canPost: true,
            reason: '',
            requiresVerification: false
        };

        // Check if user is banned or flagged
        if (user.status === 'banned') {
            result.canPost = false;
            result.reason = 'User account is banned';
            return result;
        }

        if (user.status === 'suspended') {
            result.canPost = false;
            result.reason = 'User account is temporarily suspended';
            return result;
        }

        // Check reputation requirements
        if (user.reputation < moderationSettings.minReputationToPost) {
            result.canPost = false;
            result.reason = `Minimum reputation required: ${moderationSettings.minReputationToPost}`;
            return result;
        }

        // Check verification requirements
        if (moderationSettings.verificationRequired && !user.verified) {
            result.canPost = false;
            result.reason = 'Account verification required to post';
            result.requiresVerification = true;
            return result;
        }

        // Check posting frequency (rate limiting)
        const recentPosts = user.postHistory.filter(post => 
            Date.now() - post.timestamp < 60000 // Last minute
        );
        
        if (recentPosts.length >= 3) {
            result.canPost = false;
            result.reason = 'Posting too frequently. Please wait before posting again.';
            return result;
        }

        return result;
    }

    // Add content to moderation queue
    addToModerationQueue(content, userId, analysis) {
        const queueItem = {
            id: this.generateId(),
            content: content,
            userId: userId,
            analysis: analysis,
            timestamp: Date.now(),
            status: 'pending',
            reviewedBy: null,
            reviewedAt: null
        };

        moderationQueue.push(queueItem);
        
        // Auto-resolve low-risk items after 24 hours
        if (analysis.riskLevel === 'low') {
            setTimeout(() => {
                this.autoResolveQueueItem(queueItem.id);
            }, 24 * 60 * 60 * 1000);
        }
    }

    // Auto-resolve queue items
    autoResolveQueueItem(itemId) {
        const item = moderationQueue.find(q => q.id === itemId);
        if (item && item.status === 'pending') {
            item.status = 'auto_approved';
            item.reviewedAt = Date.now();
            item.reviewedBy = 'system';
        }
    }

    // Generate unique ID
    generateId() {
        return 'mod_' + Math.random().toString(36).substr(2, 9);
    }

    // Create default user profile
    createDefaultUser(userId) {
        const user = {
            id: userId,
            username: `User_${userId.substr(-6)}`,
            reputation: 50, // Starting reputation
            verified: false,
            status: 'active', // 'active', 'suspended', 'banned'
            joinDate: Date.now(),
            postHistory: [],
            tradingHistory: [],
            verificationAttempts: 0,
            flags: [],
            warnings: 0
        };

        userDatabase.set(userId, user);
        return user;
    }
}

// ============================================================================
// USER VERIFICATION SYSTEM
// ============================================================================

class UserVerificationSystem {
    constructor() {
        this.verificationMethods = [
            'trading_history',
            'broker_statement',
            'social_verification',
            'phone_verification'
        ];
    }

    // Start verification process
    async startVerification(userId, method = 'trading_history') {
        const user = userDatabase.get(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.verificationAttempts >= 3) {
            throw new Error('Maximum verification attempts exceeded');
        }

        const verification = {
            id: this.generateVerificationId(),
            userId: userId,
            method: method,
            status: 'pending',
            startedAt: Date.now(),
            completedAt: null,
            evidence: {},
            reviewNotes: ''
        };

        // Simulate verification process based on method
        switch (method) {
            case 'trading_history':
                return this.verifyTradingHistory(verification);
            case 'broker_statement':
                return this.verifyBrokerStatement(verification);
            case 'social_verification':
                return this.verifySocialProfile(verification);
            case 'phone_verification':
                return this.verifyPhoneNumber(verification);
            default:
                throw new Error('Invalid verification method');
        }
    }

    // Verify trading history
    async verifyTradingHistory(verification) {
        // Simulate API call to broker or manual review
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock verification logic
        const mockTradingData = {
            totalTrades: Math.floor(Math.random() * 100) + 10,
            winRate: Math.random() * 0.4 + 0.4, // 40-80%
            totalReturn: (Math.random() - 0.5) * 100, // -50% to +50%
            accountAge: Math.floor(Math.random() * 365) + 30, // 30-395 days
            brokerVerified: Math.random() > 0.3 // 70% chance
        };

        verification.evidence.tradingData = mockTradingData;

        // Verification criteria
        const isValid = mockTradingData.totalTrades >= 5 && 
                       mockTradingData.accountAge >= 30 &&
                       mockTradingData.brokerVerified;

        if (isValid) {
            verification.status = 'approved';
            this.approveUser(verification.userId, mockTradingData);
        } else {
            verification.status = 'rejected';
            verification.reviewNotes = 'Insufficient trading history or unverified broker account';
        }

        verification.completedAt = Date.now();
        return verification;
    }

    // Verify broker statement
    async verifyBrokerStatement(verification) {
        // Simulate document review process
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Mock document analysis
        const mockDocument = {
            brokerName: ['Robinhood', 'TD Ameritrade', 'E*TRADE', 'Fidelity'][Math.floor(Math.random() * 4)],
            accountNumber: 'XXX-' + Math.random().toString().substr(2, 6),
            statementDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
            isAuthentic: Math.random() > 0.2, // 80% authentic
            hasTrading: Math.random() > 0.1 // 90% have trading activity
        };

        verification.evidence.document = mockDocument;

        const isValid = mockDocument.isAuthentic && mockDocument.hasTrading;

        if (isValid) {
            verification.status = 'approved';
            this.approveUser(verification.userId, { brokerVerified: true });
        } else {
            verification.status = 'rejected';
            verification.reviewNotes = 'Document could not be verified or shows no trading activity';
        }

        verification.completedAt = Date.now();
        return verification;
    }

    // Verify social profile
    async verifySocialProfile(verification) {
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockSocial = {
            platform: 'Twitter',
            followers: Math.floor(Math.random() * 10000),
            tradingPosts: Math.floor(Math.random() * 50),
            accountAge: Math.floor(Math.random() * 1000) + 100,
            isLegitimate: Math.random() > 0.4 // 60% legitimate
        };

        verification.evidence.social = mockSocial;

        const isValid = mockSocial.isLegitimate && 
                       mockSocial.tradingPosts >= 5 &&
                       mockSocial.accountAge >= 90;

        if (isValid) {
            verification.status = 'approved';
            this.approveUser(verification.userId, { socialVerified: true });
        } else {
            verification.status = 'rejected';
            verification.reviewNotes = 'Social profile does not meet verification criteria';
        }

        verification.completedAt = Date.now();
        return verification;
    }

    // Verify phone number
    async verifyPhoneNumber(verification) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock phone verification
        const verificationCode = Math.floor(Math.random() * 900000) + 100000;
        
        verification.evidence.phone = {
            number: 'XXX-XXX-' + Math.floor(Math.random() * 9000) + 1000,
            code: verificationCode,
            verified: Math.random() > 0.1 // 90% success rate
        };

        if (verification.evidence.phone.verified) {
            verification.status = 'approved';
            this.approveUser(verification.userId, { phoneVerified: true });
        } else {
            verification.status = 'rejected';
            verification.reviewNotes = 'Phone number could not be verified';
        }

        verification.completedAt = Date.now();
        return verification;
    }

    // Approve user after successful verification
    approveUser(userId, verificationData) {
        const user = userDatabase.get(userId);
        if (user) {
            user.verified = true;
            user.reputation += 25; // Bonus reputation for verification
            user.verificationData = verificationData;
            user.verifiedAt = Date.now();
            
            // Add verified badge
            if (!user.badges) user.badges = [];
            user.badges.push({
                type: 'verified_trader',
                name: 'Verified Trader',
                icon: '✅',
                earnedAt: Date.now()
            });
        }
    }

    generateVerificationId() {
        return 'verify_' + Math.random().toString(36).substr(2, 9);
    }
}

// ============================================================================
// REPUTATION SCORING SYSTEM
// ============================================================================

class ReputationSystem {
    constructor() {
        this.baseReputation = 50;
        this.maxReputation = 1000;
        this.minReputation = 0;
    }

    // Calculate user reputation based on prediction accuracy
    calculateReputation(userId) {
        const user = userDatabase.get(userId);
        if (!user) return this.baseReputation;

        let reputation = this.baseReputation;
        
        // Trading prediction accuracy
        const predictions = user.tradingHistory || [];
        if (predictions.length > 0) {
            const accuracy = this.calculatePredictionAccuracy(predictions);
            reputation += (accuracy - 0.5) * 200; // -100 to +100 based on accuracy
        }

        // Community engagement
        const posts = user.postHistory || [];
        const upvotes = posts.reduce((sum, post) => sum + (post.upvotes || 0), 0);
        const downvotes = posts.reduce((sum, post) => sum + (post.downvotes || 0), 0);
        
        reputation += upvotes * 2;
        reputation -= downvotes * 3;

        // Verification bonus
        if (user.verified) {
            reputation += 50;
        }

        // Penalties for violations
        reputation -= (user.warnings || 0) * 25;
        reputation -= (user.flags || []).length * 15;

        // Time-based reputation decay for inactive users
        const daysSinceLastPost = user.postHistory.length > 0 ? 
            (Date.now() - Math.max(...user.postHistory.map(p => p.timestamp))) / (24 * 60 * 60 * 1000) : 0;
        
        if (daysSinceLastPost > 30) {
            reputation -= Math.floor(daysSinceLastPost / 30) * 5;
        }

        // Clamp reputation to valid range
        reputation = Math.max(this.minReputation, Math.min(this.maxReputation, reputation));
        
        // Update user reputation
        user.reputation = Math.round(reputation);
        
        return user.reputation;
    }

    // Calculate prediction accuracy
    calculatePredictionAccuracy(predictions) {
        if (predictions.length === 0) return 0.5;

        const completedPredictions = predictions.filter(p => p.outcome !== null);
        if (completedPredictions.length === 0) return 0.5;

        const correct = completedPredictions.filter(p => p.outcome === p.prediction).length;
        return correct / completedPredictions.length;
    }

    // Add trading prediction
    addTradingPrediction(userId, symbol, prediction, targetPrice, timeframe) {
        const user = userDatabase.get(userId);
        if (!user) return;

        if (!user.tradingHistory) user.tradingHistory = [];

        const predictionRecord = {
            id: this.generatePredictionId(),
            symbol: symbol,
            prediction: prediction, // 'bullish', 'bearish', 'neutral'
            targetPrice: targetPrice,
            currentPrice: this.getCurrentPrice(symbol),
            timeframe: timeframe,
            timestamp: Date.now(),
            outcome: null, // Will be set when prediction is resolved
            accuracy: null
        };

        user.tradingHistory.push(predictionRecord);

        // Schedule prediction resolution
        this.schedulePredictionResolution(predictionRecord, timeframe);
    }

    // Schedule prediction resolution
    schedulePredictionResolution(prediction, timeframe) {
        const timeframeMs = this.parseTimeframe(timeframe);
        
        setTimeout(() => {
            this.resolvePrediction(prediction.id);
        }, timeframeMs);
    }

    // Resolve prediction outcome
    resolvePrediction(predictionId) {
        // Find prediction across all users
        for (const [userId, user] of userDatabase) {
            const prediction = user.tradingHistory?.find(p => p.id === predictionId);
            if (prediction && prediction.outcome === null) {
                const currentPrice = this.getCurrentPrice(prediction.symbol);
                const priceChange = (currentPrice - prediction.currentPrice) / prediction.currentPrice;
                
                // Determine outcome based on prediction and actual price movement
                let outcome;
                if (prediction.prediction === 'bullish' && priceChange > 0.05) outcome = 'correct';
                else if (prediction.prediction === 'bearish' && priceChange < -0.05) outcome = 'correct';
                else if (prediction.prediction === 'neutral' && Math.abs(priceChange) < 0.05) outcome = 'correct';
                else outcome = 'incorrect';

                prediction.outcome = outcome;
                prediction.accuracy = Math.abs(priceChange);
                prediction.resolvedAt = Date.now();
                prediction.finalPrice = currentPrice;

                // Recalculate user reputation
                this.calculateReputation(userId);
                break;
            }
        }
    }

    // Parse timeframe string to milliseconds
    parseTimeframe(timeframe) {
        const timeframeMap = {
            '1d': 24 * 60 * 60 * 1000,
            '1w': 7 * 24 * 60 * 60 * 1000,
            '1m': 30 * 24 * 60 * 60 * 1000,
            '3m': 90 * 24 * 60 * 60 * 1000,
            '6m': 180 * 24 * 60 * 60 * 1000,
            '1y': 365 * 24 * 60 * 60 * 1000
        };
        
        return timeframeMap[timeframe] || timeframeMap['1m'];
    }

    // Mock function to get current price
    getCurrentPrice(symbol) {
        // In real implementation, this would fetch from market data API
        return 100 + (Math.random() - 0.5) * 40; // Random price between 80-120
    }

    generatePredictionId() {
        return 'pred_' + Math.random().toString(36).substr(2, 9);
    }
}

// ============================================================================
// FLAGGING SYSTEM
// ============================================================================

class FlaggingSystem {
    constructor() {
        this.flagTypes = [
            'spam',
            'scam',
            'harassment',
            'inappropriate',
            'misinformation',
            'pump_dump',
            'promotional',
            'off_topic'
        ];
    }

    // Flag content or user
    flagContent(contentId, userId, flagType, reason = '') {
        if (!this.flagTypes.includes(flagType)) {
            throw new Error('Invalid flag type');
        }

        const flag = {
            id: this.generateFlagId(),
            contentId: contentId,
            flaggedBy: userId,
            flagType: flagType,
            reason: reason,
            timestamp: Date.now(),
            status: 'pending', // 'pending', 'reviewed', 'dismissed'
            reviewedBy: null,
            reviewedAt: null,
            action: null // 'remove', 'warn', 'ban', 'dismiss'
        };

        flaggedContent.set(flag.id, flag);

        // Auto-escalate certain flag types
        if (['scam', 'pump_dump'].includes(flagType)) {
            this.escalateFlag(flag.id);
        }

        return flag;
    }

    // Flag user for suspicious behavior
    flagUser(targetUserId, reporterUserId, flagType, reason = '') {
        const user = userDatabase.get(targetUserId);
        if (!user) {
            throw new Error('User not found');
        }

        if (!user.flags) user.flags = [];

        const flag = {
            id: this.generateFlagId(),
            flaggedBy: reporterUserId,
            flagType: flagType,
            reason: reason,
            timestamp: Date.now(),
            status: 'pending'
        };

        user.flags.push(flag);

        // Check if user should be automatically suspended
        this.checkAutoSuspension(targetUserId);

        return flag;
    }

    // Escalate high-priority flags
    escalateFlag(flagId) {
        const flag = flaggedContent.get(flagId);
        if (flag) {
            flag.priority = 'high';
            flag.escalatedAt = Date.now();
            
            // Move to front of moderation queue
            const queueItem = moderationQueue.find(item => item.id === flag.contentId);
            if (queueItem) {
                queueItem.priority = 'high';
                // Sort queue by priority
                moderationQueue.sort((a, b) => {
                    if (a.priority === 'high' && b.priority !== 'high') return -1;
                    if (b.priority === 'high' && a.priority !== 'high') return 1;
                    return a.timestamp - b.timestamp;
                });
            }
        }
    }

    // Check if user should be auto-suspended
    checkAutoSuspension(userId) {
        const user = userDatabase.get(userId);
        if (!user || !user.flags) return;

        const recentFlags = user.flags.filter(flag => 
            Date.now() - flag.timestamp < 7 * 24 * 60 * 60 * 1000 // Last 7 days
        );

        // Auto-suspend if multiple flags in short period
        if (recentFlags.length >= 3) {
            user.status = 'suspended';
            user.suspendedAt = Date.now();
            user.suspensionReason = 'Multiple flags received';
            
            // Auto-unsuspend after 24 hours for first offense
            if (!user.previousSuspensions) {
                setTimeout(() => {
                    this.unsuspendUser(userId);
                }, 24 * 60 * 60 * 1000);
            }
        }
    }

    // Unsuspend user
    unsuspendUser(userId) {
        const user = userDatabase.get(userId);
        if (user && user.status === 'suspended') {
            user.status = 'active';
            user.unsuspendedAt = Date.now();
            
            if (!user.previousSuspensions) user.previousSuspensions = 0;
            user.previousSuspensions++;
        }
    }

    generateFlagId() {
        return 'flag_' + Math.random().toString(36).substr(2, 9);
    }
}

// ============================================================================
// INITIALIZE MODERATION SYSTEMS
// ============================================================================

// Create global instances
const contentModerator = new ContentModerator();
const userVerification = new UserVerificationSystem();
const reputationSystem = new ReputationSystem();
const flaggingSystem = new FlaggingSystem();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ContentModerator,
        UserVerificationSystem,
        ReputationSystem,
        FlaggingSystem,
        contentModerator,
        userVerification,
        reputationSystem,
        flaggingSystem,
        moderationSettings,
        userDatabase,
        flaggedContent,
        moderationQueue
    };
}