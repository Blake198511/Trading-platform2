// Real-Time Update System
// Implements WebSocket connections, scheduled updates, and breaking news triggers

// News Processing Pipeline for real-time news analysis
class NewsProcessingPipeline {
    constructor() {
        this.sentimentAnalyzer = new SentimentAnalyzer();
        this.impactScorer = new ImpactScorer();
    }

    async processNews(newsItem) {
        // Analyze sentiment and impact
        const sentiment = await this.sentimentAnalyzer.analyze(newsItem.headline);
        const impact = await this.impactScorer.score(newsItem);
        
        return {
            ...newsItem,
            sentiment,
            impactScore: impact
        };
    }
}

// Simple sentiment analyzer
class SentimentAnalyzer {
    analyze(text) {
        // Simple keyword-based sentiment analysis
        const positiveWords = ['breakthrough', 'approval', 'success', 'growth', 'profit', 'beat', 'strong'];
        const negativeWords = ['decline', 'loss', 'fail', 'reject', 'weak', 'miss', 'concern'];
        
        const words = text.toLowerCase().split(' ');
        let score = 0;
        
        words.forEach(word => {
            if (positiveWords.includes(word)) score += 1;
            if (negativeWords.includes(word)) score -= 1;
        });
        
        return Math.max(-1, Math.min(1, score / words.length * 10));
    }
}

// Impact scorer for news items
class ImpactScorer {
    score(newsItem) {
        let score = 5; // Base score
        
        // Increase score based on keywords
        const highImpactWords = ['fda', 'approval', 'merger', 'acquisition', 'breakthrough'];
        const headline = newsItem.headline.toLowerCase();
        
        highImpactWords.forEach(word => {
            if (headline.includes(word)) score += 2;
        });
        
        // Cap at 10
        return Math.min(10, score);
    }
}

// Price monitor for tracking price changes
class PriceMonitor {
    constructor() {
        this.priceHistory = new Map();
    }

    updatePrice(symbol, price) {
        const history = this.priceHistory.get(symbol) || [];
        history.push({ price, timestamp: new Date() });
        
        // Keep only last 100 prices
        if (history.length > 100) {
            history.shift();
        }
        
        this.priceHistory.set(symbol, history);
    }

    getVolatility(symbol) {
        const history = this.priceHistory.get(symbol) || [];
        if (history.length < 2) return 0;
        
        const prices = history.map(h => h.price);
        const mean = prices.reduce((a, b) => a + b) / prices.length;
        const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2)) / prices.length;
        
        return Math.sqrt(variance);
    }
}

// Notification manager for alerts
class NotificationManager {
    constructor() {
        this.enabled = CONFIG.FEATURES.ENABLE_NOTIFICATIONS;
    }

    sendBreakingNewsNotification(newsUpdate) {
        if (!this.enabled) return;
        
        console.log('🚨 Breaking News Alert:', newsUpdate.headline);
        this.showToast('Breaking News', newsUpdate.headline, 'error');
    }

    sendHighConfidenceRecommendation(recommendation) {
        if (!this.enabled) return;
        
        console.log('📈 High Confidence Recommendation:', recommendation.symbol);
        this.showToast('New Recommendation', `${recommendation.symbol} - ${recommendation.confidence}% confidence`, 'success');
    }

    sendPriceAlert(priceUpdate) {
        if (!this.enabled) return;
        
        const { symbol, changePercent } = priceUpdate;
        console.log(`💰 Price Alert: ${symbol} ${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%`);
        this.showToast('Price Alert', `${symbol} moved ${changePercent.toFixed(2)}%`, 'warning');
    }

