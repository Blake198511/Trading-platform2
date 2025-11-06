// Missing Scan Functions for Trading Application
// This file contains all the scan functions referenced in trader.html

// ============================================================================
// POLITICIANS & BIG INVESTORS SCANNER
// ============================================================================
async function scanPoliticiansInvestors() {
    const resultsDiv = document.getElementById('politiciansResults');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Scanning latest trades from politicians and big investors...</div>';
    
    try {
        // Use API endpoints to fetch data
        const trades = await API.makeRequest('/politicians-investors', { 
            filter: currentPoliticiansFilter || 'all' 
        });
        
        let html = '';
        trades.forEach(trade => {
            html += generateInsiderTradeCard(trade);
        });
        
        if (html === '') {
            html = '<div class="tip-box">No trades found for the selected filter.</div>';
        }
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error fetching politicians/investors data:', error);
        resultsDiv.innerHTML = `
            <div class="tip-box danger">
                <div class="tip-title">⚠️ Error Loading Data</div>
                <div>Unable to load trading data. Please try again in a moment.</div>
            </div>
        `;
    }
}

// ============================================================================
// CATALYST SCANNER
// ============================================================================
async function scanCatalystOpportunities() {
    const resultsDiv = document.getElementById('catalystScannerResults');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Scanning for active catalysts and upcoming events...</div>';
    
    try {
        const catalysts = await API.makeRequest('/catalysts', { 
            filter: currentCatalystFilter || 'all' 
        });
        
        let html = '';
        catalysts.forEach(catalyst => {
            html += generateCatalystCard(catalyst);
        });
        
        if (html === '') {
            html = '<div class="tip-box">No catalysts found for the selected filter.</div>';
        }
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error fetching catalyst data:', error);
        resultsDiv.innerHTML = `
            <div class="tip-box danger">
                <div class="tip-title">⚠️ Error Loading Data</div>
                <div>Unable to load catalyst data. Please try again in a moment.</div>
            </div>
        `;
    }
}

// ============================================================================
// PENNY STOCKS SCANNER
// ============================================================================
async function scanPennyStocksRecommendations() {
    const resultsDiv = document.getElementById('pennyStocksResults');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Scanning penny stocks with legitimate fundamentals...</div>';
    
    try {
        const pennyStocks = await API.makeRequest('/penny-stocks');
        
        let html = '';
        pennyStocks.forEach(stock => {
            html += generatePennyStockCard(stock);
        });
        
        if (html === '') {
            html = '<div class="tip-box">No penny stocks found meeting our criteria.</div>';
        }
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error fetching penny stocks data:', error);
        resultsDiv.innerHTML = `
            <div class="tip-box danger">
                <div class="tip-title">⚠️ Error Loading Data</div>
                <div>Unable to load penny stocks data. Please try again.</div>
            </div>
        `;
    }
}

// ============================================================================
// SHORT SQUEEZE SCANNER
// ============================================================================
async function scanShortSqueezeOpportunities() {
    const resultsDiv = document.getElementById('shortSqueezeResults');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Scanning for short squeeze opportunities...</div>';
    
    try {
        const shortSqueezeStocks = await API.makeRequest('/short-squeeze');
        
        let html = '';
        shortSqueezeStocks.forEach(stock => {
            html += generateShortSqueezeCard(stock);
        });
        
        if (html === '') {
            html = '<div class="tip-box">No short squeeze opportunities found.</div>';
        }
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error fetching short squeeze data:', error);
        resultsDiv.innerHTML = `
            <div class="tip-box danger">
                <div class="tip-title">⚠️ Error Loading Data</div>
                <div>Unable to load short squeeze data. Please try again.</div>
            </div>
        `;
    }
}

// ============================================================================
// IPO ANALYZER
// ============================================================================
async function scanIPOOpportunities() {
    const resultsDiv = document.getElementById('ipoAnalyzerResults');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Analyzing IPO opportunities...</div>';
    
    try {
        const ipoData = await API.makeRequest('/ipo-analysis');
        
        let html = '';
        ipoData.forEach(ipo => {
            html += generateIPOCard(ipo);
        });
        
        if (html === '') {
            html = '<div class="tip-box">No IPO opportunities found.</div>';
        }
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error fetching IPO data:', error);
        resultsDiv.innerHTML = `
            <div class="tip-box danger">
                <div class="tip-title">⚠️ Error Loading Data</div>
                <div>Unable to load IPO data. Please try again.</div>
            </div>
        `;
    }
}

// ============================================================================
// MERGERS & ACQUISITIONS SCANNER
// ============================================================================
async function scanMergerArbitrage() {
    const resultsDiv = document.getElementById('mergersAcquisitionsResults');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Scanning merger arbitrage opportunities...</div>';
    
    try {
        const mergerData = await API.makeRequest('/mergers-acquisitions');
        
        let html = '';
        mergerData.forEach(merger => {
            html += generateMergerCard(merger);
        });
        
        if (html === '') {
            html = '<div class="tip-box">No merger arbitrage opportunities found.</div>';
        }
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error fetching merger data:', error);
        resultsDiv.innerHTML = `
            <div class="tip-box danger">
                <div class="tip-title">⚠️ Error Loading Data</div>
                <div>Unable to load merger data. Please try again.</div>
            </div>
        `;
    }
}