    showToast(title, message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 15px;
            max-width: 300px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
        `;
        
        toast.innerHTML = `
            <div style="font-weight: 700; margin-bottom: 5px;">${title}</div>
            <div style="color: var(--text-gray); font-size: 0.9rem;">${message}</div>
        `;
        
        document.body.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }
}

class RecommendationUpdatePipeline {
    constructor() {
        this.updateInterval = 15 * 60 * 1000; // 15 minutes
        this.priceUpdateInterval = 30 * 1000; // 30 seconds for price updates
        this.isUpdating = false;
        this.websocket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.subscriptions = new Set();
        this.lastUpdateTime = null;
        this.updateQueue = [];
        this.batchSize = 10;
        
        // Initialize components
        this.newsProcessor = new NewsProcessingPipeline();
        this.priceMonitor = new PriceMonitor();
        this.notificationManager = new NotificationManager();
        
        this.initializeWebSocket();
        this.startScheduledUpdates();
        this.startPriceMonitoring();
    }

    // Initialize WebSocket connection for real-time updates
    initializeWebSocket() {
        try {
            // Check if WebSocket is enabled
            if (!CONFIG.FEATURES.ENABLE_WEBSOCKET) {
                console.log('WebSocket disabled, using polling fallback');
                this.startPollingFallback();
                return;
            }

            // Check if real API is enabled
            if (!CONFIG.FEATURES.USE_REAL_API) {
                console.log('Using simulated WebSocket for demo');
                this.simulateWebSocketConnection();
                return;
            }

            // Connect to real WebSocket server
            this.connectToWebSocket();
        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
            this.scheduleReconnect();
        }
    }

    // Connect to real WebSocket server
    connectToWebSocket() {
        const wsUrl = CONFIG.getWebSocketURL();
        console.log('Connecting to WebSocket:', wsUrl);

        try {
            this.websocket = new WebSocket(wsUrl);

            // Set up event handlers
            this.websocket.onopen = () => this.onWebSocketOpen();
            this.websocket.onmessage = (event) => this.onWebSocketMessage(event);
            this.websocket.onerror = (error) => this.onWebSocketError(error);
            this.websocket.onclose = (event) => this.onWebSocketClose(event);

        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.startPollingFallback();
        }
    }

    // Handle WebSocket message
    onWebSocketMessage(event) {
        try {
            const message = JSON.parse(event.data);
            CONFIG.log('WebSocket message received:', message.type);

            // Route message to appropriate handler
            switch (message.type) {
                case 'price_update':
                    this.handlePriceUpdate(message.data);
                    break;
                case 'news_update':
                    this.handleNewsUpdate(message.data);
                    break;
                case 'recommendation_update':
                    this.handleRecommendationUpdate(message.data);
                    break;
                case 'catalyst_update':
                    this.handleCatalystUpdate(message.data);
                    break;
                case 'pong':
                    // Heartbeat response
                    break;
                default:
                    console.warn('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Error processing WebSocket message:', error);
        }
    }

    // Handle WebSocket error
    onWebSocketError(error) {
        console.error('WebSocket error:', error);
        this.emitEvent('websocketError', { error: error.message });
    }

    // Handle WebSocket close
    onWebSocketClose(event) {
        console.log('WebSocket connection closed:', event.code, event.reason);
        this.websocket = null;
        this.emitEvent('websocketDisconnected', { 
            code: event.code, 
            reason: event.reason 
        });

        // Attempt to reconnect
        this.scheduleReconnect();
    }

    // Authenticate WebSocket connection
    authenticateWebSocket() {
        if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
            return;
        }

        const token = authManager.getToken();
        if (token) {
            this.websocket.send(JSON.stringify({
                type: 'auth',
                token: token
            }));
            CONFIG.log('WebSocket authentication sent');
        }
    }

    // Subscribe to specific channels
    subscribeToChannel(channel) {
        if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
            console.warn('Cannot subscribe: WebSocket not connected');
            return;
        }

        this.websocket.send(JSON.stringify({
            type: 'subscribe',
            channel: channel
        }));

        this.subscriptions.add(channel);
        CONFIG.log('Subscribed to channel:', channel);
    }

    // Unsubscribe from channel
    unsubscribeFromChannel(channel) {
        if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
            return;
        }

        this.websocket.send(JSON.stringify({
            type: 'unsubscribe',
            channel: channel
        }));

        this.subscriptions.delete(channel);
        CONFIG.log('Unsubscribed from channel:', channel);
    }

    // Start heartbeat to keep connection alive
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                this.websocket.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000); // Every 30 seconds
    }

    // Stop heartbeat
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    // Simulate WebSocket connection for demo
    simulateWebSocketConnection() {
        console.log('Simulating WebSocket connection for real-time updates...');
        
        // Simulate connection events
        setTimeout(() => {
            this.onWebSocketOpen();
        }, 1000);

        // Simulate periodic data updates
        setInterval(() => {
            this.simulateIncomingData();
        }, 5000);
    }

    // Start polling fallback when WebSocket unavailable
    startPollingFallback() {
        console.log('Starting polling fallback for real-time updates');
        
        // Poll for updates every 30 seconds
        this.pollingInterval = setInterval(() => {
            this.pollForUpdates();
        }, 30000);

        // Emit fallback event
        this.emitEvent('usingPollingFallback', { interval: 30000 });
    }

    // Poll for updates
    async pollForUpdates() {
        try {
            // Fetch latest updates from API
            const updates = await httpClient.get('/recommendations/updates', {
                requiresAuth: false
            });

            // Process updates
            if (updates && updates.length > 0) {
                updates.forEach(update => {
                    switch (update.type) {
                        case 'price':
                            this.handlePriceUpdate(update.data);
                            break;
                        case 'news':
                            this.handleNewsUpdate(update.data);
                            break;
                        case 'recommendation':
                            this.handleRecommendationUpdate(update.data);
                            break;
                    }
                });
            }
        } catch (error) {
            console.error('Polling error:', error);
        }
    }

    // Handle WebSocket connection open
    onWebSocketOpen() {
        console.log('WebSocket connection established');
        this.reconnectAttempts = 0;
        
        // Authenticate if user is logged in
        this.authenticateWebSocket();
        
        // Subscribe to all active recommendation sections
        this.subscribeToUpdates(['stocks', 'options', 'crypto', 'forex', 'news']);
        
        // Start heartbeat
        this.startHeartbeat();
        
        // Update connection status UI
        this.updateConnectionStatus('connected');
        
        // Emit connection event
        this.emitEvent('websocketConnected', { timestamp: new Date() });
    }

    // Subscribe to specific update channels
    subscribeToUpdates(channels) {
        channels.forEach(channel => {
            if (CONFIG.FEATURES.USE_REAL_API && this.websocket) {
                this.subscribeToChannel(channel);
            } else {
                this.subscriptions.add(channel);
                console.log(`Subscribed to ${channel} updates (simulated)`);
            }
        });
    }

    // Update connection status indicator in UI
    updateConnectionStatus(status) {
        // Find or create status indicator
        let statusIndicator = document.getElementById('connection-status');
        if (!statusIndicator) {
            statusIndicator = document.createElement('div');
            statusIndicator.id = 'connection-status';
            statusIndicator.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 8px 15px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            `;
            document.body.appendChild(statusIndicator);
        }