// ============================================================================
// OPTIONS RECOMMENDATIONS SCANNER
// ============================================================================
async function scanOptionsRecommendations() {
    const resultsDiv = document.getElementById('optionsRecommendationsResults');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Scanning options trading opportunities...</div>';
    
    try {
        const optionsData = await API.makeRequest('/options-recommendations');
        
        let html = '';
        optionsData.forEach(option => {
            html += generateOptionsCard(option);
        });
        
        if (html === '') {
            html = '<div class="tip-box">No options opportunities found.</div>';
        }
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error fetching options data:', error);
        resultsDiv.innerHTML = `
            <div class="tip-box danger">
                <div class="tip-title">⚠️ Error Loading Data</div>
                <div>Unable to load options data. Please try again.</div>
            </div>
        `;
    }
}

// ============================================================================
// CRYPTO INFRASTRUCTURE SCANNER
// ============================================================================
async function scanCryptoInfrastructure() {
    const resultsDiv = document.getElementById('cryptoInfrastructureResults');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Scanning crypto infrastructure opportunities...</div>';
    
    try {
        const cryptoData = await API.makeRequest('/crypto-infrastructure');
        
        let html = '';
        cryptoData.forEach(crypto => {
            html += generateCryptoCard(crypto);
        });
        
        if (html === '') {
            html = '<div class="tip-box">No crypto infrastructure opportunities found.</div>';
        }
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error fetching crypto data:', error);
        resultsDiv.innerHTML = `
            <div class="tip-box danger">
                <div class="tip-title">⚠️ Error Loading Data</div>
                <div>Unable to load crypto data. Please try again.</div>
            </div>
        `;
    }
}

// ============================================================================
// FOREX ANALYZER
// ============================================================================
async function scanForexOpportunities() {
    const resultsDiv = document.getElementById('forexAnalyzerResults');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Analyzing forex trading opportunities...</div>';
    
    try {
        const forexData = await API.makeRequest('/forex-analysis');
        
        let html = '';
        forexData.forEach(forex => {
            html += generateForexCard(forex);
        });
        
        if (html === '') {
            html = '<div class="tip-box">No forex opportunities found.</div>';
        }
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error fetching forex data:', error);
        resultsDiv.innerHTML = `
            <div class="tip-box danger">
                <div class="tip-title">⚠️ Error Loading Data</div>
                <div>Unable to load forex data. Please try again.</div>
            </div>
        `;
    }
}

// ============================================================================
// CARD GENERATION FUNCTIONS
// ============================================================================

function generateShortSqueezeCard(stock) {
    return `
        <div class="stock-result">
            <div class="stock-header">
                <div>
                    <div class="stock-symbol">${stock.symbol}</div>
                    <div style="color: var(--text-gray); font-size: 0.9rem;">${stock.company}</div>
                </div>
                <div style="text-align: right;">
                    <div class="stock-price">${stock.currentPrice.toFixed(2)}</div>
                    <div class="catalyst-tag ${stock.riskLevel === 'Extreme' ? 'profit-negative' : 'warning'}">
                        ${stock.riskLevel} Risk
                    </div>
                </div>
            </div>
            
            <div class="trade-details">
                <div class="detail-row">
                    <span class="detail-label">Short Interest:</span>
                    <span class="detail-value profit-negative">${stock.shortInterest}%</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Days to Cover:</span>
                    <span class="detail-value">${stock.daysToCover}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Borrow Cost:</span>
                    <span class="detail-value profit-negative">${stock.borrowCost}%</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Target Price:</span>
                    <span class="detail-value profit-positive">${stock.targetPrice.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="probability-meter">
                <span style="color: var(--text-gray); font-size: 0.9rem;">Squeeze Probability:</span>
                <div class="probability-bar">
                    <div class="probability-fill" style="width: ${stock.probability}%"></div>
                </div>
                <span style="font-weight: 700; color: var(--primary-green);">${stock.probability}%</span>
            </div>
            
            <div class="tip-box danger">
                <div class="tip-title">⚠️ Extreme Risk Warning</div>
                <div style="color: var(--text-gray);">
                    Short squeeze plays are highly speculative. Only risk what you can afford to lose completely.
                </div>
            </div>
        </div>
    `;
}