        // Update status
        const statusConfig = {
            connected: {
                text: 'Live',
                color: '#00FF41',
                bg: 'rgba(0, 255, 65, 0.1)',
                icon: '🟢'
            },
            disconnected: {
                text: 'Offline',
                color: '#FF4444',
                bg: 'rgba(255, 68, 68, 0.1)',
                icon: '🔴'
            },
            reconnecting: {
                text: 'Reconnecting...',
                color: '#FFD700',
                bg: 'rgba(255, 215, 0, 0.1)',
                icon: '🟡'
            }
        };

        const config = statusConfig[status] || statusConfig.disconnected;
        statusIndicator.style.background = config.bg;
        statusIndicator.style.color = config.color;
        statusIndicator.style.border = `1px solid ${config.color}`;
        statusIndicator.innerHTML = `${config.icon} ${config.text}`;
    }

    // Simulate incoming WebSocket data
    simulateIncomingData() {
        const updateTypes = ['price', 'news', 'recommendation', 'catalyst'];
        const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
        
        switch (randomType) {
            case 'price':
                this.handlePriceUpdate(this.generateMockPriceUpdate());
                break;
            case 'news':
                this.handleNewsUpdate(this.generateMockNewsUpdate());
                break;
            case 'recommendation':
                this.handleRecommendationUpdate(this.generateMockRecommendationUpdate());
                break;
            case 'catalyst':
                this.handleCatalystUpdate(this.generateMockCatalystUpdate());
                break;
        }
    }

    // Start scheduled recommendation refresh system
    startScheduledUpdates() {
        console.log('Starting scheduled recommendation updates (15-minute intervals)');
        
        setInterval(() => {
            this.performScheduledUpdate();
        }, this.updateInterval);

        // Perform initial update
        setTimeout(() => {
            this.performScheduledUpdate();
        }, 5000);
    }

    // Perform scheduled recommendation update
    async performScheduledUpdate() {
        if (this.isUpdating) {
            console.log('Update already in progress, skipping...');
            return;
        }

        this.isUpdating = true;
        console.log('Performing scheduled recommendation update...');

        try {
            // Update all recommendation sections
            await this.updateAllRecommendations();
            
            this.lastUpdateTime = new Date();
            this.emitEvent('scheduledUpdateComplete', { 
                timestamp: this.lastUpdateTime,
                sectionsUpdated: Array.from(this.subscriptions)
            });

        } catch (error) {
            console.error('Error during scheduled update:', error);
            this.emitEvent('updateError', { error: error.message });
        } finally {
            this.isUpdating = false;
        }
    }

    // Update all recommendation sections
    async updateAllRecommendations() {
        const sections = [
            'politicians-big-investors',
            'catalyst-scanner', 
            'biotech-analyzer',
            'growth-stocks',
            'options-recommendations',
            'crypto-infrastructure',
            'forex-analyzer',
            'short-squeeze',
            'ipo-analyzer',
            'mergers-acquisitions'
        ];

        // Process updates in batches to avoid overwhelming the system
        for (let i = 0; i < sections.length; i += this.batchSize) {
            const batch = sections.slice(i, i + this.batchSize);
            await Promise.all(batch.map(section => this.updateSection(section)));
            
            // Small delay between batches
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    // Update specific recommendation section
    async updateSection(sectionName) {
        try {
            console.log(`Updating ${sectionName} recommendations...`);
            
            // Generate fresh recommendations for the section
            const newRecommendations = await this.generateRecommendationsForSection(sectionName);
            
            // Update the UI if the section is currently visible
            if (this.isSectionVisible(sectionName)) {
                this.updateSectionUI(sectionName, newRecommendations);
            }
            
            // Cache the recommendations
            this.cacheRecommendations(sectionName, newRecommendations);
            
        } catch (error) {
            console.error(`Error updating ${sectionName}:`, error);
        }
    }

    // Start real-time price monitoring
    startPriceMonitoring() {
        console.log('Starting real-time price monitoring...');
        
        setInterval(() => {
            this.updatePrices();
        }, this.priceUpdateInterval);
    }

    // Update prices for all tracked symbols
    async updatePrices() {
        const trackedSymbols = this.getTrackedSymbols();
        
        if (trackedSymbols.length === 0) return;

        try {
            const priceUpdates = await this.fetchPriceUpdates(trackedSymbols);
            
            priceUpdates.forEach(update => {
                this.handlePriceUpdate(update);
            });
            
        } catch (error) {
            console.error('Error updating prices:', error);
        }
    }

    // Handle incoming price updates
    handlePriceUpdate(priceUpdate) {
        const { symbol, price, change, changePercent } = priceUpdate;
        
        // Update price displays in real-time
        this.updatePriceDisplays(symbol, price, change, changePercent);
        
        // Check for significant price movements
        if (Math.abs(changePercent) >= 5) {
            this.handleSignificantPriceMove(priceUpdate);
        }
        
        // Emit price update event
        this.emitEvent('priceUpdate', priceUpdate);
    }

    // Handle breaking news updates
    handleNewsUpdate(newsUpdate) {
        console.log('Processing breaking news update:', newsUpdate.headline);
        
        // Check if news requires immediate recommendation update
        if (newsUpdate.impactScore >= 8 && newsUpdate.isBreaking) {
            this.triggerImmediateUpdate(newsUpdate.affectedSymbols, 'breaking-news');
        }
        
        // Update news displays
        this.updateNewsDisplays(newsUpdate);
        
        // Send push notification if high impact
        if (newsUpdate.impactScore >= 9) {
            this.notificationManager.sendBreakingNewsNotification(newsUpdate);
        }
        
        this.emitEvent('newsUpdate', newsUpdate);
    }

    // Handle recommendation updates
    handleRecommendationUpdate(recommendationUpdate) {
        console.log('Processing recommendation update for:', recommendationUpdate.symbol);
        
        // Update recommendation displays
        this.updateRecommendationDisplays(recommendationUpdate);
        
        // Check if notification is needed
        if (recommendationUpdate.confidence >= 85) {
            this.notificationManager.sendHighConfidenceRecommendation(recommendationUpdate);
        }
        
        this.emitEvent('recommendationUpdate', recommendationUpdate);
    }

    // Handle catalyst updates
    handleCatalystUpdate(catalystUpdate) {
        console.log('Processing catalyst update:', catalystUpdate.event);
        
        // Update catalyst displays
        this.updateCatalystDisplays(catalystUpdate);
        
        // Trigger recommendation refresh for affected symbols
        if (catalystUpdate.probability >= 70) {
            this.triggerImmediateUpdate([catalystUpdate.symbol], 'catalyst-change');
        }
        
        this.emitEvent('catalystUpdate', catalystUpdate);
    }

    // Trigger immediate recommendation update
    async triggerImmediateUpdate(symbols, reason) {
        console.log(`Triggering immediate update for ${symbols.join(', ')} due to: ${reason}`);
        
        try {
            for (const symbol of symbols) {
                await this.updateRecommendationsForSymbol(symbol, reason);
            }
            
            this.emitEvent('immediateUpdateComplete', { symbols, reason });
            
        } catch (error) {
            console.error('Error in immediate update:', error);
        }
    }

    // Update recommendations for specific symbol
    async updateRecommendationsForSymbol(symbol, reason) {
        // Find all sections that might contain this symbol
        const affectedSections = this.findSectionsForSymbol(symbol);
        
        for (const section of affectedSections) {
            await this.updateSection(section);
        }
        
        // Show update notification
        this.showUpdateNotification(symbol, reason);
    }

    // Batch update delivery system
    processBatchUpdates() {
        if (this.updateQueue.length === 0) return;
        
        const batch = this.updateQueue.splice(0, this.batchSize);
        
        batch.forEach(update => {
            switch (update.type) {
                case 'price':
                    this.handlePriceUpdate(update.data);
                    break;
                case 'news':
                    this.handleNewsUpdate(update.data);
                    break;
                case 'recommendation':
                    this.handleRecommendationUpdate(update.data);
                    break;
            }
        });
        
        // Process next batch if queue not empty
        if (this.updateQueue.length > 0) {
            setTimeout(() => this.processBatchUpdates(), 100);
        }
    }

    // Add update to batch queue
    queueUpdate(type, data) {
        this.updateQueue.push({ type, data, timestamp: new Date() });
        
        // Start processing if not already running
        if (this.updateQueue.length === 1) {
            this.processBatchUpdates();
        }
    }

    // Handle significant price movements
    handleSignificantPriceMove(priceUpdate) {
        const { symbol, changePercent } = priceUpdate;
        
        console.log(`Significant price move detected: ${symbol} ${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%`);
        
        // Send alert notification
        this.notificationManager.sendPriceAlert(priceUpdate);
        
        // Trigger recommendation review
        this.triggerImmediateUpdate([symbol], 'significant-price-move');
    }

    // Update price displays in real-time
    updatePriceDisplays(symbol, price, change, changePercent) {
        // Find all price elements for this symbol
        const priceElements = document.querySelectorAll(`[data-symbol="${symbol}"] .stock-price, [data-symbol="${symbol}"] .current-price`);
        const changeElements = document.querySelectorAll(`[data-symbol="${symbol}"] .price-change, [data-symbol="${symbol}"] .change-percent`);
        
        priceElements.forEach(element => {
            element.textContent = price.toFixed(2);
            element.className = `stock-price ${changePercent >= 0 ? 'profit-positive' : 'profit-negative'}`;
        });
        
        changeElements.forEach(element => {
            element.textContent = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
            element.className = `price-change ${changePercent >= 0 ? 'profit-positive' : 'profit-negative'}`;
        });
    }

    // Update news displays
    updateNewsDisplays(newsUpdate) {
        // Add breaking news banner if high impact
        if (newsUpdate.isBreaking && newsUpdate.impactScore >= 8) {
            this.addBreakingNewsBanner(newsUpdate);
        }
        
        // Update news analysis section if visible
        if (this.isSectionVisible('news-analysis')) {
            this.refreshNewsAnalysisSection();
        }
    }

    // Update recommendation displays
    updateRecommendationDisplays(recommendationUpdate) {
        const { symbol, section } = recommendationUpdate;
        
        // Update specific recommendation card
        const recommendationCard = document.querySelector(`[data-symbol="${symbol}"][data-section="${section}"]`);
        if (recommendationCard) {
            this.refreshRecommendationCard(recommendationCard, recommendationUpdate);
        }
    }

    // Utility methods for mock data generation
    generateMockPriceUpdate() {
        const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META'];
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const basePrice = 150 + Math.random() * 300;
        const changePercent = (Math.random() - 0.5) * 10; // -5% to +5%
        const change = basePrice * (changePercent / 100);
        
        return {
            symbol,
            price: basePrice + change,
            change: change,
            changePercent: changePercent,
            volume: Math.floor(Math.random() * 10000000),
            timestamp: new Date()
        };
    }

    generateMockNewsUpdate() {
        const headlines = [
            'FDA Approves Revolutionary Cancer Treatment',
            'Major Tech Company Announces AI Breakthrough',
            'Government Awards Multi-Billion Defense Contract',
            'Biotech Company Reports Positive Phase 3 Results',
            'Merger Announcement Shakes Industry'
        ];
        
        const symbols = ['MRNA', 'NVDA', 'LMT', 'GILD', 'PFE'];
        
        return {
            headline: headlines[Math.floor(Math.random() * headlines.length)],
            source: 'Reuters',
            impactScore: 5 + Math.floor(Math.random() * 5),
            isBreaking: Math.random() > 0.7,
            affectedSymbols: [symbols[Math.floor(Math.random() * symbols.length)]],
            sentiment: (Math.random() - 0.5) * 2,
            timestamp: new Date()
        };
    }

    generateMockRecommendationUpdate() {
        const symbols = ['AAPL', 'TSLA', 'NVDA', 'MSFT'];
        const actions = ['buy', 'sell', 'hold'];
        
        return {
            symbol: symbols[Math.floor(Math.random() * symbols.length)],
            action: actions[Math.floor(Math.random() * actions.length)],
            confidence: 60 + Math.floor(Math.random() * 40),
            targetPrice: 200 + Math.random() * 300,
            section: 'growth-stocks',
            reason: 'Updated based on latest market analysis',
            timestamp: new Date()
        };
    }

    generateMockCatalystUpdate() {
        const events = ['FDA Decision', 'Earnings Release', 'Clinical Trial Results', 'Merger Vote'];
        const symbols = ['MRNA', 'PLTR', 'GILD', 'T'];
        
        return {
            symbol: symbols[Math.floor(Math.random() * symbols.length)],
            event: events[Math.floor(Math.random() * events.length)],
            probability: 50 + Math.floor(Math.random() * 50),
            expectedDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
            impactLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
            timestamp: new Date()
        };
    }

    // Utility methods
    getTrackedSymbols() {
        // Extract symbols from currently displayed recommendations
        const symbolElements = document.querySelectorAll('[data-symbol]');
        const symbols = new Set();
        
        symbolElements.forEach(element => {
            const symbol = element.getAttribute('data-symbol');
            if (symbol) symbols.add(symbol);
        });
        
        return Array.from(symbols);
    }

    isSectionVisible(sectionName) {
        const section = document.getElementById(sectionName);
        return section && section.classList.contains('active');
    }

    findSectionsForSymbol(symbol) {
        // This would map symbols to their relevant sections
        // For now, return all sections as they might all be relevant
        return [
            'politicians-big-investors',
            'catalyst-scanner',
            'biotech-analyzer',
            'growth-stocks',
            'options-recommendations'
        ];
    }

    emitEvent(eventName, data) {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
        }
    }

    // Placeholder methods for future implementation
    async generateRecommendationsForSection(sectionName) {
        // This would call the appropriate recommendation engine
        return [];
    }

    async fetchPriceUpdates(symbols) {
        // This would call real market data APIs
        return symbols.map(symbol => this.generateMockPriceUpdate());
    }

    updateSectionUI(sectionName, recommendations) {
        // This would update the UI with new recommendations
        console.log(`UI updated for ${sectionName} with ${recommendations.length} recommendations`);
    }

    cacheRecommendations(sectionName, recommendations) {
        // This would cache recommendations for offline access
        localStorage.setItem(`recommendations_${sectionName}`, JSON.stringify({
            data: recommendations,
            timestamp: new Date().toISOString()
        }));
    }

    scheduleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
            console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
            
            // Update UI
            this.updateConnectionStatus('reconnecting');
            
            setTimeout(() => {
                this.reconnectAttempts++;
                this.initializeWebSocket();
            }, delay);
        } else {
            console.error('Max reconnection attempts reached, falling back to polling');
            this.updateConnectionStatus('disconnected');
            this.startPollingFallback();
        }
    }

    // Close WebSocket connection
    closeWebSocket() {
        this.stopHeartbeat();
        
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }

        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    showUpdateNotification(symbol, reason) {
        // Show a subtle notification about the update
        console.log(`Recommendations updated for ${symbol} due to: ${reason}`);
    }

    addBreakingNewsBanner(newsUpdate) {
        // Add breaking news banner to the top of the page
        const banner = document.createElement('div');
        banner.className = 'breaking-news-banner';
        banner.innerHTML = `
            <div style="background: linear-gradient(90deg, var(--danger), #FF6666); color: white; padding: 10px; text-align: center; font-weight: 700;">
                🚨 BREAKING: ${newsUpdate.headline}
            </div>
        `;
        
        document.body.insertBefore(banner, document.body.firstChild);
        
        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (banner.parentNode) {
                banner.parentNode.removeChild(banner);
            }
        }, 30000);
    }

    refreshNewsAnalysisSection() {
        // Trigger refresh of news analysis section
        if (typeof scanNewsAnalysis === 'function') {
            scanNewsAnalysis();
        }
    }

    refreshRecommendationCard(card, update) {
        // Update specific recommendation card with new data
        const confidenceElement = card.querySelector('.confidence-score .score-value');
        if (confidenceElement) {
            confidenceElement.textContent = `${update.confidence}/100`;
        }
        
        const fillElement = card.querySelector('.confidence-score .score-fill');
        if (fillElement) {
            fillElement.style.width = `${update.confidence}%`;
        }
    }
}