function generateIPOCard(ipo) {
    const statusClass = ipo.status === 'recent' ? 'profit-positive' : 'warning';
    return `
        <div class="stock-result">
            <div class="stock-header">
                <div>
                    <div class="stock-symbol">${ipo.symbol}</div>
                    <div style="color: var(--text-gray); font-size: 0.9rem;">${ipo.company}</div>
                </div>
                <div style="text-align: right;">
                    <div class="catalyst-tag ${statusClass}">${ipo.status.toUpperCase()}</div>
                </div>
            </div>
            
            <div class="trade-details">
                <div class="detail-row">
                    <span class="detail-label">IPO Date:</span>
                    <span class="detail-value">${formatDate(ipo.ipoDate)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">IPO Price:</span>
                    <span class="detail-value">${ipo.ipoPrice ? ipo.ipoPrice.toFixed(2) : ipo.expectedPrice.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Current Price:</span>
                    <span class="detail-value">${ipo.currentPrice ? ipo.currentPrice.toFixed(2) : 'TBD'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Market Cap:</span>
                    <span class="detail-value">${(ipo.marketCap / 1000000000).toFixed(1)}B</span>
                </div>
            </div>
            
            <div class="tip-box">
                <div class="tip-title">📊 IPO Analysis</div>
                <div style="color: var(--text-gray);">
                    ${ipo.fundamentals || 'Analyzing fundamentals and market opportunity...'}
                </div>
            </div>
        </div>
    `;
}

function generateMergerCard(merger) {
    return `
        <div class="stock-result">
            <div class="stock-header">
                <div>
                    <div class="stock-symbol">${merger.symbol}</div>
                    <div style="color: var(--text-gray); font-size: 0.9rem;">${merger.company}</div>
                </div>
                <div style="text-align: right;">
                    <div class="catalyst-tag profit-positive">M&A Target</div>
                </div>
            </div>
            
            <div class="tip-box success">
                <div class="tip-title">🤝 Merger Opportunity</div>
                <div style="color: var(--text-gray);">
                    Merger arbitrage opportunity detected. Analyzing spread and completion probability.
                </div>
            </div>
        </div>
    `;
}

function generateOptionsCard(option) {
    return `
        <div class="stock-result">
            <div class="stock-header">
                <div>
                    <div class="stock-symbol">${option.symbol}</div>
                    <div style="color: var(--text-gray); font-size: 0.9rem;">${option.type} Option</div>
                </div>
                <div style="text-align: right;">
                    <div class="catalyst-tag">${option.strategy}</div>
                </div>
            </div>
            
            <div class="tip-box">
                <div class="tip-title">📈 Options Strategy</div>
                <div style="color: var(--text-gray);">
                    Options trading opportunity identified. Risk management required.
                </div>
            </div>
        </div>
    `;
}

function generateCryptoCard(crypto) {
    return `
        <div class="stock-result">
            <div class="stock-header">
                <div>
                    <div class="stock-symbol">${crypto.symbol}</div>
                    <div style="color: var(--text-gray); font-size: 0.9rem;">${crypto.company}</div>
                </div>
                <div style="text-align: right;">
                    <div class="catalyst-tag">Crypto Infrastructure</div>
                </div>
            </div>
            
            <div class="tip-box">
                <div class="tip-title">₿ Crypto Infrastructure Play</div>
                <div style="color: var(--text-gray);">
                    Cryptocurrency infrastructure investment opportunity.
                </div>
            </div>
        </div>
    `;
}

function generateForexCard(forex) {
    return `
        <div class="stock-result">
            <div class="stock-header">
                <div>
                    <div class="stock-symbol">${forex.symbol}</div>
                    <div style="color: var(--text-gray); font-size: 0.9rem;">${forex.baseCurrency}/${forex.quoteCurrency}</div>
                </div>
                <div style="text-align: right;">
                    <div class="catalyst-tag">Forex</div>
                </div>
            </div>
            
            <div class="tip-box">
                <div class="tip-title">💱 Forex Analysis</div>
                <div style="color: var(--text-gray);">
                    Currency pair trading opportunity identified.
                </div>
            </div>
        </div>
    `;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatDate(date) {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function getCompanyName(symbol) {
    const companies = {
        'NVDA': 'NVIDIA Corporation',
        'TSLA': 'Tesla Inc.',
        'AAPL': 'Apple Inc.',
        'MSFT': 'Microsoft Corporation',
        'GOOGL': 'Alphabet Inc.',
        'AMZN': 'Amazon.com Inc.',
        'META': 'Meta Platforms Inc.'
    };
    return companies[symbol] || 'Company';
}

// Make functions globally available
window.scanPoliticiansInvestors = scanPoliticiansInvestors;
window.scanCatalystOpportunities = scanCatalystOpportunities;
window.scanPennyStocksRecommendations = scanPennyStocksRecommendations;
window.scanShortSqueezeOpportunities = scanShortSqueezeOpportunities;
window.scanIPOOpportunities = scanIPOOpportunities;
window.scanMergerArbitrage = scanMergerArbitrage;
window.scanOptionsRecommendations = scanOptionsRecommendations;
window.scanCryptoInfrastructure = scanCryptoInfrastructure;
window.scanForexOpportunities = scanForexOpportunities;