// Price monitoring system
class PriceMonitor {
    constructor() {
        this.watchlist = new Set();
        this.priceAlerts = new Map();
        this.lastPrices = new Map();
    }

    addToWatchlist(symbol) {
        this.watchlist.add(symbol);
    }

    removeFromWatchlist(symbol) {
        this.watchlist.delete(symbol);
    }

    setPriceAlert(symbol, targetPrice, direction) {
        if (!this.priceAlerts.has(symbol)) {
            this.priceAlerts.set(symbol, []);
        }
        this.priceAlerts.get(symbol).push({ targetPrice, direction });
    }

    checkPriceAlerts(symbol, currentPrice) {
        const alerts = this.priceAlerts.get(symbol);
        if (!alerts) return;

        const triggeredAlerts = alerts.filter(alert => {
            if (alert.direction === 'above' && currentPrice >= alert.targetPrice) return true;
            if (alert.direction === 'below' && currentPrice <= alert.targetPrice) return true;
            return false;
        });

        triggeredAlerts.forEach(alert => {
            this.triggerPriceAlert(symbol, currentPrice, alert);
        });
    }

    triggerPriceAlert(symbol, price, alert) {
        console.log(`Price alert triggered: ${symbol} ${alert.direction} ${alert.targetPrice}`);
        // This would send a notification to the user
    }
}

// Notification management system
class NotificationManager {
    constructor() {
        this.notificationQueue = [];
        this.isProcessing = false;
    }

    sendBreakingNewsNotification(newsUpdate) {
        const notification = {
            type: 'breaking-news',
            title: '🚨 Breaking News Alert',
            message: newsUpdate.headline,
            data: newsUpdate,
            priority: 'high'
        };
        
        this.queueNotification(notification);
    }

    sendHighConfidenceRecommendation(recommendation) {
        const notification = {
            type: 'high-confidence-recommendation',
            title: '🎯 High Confidence Trade Alert',
            message: `${recommendation.action.toUpperCase()} ${recommendation.symbol} - ${recommendation.confidence}% confidence`,
            data: recommendation,
            priority: 'medium'
        };
        
        this.queueNotification(notification);
    }

    sendPriceAlert(priceUpdate) {
        const notification = {
            type: 'price-alert',
            title: '📈 Significant Price Movement',
            message: `${priceUpdate.symbol} ${priceUpdate.changePercent >= 0 ? '+' : ''}${priceUpdate.changePercent.toFixed(2)}%`,
            data: priceUpdate,
            priority: 'medium'
        };
        
        this.queueNotification(notification);
    }

    queueNotification(notification) {
        this.notificationQueue.push(notification);
        
        if (!this.isProcessing) {
            this.processNotificationQueue();
        }
    }

    async processNotificationQueue() {
        this.isProcessing = true;
        
        while (this.notificationQueue.length > 0) {
            const notification = this.notificationQueue.shift();
            await this.displayNotification(notification);
            
            // Small delay between notifications
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        this.isProcessing = false;
    }

    async displayNotification(notification) {
        // Display browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico'
            });
        }
        
        // Also show in-app notification
        this.showInAppNotification(notification);
    }

    showInAppNotification(notification) {
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification notification-${notification.priority}`;
        notificationElement.innerHTML = `
            <div style="background: var(--card-black); border: 2px solid var(--primary-yellow); border-radius: 10px; padding: 15px; margin: 10px; box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);">
                <div style="font-weight: 700; color: var(--primary-yellow); margin-bottom: 5px;">${notification.title}</div>
                <div style="color: var(--text-white);">${notification.message}</div>
            </div>
        `;
        
        // Add to notification area or create one
        let notificationArea = document.getElementById('notification-area');
        if (!notificationArea) {
            notificationArea = document.createElement('div');
            notificationArea.id = 'notification-area';
            notificationArea.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; max-width: 400px;';
            document.body.appendChild(notificationArea);
        }
        
        notificationArea.appendChild(notificationElement);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notificationElement.parentNode) {
                notificationElement.parentNode.removeChild(notificationElement);
            }
        }, 5000);
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
}

// Initialize the real-time update system
let updatePipeline;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updatePipeline = new RecommendationUpdatePipeline();
    
    // Request notification permission
    updatePipeline.notificationManager.requestNotificationPermission();
    
    console.log('Real-time update system initialized');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        RecommendationUpdatePipeline,
        PriceMonitor,
        NotificationManager
    };
}