// Smart Trading Recommendations Engine
// Main JavaScript file for all recommendation functionality

// Global state management
let currentPoliticiansFilter = 'all';
let currentCatalystFilter = 'all';
let currentBiotechFilter = 'all';
let currentGrowthFilter = 'all';
let currentOptionsFilter = 'all';
let currentCryptoFilter = 'all';
let currentForexFilter = 'all';
let currentIPOFilter = 'all';
let currentMAFilter = 'all';
let currentForumFilter = 'all';

// ============================================================================
// POLITICIANS & BIG INVESTORS SECTION (Task 2.1)
// ============================================================================

// Filter politicians and investors
function filterPoliticians(category) {
    currentPoliticiansFilter = category;
    
    // Update active chip
    const parentElement = event.target.closest('.tab-content');
    parentElement.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Rescan with filter
    scanPoliticiansInvestors();
}

// Main function to scan politicians and investors
async function scanPoliticiansInvestors() {
    const resultsDiv = document.getElementById('politiciansResults');
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Scanning latest trades from politicians and big investors...</div>';
    
    try {
        // Fetch data from API
        const trades = await apiIntegration.fetchPoliticiansInvestors(currentPoliticiansFilter);
        
        // Generate HTML for results
        let html = '';
        trades.forEach(trade => {
            html += generateInsiderTradeCard(trade);
        });
        
        if (html === '') {
            html = '<div class="tip-box">No trades found for the selected filter. Try selecting "All Traders" or a different category.</div>';
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

// Generate HTML card for insider trade
function generateInsiderTradeCard(trade) {
    const gainPercent = trade.getGainPercent();
    const gainClass = trade.getGainClass();
    const actionClass = trade.action;
    const categoryClass = trade.category;
    
    return `
        <div class="insider-card ${categoryClass}">
            <div class="insider-header">
                <div>
                    <div class="insider-name">${trade.name}</div>
                    <div class="insider-role">${trade.role}</div>
                </div>
                <span class="trade-badge ${actionClass}">
                    ${actionClass === 'buy' ? '🟢 BOUGHT' : '🔴 SOLD'}
                </span>
            </div>
            
            <div style="margin: 20px 0;">
                <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary-yellow);">
                    ${trade.symbol} - ${getCompanyName(trade.symbol)}
                </div>
                <div style="color: var(--text-gray); margin-top: 5px;">${formatDate(trade.date)}</div>
            </div>
            
            <div class="trade-details">
                <div class="detail-row">
                    <span class="detail-label">Shares ${actionClass === 'buy' ? 'Bought' : 'Sold'}:</span>
                    <span class="detail-value">${trade.shares.toLocaleString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Value:</span>
                    <span class="detail-value">$${(trade.value / 1000000).toFixed(1)}M</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Their Entry Price:</span>
                    <span class="detail-value">$${trade.price.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Current Price:</span>
                    <span class="detail-value ${gainClass}">$${trade.currentPrice.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Their Gain/Loss:</span>
                    <span class="detail-value ${gainClass}">
                        ${gainPercent >= 0 ? '+' : ''}${gainPercent}%
                    </span>
                </div>
            </div>
            
            <div class="confidence-score">
                <div class="score-label">Confidence Score:</div>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${trade.confidence}%"></div>
                </div>
                <div class="score-value">${trade.confidence}/100</div>
            </div>
            
            <div class="insider-stats">
                <div class="stat-box">
                    <div class="stat-label">Historical Win Rate</div>
                    <div class="stat-value">${trade.successRate}%</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Avg Return</div>
                    <div class="stat-value ${trade.avgReturn >= 0 ? 'profit-positive' : 'profit-negative'}">
                        ${trade.avgReturn >= 0 ? '+' : ''}${trade.avgReturn}%
                    </div>
                </div>
            </div>
            
            <div class="why-follow">
                <div class="why-title">💡 Why Follow This Trade:</div>
                <div style="color: var(--text-gray); line-height: 1.8;">${trade.why}</div>
            </div>
            
            <div class="tip-box ${actionClass === 'buy' ? 'success' : 'danger'}">
                <div class="tip-title">🎯 Trading Strategy:</div>
                <ul style="margin: 10px 0 0 20px; color: var(--text-gray); line-height: 2;">
                    ${trade.strategy.map(s => `<li>${s}</li>`).join('')}
                </ul>
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-primary btn-small" onclick="openBrokerLink('${trade.symbol}')">
                    📱 Trade on Robinhood
                </button>
                <button class="btn btn-secondary btn-small" onclick="openAnalysisLink('${trade.symbol}')">
                    📊 Analyze in ToS
                </button>
                <button class="btn btn-secondary btn-small" onclick="setPriceAlert('${trade.symbol}', ${trade.currentPrice})">
                    🔔 Set Price Alert
                </button>
            </div>
        </div>
    `;
}

// ============================================================================
// CATALYST SCANNER SECTION (Task 2.2)
// ============================================================================

// Filter catalysts
function filterCatalysts(category) {
    currentCatalystFilter = category;
    
    // Update active chip
    const parentElement = event.target.closest('.tab-content');
    parentElement.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Rescan with filter
    scanCatalystOpportunities();
}

// Main function to scan catalyst opportunities
async function scanCatalystOpportunities() {
    const resultsDiv = document.getElementById('catalystScannerResults');
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Scanning for active catalysts and upcoming events...</div>';
    
    try {
        // Fetch data from API
        const catalysts = await API.makeRequest('/catalysts', { 
            filter: currentCatalystFilter 
        });
        
        // Generate HTML for results
        let html = '';
        catalysts.forEach(catalyst => {
            html += generateCatalystCard(catalyst);
        });
        
        if (html === '') {
            html = '<div class="tip-box">No catalysts found for the selected filter. Try selecting "All Catalysts" or a different category.</div>';
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

// Generate HTML card for catalyst
function generateCatalystCard(catalyst) {
    const impactClass = catalyst.impactLevel === 'High' ? 'profit-positive' : 
                       catalyst.impactLevel === 'Medium' ? 'warning' : 'profit-negative';
    const upside = ((catalyst.targetPrice - catalyst.currentPrice) / catalyst.currentPrice * 100).toFixed(1);
    const daysUntil = catalyst.getDaysUntil();
    
    return `
        <div class="stock-result">
            <div class="stock-header">
                <div>
                    <div class="stock-symbol">${catalyst.symbol}</div>
                    <div style="color: var(--text-gray); font-size: 0.9rem;">${catalyst.company}</div>
                </div>
                <div style="text-align: right;">
                    <div class="catalyst-tag ${impactClass}">${catalyst.impactLevel} IMPACT</div>
                    <div style="color: var(--text-gray); font-size: 0.8rem; margin-top: 5px;">
                        ${daysUntil > 0 ? `${daysUntil} days` : 'Overdue'}
                    </div>
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary-yellow); margin-bottom: 5px;">
                    ${catalyst.type.toUpperCase()}: ${catalyst.description.split('.')[0]}
                </div>
                <div style="color: var(--text-gray);">Expected: ${formatDate(catalyst.expectedDate)}</div>
            </div>
            
            <div class="trade-details">
                <div class="detail-row">
                    <span class="detail-label">Current Price:</span>
                    <span class="detail-value">$${catalyst.currentPrice.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Target Price:</span>
                    <span class="detail-value profit-positive">$${catalyst.targetPrice.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Potential Upside:</span>
                    <span class="detail-value profit-positive">+${upside}%</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Historical Impact:</span>
                    <span class="detail-value">+${catalyst.historicalImpact}% avg</span>
                </div>
            </div>
            
            <div class="probability-meter">
                <span style="color: var(--text-gray); font-size: 0.9rem;">Success Probability:</span>
                <div class="probability-bar">
                    <div class="probability-fill" style="width: ${catalyst.probability}%"></div>
                </div>
                <span style="font-weight: 700; color: var(--primary-green);">${catalyst.probability}%</span>
            </div>
            
            <div class="tip-box">
                <div class="tip-title">📊 Catalyst Analysis:</div>
                <div style="color: var(--text-gray);">${catalyst.description}</div>
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-primary btn-small" onclick="openBrokerLink('${catalyst.symbol}')">
                    📱 Trade ${catalyst.symbol}
                </button>
                <button class="btn btn-secondary btn-small" onclick="setPriceAlert('${catalyst.symbol}', ${catalyst.currentPrice})">
                    🔔 Set Alert
                </button>
            </div>
        </div>
    `;
}

// ============================================================================
// BIOTECH BREAKTHROUGH ANALYZER SECTION (Task 2.3)
// ============================================================================

// Filter biotech plays
function filterBiotech(category) {
    currentBiotechFilter = category;
    
    // Update active chip
    const parentElement = event.target.closest('.tab-content');
    parentElement.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Rescan with filter
    scanBiotechBreakthroughs();
}

// Main function to scan biotech breakthroughs
async function scanBiotechBreakthroughs() {
    const resultsDiv = document.getElementById('biotechResults');
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Scanning biotech breakthrough opportunities...</div>';
    
    try {
        // Fetch data from API
        const biotechPlays = await API.makeRequest('/biotech', { 
            filter: currentBiotechFilter 
        });
        
        // Generate HTML for results
        let html = '';
        biotechPlays.forEach(play => {
            html += generateBiotechCard(play);
        });
        
        if (html === '') {
            html = '<div class="tip-box">No biotech plays found for the selected filter. Try selecting "All Biotech" or a different category.</div>';
        }
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error fetching biotech data:', error);
        resultsDiv.innerHTML = `
            <div class="tip-box danger">
                <div class="tip-title">⚠️ Error Loading Data</div>
                <div>Unable to load biotech data. Please try again in a moment.</div>
            </div>
        `;
    }
}

// Generate HTML card for biotech play
function generateBiotechCard(play) {
    const upside = play.getUpside();
    const phaseColor = play.getPhaseColor();
    const riskClass = play.riskLevel === 'Low' ? 'profit-positive' : 
                     play.riskLevel === 'Medium' ? 'warning' : 'profit-negative';
    
    return `
        <div class="stock-result">
            <div class="stock-header">
                <div>
                    <div class="stock-symbol">${play.symbol}</div>
                    <div style="color: var(--text-gray); font-size: 0.9rem;">${play.company}</div>
                </div>
                <div style="text-align: right;">
                    <div class="catalyst-tag" style="background-color: ${phaseColor}; color: white;">
                        ${play.trialPhase}
                    </div>
                    <div class="catalyst-tag ${riskClass}">${play.riskLevel} Risk</div>
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary-yellow); margin-bottom: 5px;">
                    ${play.drugName} - ${play.indication}
                </div>
                <div style="color: var(--text-gray);">
                    Market Size: $${(play.marketSize / 1000000000).toFixed(1)}B
                </div>
            </div>
            
            <div class="trade-details">
                <div class="detail-row">
                    <span class="detail-label">Current Price:</span>
                    <span class="detail-value">$${play.currentPrice.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Target Price:</span>
                    <span class="detail-value profit-positive">$${play.targetPrice.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Potential Upside:</span>
                    <span class="detail-value profit-positive">+${upside}%</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Trial Phase:</span>
                    <span class="detail-value">${play.trialPhase}</span>
                </div>
            </div>
            
            <div class="probability-meter">
                <span style="color: var(--text-gray); font-size: 0.9rem;">Success Probability:</span>
                <div class="probability-bar">
                    <div class="probability-fill" style="width: ${play.probability}%"></div>
                </div>
                <span style="font-weight: 700; color: var(--primary-green);">${play.probability}%</span>
            </div>
            
            ${play.partnerships.length > 0 ? `
                <div style="margin: 15px 0;">
                    <div style="font-weight: 700; color: var(--primary-yellow); margin-bottom: 10px;">🤝 Key Partnerships:</div>
                    <div>
                        ${play.partnerships.map(partner => `<span class="catalyst-tag">${partner}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="tip-box ${riskClass}">
                <div class="tip-title">🧬 Investment Thesis:</div>
                <div style="color: var(--text-gray);">
                    ${play.trialPhase} drug targeting ${play.indication} in a $${(play.marketSize / 1000000000).toFixed(1)}B market. 
                    ${play.probability}% probability of success based on trial data and regulatory pathway.
                </div>
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-primary btn-small" onclick="openBrokerLink('${play.symbol}')">
                    📱 Trade ${play.symbol}
                </button>
                <button class="btn btn-secondary btn-small" onclick="setPriceAlert('${play.symbol}', ${play.currentPrice})">
                    🔔 Set Alert
                </button>
            </div>
        </div>
    `;
}

// ============================================================================
// GROWTH STOCKS ANALYZER SECTION (Task 2.4)
// ============================================================================

// Filter growth stocks
function filterGrowthStocks(category) {
    currentGrowthFilter = category;
    
    // Update active chip
    const parentElement = event.target.closest('.tab-content');
    parentElement.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Rescan with filter
    scanGrowthStocks();
}

// Main function to scan growth stocks
async function scanGrowthStocks() {
    const resultsDiv = document.getElementById('growthStocksResults');
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Scanning high-growth companies with disruptive potential...</div>';
    
    try {
        // Fetch data from API
        const growthStocks = await API.makeRequest('/growth-stocks', { 
            filter: currentGrowthFilter 
        });
        
        // Generate HTML for results
        let html = '';
        growthStocks.forEach(stock => {
            html += generateGrowthStockCard(stock);
        });
        
        if (html === '') {
            html = '<div class="tip-box">No growth stocks found for the selected filter. Try selecting "All Growth" or a different category.</div>';
        }
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error fetching growth stocks data:', error);
        resultsDiv.innerHTML = `
            <div class="tip-box danger">
                <div class="tip-title">⚠️ Error Loading Data</div>
                <div>Unable to load growth stocks data. Please try again in a moment.</div>
            </div>
        `;
    }
}

// Generate HTML card for growth stock
function generateGrowthStockCard(stock) {
    const upside = ((stock.targetPrice - stock.currentPrice) / stock.currentPrice * 100).toFixed(1);
    const riskClass = stock.riskLevel === 'Low' ? 'profit-positive' : 
                     stock.riskLevel === 'Medium' ? 'warning' : 'profit-negative';
    
    return `
        <div class="stock-result">
            <div class="stock-header">
                <div>
                    <div class="stock-symbol">${stock.symbol}</div>
                    <div style="color: var(--text-gray); font-size: 0.9rem;">${stock.company}</div>
                </div>
                <div style="text-align: right;">
                    <div class="catalyst-tag">${stock.sector}</div>
                    <div class="catalyst-tag ${riskClass}">${stock.riskLevel} Risk</div>
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary-yellow); margin-bottom: 5px;">
                    ${stock.marketExpansion}
                </div>
                <div style="color: var(--text-gray);">
                    Competitive Advantage: ${stock.competitiveAdvantage}
                </div>
            </div>
            
            <div class="trade-details">
                <div class="detail-row">
                    <span class="detail-label">Current Price:</span>
                    <span class="detail-value">$${stock.currentPrice.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Target Price:</span>
                    <span class="detail-value profit-positive">$${stock.targetPrice.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Potential Upside:</span>
                    <span class="detail-value profit-positive">+${upside}%</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Revenue Growth:</span>
                    <span class="detail-value profit-positive">+${stock.revenueGrowth}%</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Margin Expansion:</span>
                    <span class="detail-value ${stock.marginGrowth >= 0 ? 'profit-positive' : 'profit-negative'}">
                        ${stock.marginGrowth >= 0 ? '+' : ''}${stock.marginGrowth}%
                    </span>
                </div>
            </div>
            
            <div class="probability-meter">
                <span style="color: var(--text-gray); font-size: 0.9rem;">Success Probability:</span>
                <div class="probability-bar">
                    <div class="probability-fill" style="width: ${stock.confidence}%"></div>
                </div>
                <span style="font-weight: 700; color: var(--primary-green);">${stock.confidence}%</span>
            </div>
            
            <div style="margin: 15px 0;">
                <div style="font-weight: 700; color: var(--primary-yellow); margin-bottom: 10px;">🚀 Growth Catalysts:</div>
                <div>
                    ${stock.catalysts.map(catalyst => `<span class="catalyst-tag">${catalyst}</span>`).join('')}
                </div>
            </div>
            
            <div class="tip-box success">
                <div class="tip-title">📈 Growth Investment Thesis:</div>
                <div style="color: var(--text-gray);">
                    ${stock.revenueGrowth}% revenue growth in expanding ${stock.marketExpansion} market. 
                    Competitive moat: ${stock.competitiveAdvantage}. 
                    Target timeframe: ${stock.timeframe}.
                </div>
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-primary btn-small" onclick="openBrokerLink('${stock.symbol}')">
                    📱 Trade ${stock.symbol}
                </button>
                <button class="btn btn-secondary btn-small" onclick="setPriceAlert('${stock.symbol}', ${stock.currentPrice})">
                    🔔 Set Alert
                </button>
            </div>
        </div>
    `;
}

// ============================================================================
// PENNY STOCKS SCANNER SECTION (Task 2.5)
// ============================================================================

// Main function to scan penny stocks
async function scanPennyStocksRecommendations() {
    const resultsDiv = document.getElementById('pennyStocksResults');
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Scanning penny stocks with legitimate fundamentals...</div>';
    
    try {
        // Fetch data from API
        const pennyStocks = await API.makeRequest('/penny-stocks');
        
        // Generate HTML for results
        let html = '';
        pennyStocks.forEach(stock => {
            html += generatePennyStockCard(stock);
        });
        
        if (html === '') {
            html = '<div class="tip-box">No penny stocks found meeting our fundamental criteria.</div>';
        }
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error fetching penny stocks data:', error);
        resultsDiv.innerHTML = `
            <div class="tip-box danger">
                <div class="tip-title">⚠️ Error Loading Data</div>
                <div>Unable to load penny stocks data. Please try again in a moment.</div>
            </div>
        `;
    }
}

// Generate HTML card for penny stock
function generatePennyStockCard(stock) {
    const upside = ((stock.targetPrice - stock.price) / stock.price * 100).toFixed(1);
    
    return `
        <div class="stock-result">
            <div class="stock-header">
                <div>
                    <div class="stock-symbol">${stock.symbol}</div>
                    <div style="color: var(--text-gray); font-size: 0.9rem;">${stock.company}</div>
                </div>
                <div style="text-align: right;">
                    <div class="stock-price profit-positive">$${stock.price.toFixed(2)}</div>
                    <div class="price-change profit-positive">${stock.change}</div>
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary-yellow); margin-bottom: 5px;">
                    ${stock.catalyst}
                </div>
                <div style="color: var(--text-gray);">
                    Volume: ${stock.volume} | Fundamentals: ${stock.fundamentals}
                </div>
            </div>
            
            <div class="trade-details">
                <div class="detail-row">
                    <span class="detail-label">Entry Price:</span>
                    <span class="detail-value">$${stock.price.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Target Price:</span>
                    <span class="detail-value profit-positive">$${stock.targetPrice.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Stop Loss:</span>
                    <span class="detail-value profit-negative">$${stock.stopLoss.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Potential Upside:</span>
                    <span class="detail-value profit-positive">+${upside}%</span>
                </div>
            </div>
            
            <div class="probability-meter">
                <span style="color: var(--text-gray); font-size: 0.9rem;">Success Probability:</span>
                <div class="probability-bar">
                    <div class="probability-fill" style="width: ${stock.probability}%"></div>
                </div>
                <span style="font-weight: 700; color: var(--primary-green);">${stock.probability}%</span>
            </div>
            
            <div class="tip-box danger">
                <div class="tip-title">⚠️ Risk Warning:</div>
                <div style="color: var(--text-gray);">
                    ${stock.riskWarning}. Position Size: ${stock.positionSize}. 
                    Never invest more than you can afford to lose completely.
                </div>
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-primary btn-small" onclick="openBrokerLink('${stock.symbol}')">
                    📱 Trade ${stock.symbol}
                </button>
                <button class="btn btn-secondary btn-small" onclick="setPriceAlert('${stock.symbol}', ${stock.price})">
                    🔔 Set Alert
                </button>
            </div>
        </div>
    `;
}

// ============================================================================
// OPTIONS RECOMMENDATIONS SECTION (Task 3.1 & 3.2)
// ============================================================================

// Filter options strategies
function filterOptions(category) {
    currentOptionsFilter = category;
    
    // Update active chip
    const parentElement = event.target.closest('.tab-content');
    parentElement.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Rescan with filter
    scanOptionsRecommendations();
}

// Main function to scan options recommendations
async function scanOptionsRecommendations() {
    const resultsDiv = document.getElementById('optionsResults');
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Analyzing options strategies and market conditions...</div>';
    
    try {
        // Fetch data from API
        const optionsRecommendations = await API.makeRequest('/options-recommendations', { 
            filter: currentOptionsFilter 
        });
        
        // Generate HTML for results
        let html = '';
        optionsRecommendations.forEach(option => {
            html += generateOptionsCard(option);
        });
        
        if (html === '') {
            html = '<div class="tip-box">No options strategies found for the selected filter. Try selecting "All Strategies" or a different category.</div>';
        }
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error fetching options data:', error);
        resultsDiv.innerHTML = `
            <div class="tip-box danger">
                <div class="tip-title">⚠️ Error Loading Data</div>
                <div>Unable to load options data. Please try again in a moment.</div>
            </div>
        `;
    }
}

// Generate HTML card for options recommendation
function generateOptionsCard(option) {
    const upside = option.calculateUpside();
    const daysToExpiration = option.getDaysToExpiration();
    const timeDecayRisk = option.getTimeDecayRisk();
    const riskClass = option.riskLevel === 'Low' ? 'profit-positive' : 
                     option.riskLevel === 'Medium' ? 'warning' : 'profit-negative';
    const timeDecayClass = timeDecayRisk === 'Low' ? 'profit-positive' : 
                          timeDecayRisk === 'Medium' ? 'warning' : 'profit-negative';
    
    // Get strategy-specific display information
    const strategyInfo = getOptionsStrategyInfo(option);
    
    return `
        <div class="stock-result">
            <div class="stock-header">
                <div>
                    <div class="stock-symbol">${option.symbol}</div>
                    <div style="color: var(--text-gray); font-size: 0.9rem;">${getCompanyName(option.symbol)}</div>
                </div>
                <div style="text-align: right;">
                    <div class="catalyst-tag ${strategyInfo.color}">${strategyInfo.label}</div>
                    <div class="catalyst-tag ${riskClass}">${option.riskLevel} Risk</div>
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary-yellow); margin-bottom: 5px;">
                    ${strategyInfo.description}
                </div>
                <div style="color: var(--text-gray);">
                    ${option.catalyst} | Expires: ${formatDate(option.expiration)} (${daysToExpiration} days)
                </div>
            </div>
            
            <div class="trade-details">
                <div class="detail-row">
                    <span class="detail-label">Entry Price:</span>
                    <span class="detail-value">${option.entryPrice.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Target Price:</span>
                    <span class="detail-value profit-positive">${option.targetPrice.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Stop Loss:</span>
                    <span class="detail-value profit-negative">${option.stopLoss.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Potential Upside:</span>
                    <span class="detail-value profit-positive">+${upside}%</span>
                </div>
                ${option.optionType !== 'spread' ? `
                <div class="detail-row">
                    <span class="detail-label">Strike Price:</span>
                    <span class="detail-value">${option.strike.toFixed(2)}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="probability-meter">
                <span style="color: var(--text-gray); font-size: 0.9rem;">Success Probability:</span>
                <div class="probability-bar">
                    <div class="probability-fill" style="width: ${option.confidence}%"></div>
                </div>
                <span style="font-weight: 700; color: var(--primary-green);">${option.confidence}%</span>
            </div>
            
            <!-- Greeks Display -->
            <div class="insider-stats" style="margin: 20px 0;">
                <div class="stat-box">
                    <div class="stat-label">Delta</div>
                    <div class="stat-value">${option.delta.toFixed(2)}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Gamma</div>
                    <div class="stat-value">${option.gamma.toFixed(3)}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">IV</div>
                    <div class="stat-value">${option.impliedVolatility.toFixed(1)}%</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Expected Move</div>
                    <div class="stat-value">${option.expectedMove.toFixed(1)}%</div>
                </div>
            </div>
            
            <!-- Time Decay Warning -->
            <div class="tip-box ${timeDecayClass}">
                <div class="tip-title">⏰ Time Decay Risk: ${timeDecayRisk}</div>
                <div style="color: var(--text-gray);">
                    ${daysToExpiration} days to expiration. Daily theta: ${option.timeDecay.toFixed(2)}. 
                    ${timeDecayRisk === 'High' ? 'Options lose value rapidly near expiration!' : 
                      timeDecayRisk === 'Medium' ? 'Monitor time decay closely.' : 'Sufficient time for thesis to play out.'}
                </div>
            </div>
            
            <!-- Strategy Analysis -->
            <div class="tip-box">
                <div class="tip-title">📊 Strategy Analysis:</div>
                <div style="color: var(--text-gray);">
                    ${option.description}
                </div>
                <ul style="margin: 10px 0 0 20px; color: var(--text-gray); line-height: 1.8;">
                    ${option.reasoning.map(reason => `<li>${reason}</li>`).join('')}
                </ul>
            </div>
            
            <!-- Volatility Analysis -->
            ${option.impliedVolatility > 40 ? `
            <div class="tip-box warning">
                <div class="tip-title">⚠️ High Volatility Warning:</div>
                <div style="color: var(--text-gray);">
                    IV is ${option.impliedVolatility.toFixed(1)}% - options are expensive. 
                    Consider volatility crush risk after earnings or events.
                </div>
            </div>
            ` : ''}
            
            <div class="action-buttons">
                <button class="btn btn-primary btn-small" onclick="openOptionsOrder('${option.symbol}', '${option.optionType}', ${option.strike}, '${option.expiration}')">
                    📱 Trade Options
                </button>
                <button class="btn btn-secondary btn-small" onclick="setPriceAlert('${option.symbol}', ${option.strike})">
                    🔔 Set Alert
                </button>
                <button class="btn btn-secondary btn-small" onclick="copyOptionsOrder(${JSON.stringify(option).replace(/"/g, '&quot;')})">
                    📋 Copy Order
                </button>
            </div>
        </div>
    `;
}

// Get strategy-specific display information
function getOptionsStrategyInfo(option) {
    switch(option.optionType) {
        case 'call':
            return {
                label: '📈 CALL',
                color: 'profit-positive',
                description: `${option.strike} Call - ${formatDate(option.expiration)}`
            };
        case 'put':
            return {
                label: '📉 PUT',
                color: 'profit-negative',
                description: `${option.strike} Put - ${formatDate(option.expiration)}`
            };
        case 'straddle':
            return {
                label: '🎯 STRADDLE',
                color: 'warning',
                description: `${option.strike} Straddle - Profit from big moves either direction`
            };
        case 'strangle':
            return {
                label: '🎯 STRANGLE',
                color: 'warning',
                description: `Strangle - Lower cost volatility play`
            };
        case 'spread':
            return {
                label: '📊 SPREAD',
                color: 'profit-positive',
                description: `Bull Call Spread - Limited risk, limited reward`
            };
        default:
            return {
                label: '📊 OPTIONS',
                color: 'warning',
                description: 'Options Strategy'
            };
    }
}

// Open options order (placeholder for broker integration)
function openOptionsOrder(symbol, optionType, strike, expiration) {
    const expirationDate = new Date(expiration).toLocaleDateString();
    alert(`Opening ${optionType.toUpperCase()} options order for ${symbol}:\n` +
          `Strike: ${strike}\n` +
          `Expiration: ${expirationDate}\n\n` +
          `This would integrate with your broker (Robinhood, TD Ameritrade, etc.)`);
}

// Copy options order details to clipboard
function copyOptionsOrder(option) {
    const orderText = `Options Order:\n` +
                     `${option.symbol} ${option.optionType.toUpperCase()}\n` +
                     `Strike: ${option.strike}\n` +
                     `Expiration: ${new Date(option.expiration).toLocaleDateString()}\n` +
                     `Entry: ${option.entryPrice}\n` +
                     `Target: ${option.targetPrice}\n` +
                     `Stop: ${option.stopLoss}\n` +
                     `Strategy: ${option.description}`;
    
    navigator.clipboard.writeText(orderText).then(() => {
        alert('✅ Options order details copied to clipboard!');
    }).catch(() => {
        alert('❌ Failed to copy to clipboard. Please copy manually:\n\n' + orderText);
    });
}

// ============================================================================
// ADVANCED OPTIONS STRATEGY ENGINE (Task 3.2)
// ============================================================================

// Options Strategy Analyzer Class
class OptionsStrategyAnalyzer {
    constructor() {
        this.volatilityThresholds = {
            low: 20,
            medium: 35,
            high: 50
        };
        this.timeDecayThresholds = {
            safe: 30,
            caution: 14,
            danger: 7
        };
    }

    // Analyze market conditions for optimal strategy selection
    analyzeMarketConditions(symbol, currentPrice, impliedVolatility, daysToExpiration) {
        const conditions = {
            volatilityLevel: this.getVolatilityLevel(impliedVolatility),
            timeDecayRisk: this.getTimeDecayRisk(daysToExpiration),
            priceLevel: this.analyzePriceLevel(currentPrice),
            marketTrend: this.analyzeMarketTrend(symbol)
        };

        return this.recommendStrategy(conditions);
    }

    // Get volatility level classification
    getVolatilityLevel(iv) {
        if (iv < this.volatilityThresholds.low) return 'low';
        if (iv < this.volatilityThresholds.medium) return 'medium';
        if (iv < this.volatilityThresholds.high) return 'high';
        return 'extreme';
    }

    // Assess time decay risk
    getTimeDecayRisk(daysToExpiration) {
        if (daysToExpiration > this.timeDecayThresholds.safe) return 'low';
        if (daysToExpiration > this.timeDecayThresholds.caution) return 'medium';
        return 'high';
    }

    // Analyze current price level (simplified)
    analyzePriceLevel(currentPrice) {
        // This would integrate with technical analysis in a real implementation
        return Math.random() > 0.5 ? 'oversold' : 'overbought';
    }

    // Analyze market trend (simplified)
    analyzeMarketTrend(symbol) {
        // This would integrate with trend analysis in a real implementation
        const trends = ['bullish', 'bearish', 'sideways'];
        return trends[Math.floor(Math.random() * trends.length)];
    }

    // Recommend optimal strategy based on conditions
    recommendStrategy(conditions) {
        const { volatilityLevel, timeDecayRisk, priceLevel, marketTrend } = conditions;

        // High volatility strategies
        if (volatilityLevel === 'extreme' || volatilityLevel === 'high') {
            if (timeDecayRisk === 'low') {
                return {
                    primary: 'straddle',
                    secondary: 'strangle',
                    reasoning: 'High volatility with sufficient time - profit from large moves'
                };
            } else {
                return {
                    primary: 'spread',
                    secondary: 'short_options',
                    reasoning: 'High volatility but short time - sell premium or use spreads'
                };
            }
        }

        // Low volatility strategies
        if (volatilityLevel === 'low') {
            if (marketTrend === 'bullish') {
                return {
                    primary: 'call',
                    secondary: 'bull_spread',
                    reasoning: 'Low volatility + bullish trend - buy calls or bull spreads'
                };
            } else if (marketTrend === 'bearish') {
                return {
                    primary: 'put',
                    secondary: 'bear_spread',
                    reasoning: 'Low volatility + bearish trend - buy puts or bear spreads'
                };
            }
        }

        // Medium volatility - directional plays
        if (marketTrend === 'bullish' && priceLevel === 'oversold') {
            return {
                primary: 'call',
                secondary: 'bull_spread',
                reasoning: 'Bullish trend + oversold level - directional call plays'
            };
        }

        if (marketTrend === 'bearish' && priceLevel === 'overbought') {
            return {
                primary: 'put',
                secondary: 'bear_spread',
                reasoning: 'Bearish trend + overbought level - directional put plays'
            };
        }

        // Default to neutral strategies
        return {
            primary: 'strangle',
            secondary: 'iron_condor',
            reasoning: 'Mixed signals - use neutral strategies'
        };
    }

    // Calculate expected profit ranges for strategies
    calculateProfitScenarios(option, stockPrice) {
        const scenarios = [];
        const priceRange = stockPrice * 0.3; // +/- 30% price range
        
        for (let i = -15; i <= 15; i++) {
            const priceMove = (i / 100) * stockPrice;
            const newPrice = stockPrice + priceMove;
            const profit = this.calculateOptionProfit(option, newPrice);
            
            scenarios.push({
                priceMove: i,
                stockPrice: newPrice,
                profit: profit,
                profitPercent: (profit / (option.entryPrice * 100)) * 100
            });
        }
        
        return scenarios;
    }

    // Calculate option profit at expiration (simplified)
    calculateOptionProfit(option, stockPrice) {
        let intrinsicValue = 0;
        
        switch(option.optionType) {
            case 'call':
                intrinsicValue = Math.max(0, stockPrice - option.strike);
                break;
            case 'put':
                intrinsicValue = Math.max(0, option.strike - stockPrice);
                break;
            case 'straddle':
                intrinsicValue = Math.abs(stockPrice - option.strike);
                break;
            case 'strangle':
                // Simplified - assumes 5% OTM strikes
                const callStrike = option.strike * 1.05;
                const putStrike = option.strike * 0.95;
                intrinsicValue = Math.max(0, stockPrice - callStrike) + Math.max(0, putStrike - stockPrice);
                break;
            case 'spread':
                // Simplified bull call spread
                const longStrike = option.strike;
                const shortStrike = option.strike * 1.1;
                intrinsicValue = Math.max(0, Math.min(stockPrice - longStrike, shortStrike - longStrike));
                break;
        }
        
        return (intrinsicValue * 100) - (option.entryPrice * 100);
    }

    // Assess volatility-based strategy recommendations
    getVolatilityBasedRecommendations(impliedVolatility, historicalVolatility) {
        const ivRank = (impliedVolatility - 10) / 80; // Normalize IV to 0-1 scale
        const recommendations = [];

        if (ivRank > 0.8) {
            recommendations.push({
                strategy: 'Sell Premium',
                confidence: 85,
                reasoning: 'Extremely high IV - sell straddles, strangles, or iron condors'
            });
        } else if (ivRank > 0.6) {
            recommendations.push({
                strategy: 'Neutral Strategies',
                confidence: 75,
                reasoning: 'High IV - consider iron butterflies or calendar spreads'
            });
        } else if (ivRank < 0.3) {
            recommendations.push({
                strategy: 'Buy Options',
                confidence: 80,
                reasoning: 'Low IV - buy calls, puts, or long straddles'
            });
        } else {
            recommendations.push({
                strategy: 'Directional Plays',
                confidence: 70,
                reasoning: 'Moderate IV - use directional strategies with defined risk'
            });
        }

        return recommendations;
    }

    // Generate risk scenarios for complex strategies
    generateRiskScenarios(option) {
        const scenarios = {
            bestCase: {
                description: 'Maximum profit scenario',
                profit: option.targetPrice - option.entryPrice,
                probability: 25
            },
            worstCase: {
                description: 'Maximum loss scenario',
                profit: option.stopLoss - option.entryPrice,
                probability: 20
            },
            breakeven: {
                description: 'Breakeven scenario',
                profit: 0,
                probability: 30
            },
            likely: {
                description: 'Most probable outcome',
                profit: (option.targetPrice - option.entryPrice) * 0.4,
                probability: 25
            }
        };

        return scenarios;
    }
}

// Create global instance
const optionsAnalyzer = new OptionsStrategyAnalyzer();

// Enhanced options recommendation function with strategy engine
function generateAdvancedOptionsRecommendation(symbol, marketData) {
    const analysis = optionsAnalyzer.analyzeMarketConditions(
        symbol,
        marketData.currentPrice,
        marketData.impliedVolatility,
        marketData.daysToExpiration
    );

    const profitScenarios = optionsAnalyzer.calculateProfitScenarios(
        marketData.option,
        marketData.currentPrice
    );

    const volatilityRecommendations = optionsAnalyzer.getVolatilityBasedRecommendations(
        marketData.impliedVolatility,
        marketData.historicalVolatility || 25
    );

    const riskScenarios = optionsAnalyzer.generateRiskScenarios(marketData.option);

    return {
        primaryStrategy: analysis.primary,
        secondaryStrategy: analysis.secondary,
        reasoning: analysis.reasoning,
        profitScenarios: profitScenarios,
        volatilityAnalysis: volatilityRecommendations,
        riskScenarios: riskScenarios,
        confidence: calculateStrategyConfidence(analysis, marketData)
    };
}

// Calculate confidence score for strategy recommendation
function calculateStrategyConfidence(analysis, marketData) {
    let confidence = 50; // Base confidence

    // Adjust based on volatility conditions
    if (marketData.impliedVolatility > 40 && analysis.primary === 'straddle') {
        confidence += 20; // High confidence in volatility plays when IV is high
    }

    // Adjust based on time decay
    if (marketData.daysToExpiration > 30) {
        confidence += 10; // More confidence with more time
    } else if (marketData.daysToExpiration < 7) {
        confidence -= 15; // Less confidence near expiration
    }

    // Adjust based on market conditions
    if (analysis.reasoning.includes('trend')) {
        confidence += 15; // Higher confidence when trend is clear
    }

    return Math.min(95, Math.max(30, confidence));
}

// ============================================================================
// NEWS ANALYSIS AND CATALYST TRACKING SYSTEM (Task 6.1 & 6.2)
// ============================================================================

// Global state for news and catalyst filters
let currentNewsFilter = 'all';
let currentCatalystEventsFilter = 'all';

// Filter news analysis
function filterNewsAnalysis(category) {
    currentNewsFilter = category;
    
    // Update active chip
    const parentElement = event.target.closest('.tab-content');
    parentElement.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Rescan with filter
    scanNewsAnalysis();
}

// Main function to scan news analysis
async function scanNewsAnalysis() {
    const resultsDiv = document.getElementById('newsAnalysisResults');
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Processing real-time news and analyzing market impact...</div>';
    
    try {
        // Fetch data from API
        const newsItems = await API.makeRequest('/news-analysis', { 
            filter: currentNewsFilter 
        });
        
        // Generate HTML for results
        let html = '';
        newsItems.forEach(news => {
            html += generateNewsAnalysisCard(news);
        });
        
        if (html === '') {
            html = '<div class="tip-box">No news items found for the selected filter. Try selecting "All News" or a different category.</div>';
        }
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error fetching news analysis data:', error);
        resultsDiv.innerHTML = `
            <div class="tip-box danger">
                <div class="tip-title">⚠️ Error Loading Data</div>
                <div>Unable to load news analysis data. Please try again in a moment.</div>
            </div>
        `;
    }
}

// Generate HTML card for news analysis
function generateNewsAnalysisCard(news) {
    const sentimentClass = news.getSentimentClass();
    const impactClass = news.getImpactClass();
    const recommendation = news.getRecommendation();
    const isBreaking = news.isBreaking();
    
    return `
        <div class="stock-result ${isBreaking ? 'breaking-news' : ''}">
            ${isBreaking ? '<div class="breaking-banner">🚨 BREAKING NEWS</div>' : ''}
            
            <div class="stock-header">
                <div>
                    <div class="news-headline" style="font-size: 1.1rem; font-weight: 700; color: var(--primary-yellow); margin-bottom: 5px;">
                        ${news.headline}
                    </div>
                    <div style="color: var(--text-gray); font-size: 0.9rem;">
                        ${news.source} • ${news.getFormattedDate()}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div class="catalyst-tag ${impactClass}">${news.getImpactLevel()} Impact</div>
                    <div class="catalyst-tag">${news.getCategoryDisplay()}</div>
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <div style="font-size: 1rem; color: var(--text-white); line-height: 1.6;">
                    ${news.content ? news.content.substring(0, 200) + '...' : 'Click to read full article'}
                </div>
            </div>
            
            <!-- Affected Symbols -->
            ${news.affectedSymbols.length > 0 ? `
                <div style="margin: 15px 0;">
                    <div style="font-weight: 700; color: var(--primary-yellow); margin-bottom: 10px;">📈 Affected Stocks:</div>
                    <div>
                        ${news.affectedSymbols.map(symbol => `<span class="catalyst-tag" onclick="openBrokerLink('${symbol}')">${symbol}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- Sentiment and Impact Analysis -->
            <div class="trade-details">
                <div class="detail-row">
                    <span class="detail-label">Sentiment Score:</span>
                    <span class="detail-value ${sentimentClass}">${news.sentiment > 0 ? '+' : ''}${news.sentiment.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Impact Score:</span>
                    <span class="detail-value">${news.impactScore}/10</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Price Impact:</span>
                    <span class="detail-value ${news.priceImpactPrediction >= 0 ? 'profit-positive' : 'profit-negative'}">
                        ${news.priceImpactPrediction >= 0 ? '+' : ''}${news.priceImpactPrediction.toFixed(1)}%
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Confidence:</span>
                    <span class="detail-value">${(news.confidence * 100).toFixed(0)}%</span>
                </div>
            </div>
            
            <!-- Trading Recommendation -->
            <div class="tip-box ${recommendation.class}">
                <div class="tip-title">🎯 Trading Signal: ${recommendation.action}</div>
                <div style="color: var(--text-gray);">
                    ${recommendation.reasoning}
                </div>
            </div>
            
            <!-- News Source and Link -->
            <div class="action-buttons">
                ${news.url ? `
                    <button class="btn btn-primary btn-small" onclick="window.open('${news.url}', '_blank')">
                        📰 Read Full Article
                    </button>
                ` : ''}
                ${news.affectedSymbols.length > 0 ? `
                    <button class="btn btn-secondary btn-small" onclick="openBrokerLink('${news.affectedSymbols[0]}')">
                        📱 Trade ${news.affectedSymbols[0]}
                    </button>
                ` : ''}
                <button class="btn btn-secondary btn-small" onclick="shareNews('${news.headline}', '${news.source}')">
                    📤 Share News
                </button>
            </div>
        </div>
    `;
}

// Filter catalyst events
function filterCatalystEvents(category) {
    currentCatalystEventsFilter = category;
    
    // Update active chip
    const parentElement = event.target.closest('.tab-content');
    parentElement.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Rescan with filter
    scanCatalystEvents();
}

// Main function to scan catalyst events
async function scanCatalystEvents() {
    const resultsDiv = document.getElementById('catalystEventsResults');
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Scanning upcoming catalyst events and probability assessments...</div>';
    
    try {
        // Fetch data from API
        const catalystEvents = await API.makeRequest('/catalyst-events', { 
            filter: currentCatalystEventsFilter 
        });
        
        // Generate HTML for results
        let html = '';
        catalystEvents.forEach(catalyst => {
            html += generateCatalystEventCard(catalyst);
        });
        
        if (html === '') {
            html = '<div class="tip-box">No catalyst events found for the selected filter. Try selecting "All Events" or a different category.</div>';
        }
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error fetching catalyst events data:', error);
        resultsDiv.innerHTML = `
            <div class="tip-box danger">
                <div class="tip-title">⚠️ Error Loading Data</div>
                <div>Unable to load catalyst events data. Please try again in a moment.</div>
            </div>
        `;
    }
}

// Generate HTML card for catalyst event
function generateCatalystEventCard(catalyst) {
    const urgencyClass = catalyst.getUrgencyClass();
    const impactClass = catalyst.getImpactClass();
    const probabilityClass = catalyst.getProbabilityClass();
    const upside = catalyst.getUpside();
    const downside = catalyst.getDownside();
    const daysUntil = catalyst.getDaysUntil();
    const strategy = catalyst.getTradingStrategy();
    const riskAdjustedReturn = catalyst.getRiskAdjustedReturn();
    
    return `
        <div class="stock-result ${catalyst.isOverdue() ? 'overdue-catalyst' : ''}">
            ${catalyst.isOverdue() ? '<div class="overdue-banner">⏰ OVERDUE EVENT</div>' : ''}
            
            <div class="stock-header">
                <div>
                    <div class="stock-symbol">${catalyst.symbol}</div>
                    <div style="color: var(--text-gray); font-size: 0.9rem;">${catalyst.company}</div>
                </div>
                <div style="text-align: right;">
                    <div class="catalyst-tag ${impactClass}">${catalyst.impactLevel} Impact</div>
                    <div class="catalyst-tag ${urgencyClass}">${catalyst.getUrgencyLevel()}</div>
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary-yellow); margin-bottom: 5px;">
                    ${catalyst.getTypeDisplay()}
                </div>
                <div style="color: var(--text-gray);">
                    Expected: ${catalyst.getFormattedDate()} 
                    ${!catalyst.isOverdue() ? `(${daysUntil} days)` : '(Overdue)'}
                </div>
            </div>
            
            <div style="margin: 15px 0; color: var(--text-white); line-height: 1.6;">
                ${catalyst.description}
            </div>
            
            <!-- Price Targets and Probabilities -->
            <div class="trade-details">
                <div class="detail-row">
                    <span class="detail-label">Current Price:</span>
                    <span class="detail-value">${catalyst.currentPrice.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Bull Case Target:</span>
                    <span class="detail-value profit-positive">${catalyst.targetPrice.toFixed(2)} (+${upside}%)</span>
                </div>
                ${catalyst.bearCasePrice > 0 ? `
                <div class="detail-row">
                    <span class="detail-label">Bear Case Target:</span>
                    <span class="detail-value profit-negative">${catalyst.bearCasePrice.toFixed(2)} (${downside}%)</span>
                </div>
                ` : ''}
                <div class="detail-row">
                    <span class="detail-label">Historical Impact:</span>
                    <span class="detail-value">+${catalyst.historicalImpact}% avg</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Risk-Adj Return:</span>
                    <span class="detail-value ${riskAdjustedReturn >= 0 ? 'profit-positive' : 'profit-negative'}">
                        ${riskAdjustedReturn >= 0 ? '+' : ''}${riskAdjustedReturn}%
                    </span>
                </div>
            </div>
            
            <!-- Success Probability -->
            <div class="probability-meter">
                <span style="color: var(--text-gray); font-size: 0.9rem;">Success Probability:</span>
                <div class="probability-bar">
                    <div class="probability-fill" style="width: ${catalyst.probability}%"></div>
                </div>
                <span style="font-weight: 700; color: var(--primary-green);">${catalyst.probability}%</span>
            </div>
            
            <!-- Risk Factors -->
            ${catalyst.riskFactors.length > 0 ? `
                <div style="margin: 15px 0;">
                    <div style="font-weight: 700; color: var(--primary-yellow); margin-bottom: 10px;">⚠️ Key Risk Factors:</div>
                    <ul style="margin: 0 0 0 20px; color: var(--text-gray); line-height: 1.8;">
                        ${catalyst.riskFactors.map(risk => `<li>${risk}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            <!-- Trading Strategy Recommendation -->
            <div class="tip-box ${strategy.strategy.includes('Strong') ? 'success' : strategy.strategy.includes('Monitor') ? 'warning' : ''}">
                <div class="tip-title">🎯 Trading Strategy: ${strategy.strategy}</div>
                <div style="color: var(--text-gray); margin: 10px 0;">
                    <strong>Reasoning:</strong> ${strategy.reasoning}<br>
                    <strong>Position Size:</strong> ${strategy.positionSize}<br>
                    <strong>Timeframe:</strong> ${strategy.timeframe}
                </div>
            </div>
            
            <!-- Countdown Timer for Urgent Events -->
            ${daysUntil <= 7 && !catalyst.isOverdue() ? `
                <div class="tip-box danger">
                    <div class="tip-title">⏰ Urgent: ${daysUntil} Days Remaining</div>
                    <div style="color: var(--text-gray);">
                        Time-sensitive catalyst approaching. Consider position sizing and exit strategy.
                    </div>
                </div>
            ` : ''}
            
            <div class="action-buttons">
                <button class="btn btn-primary btn-small" onclick="openBrokerLink('${catalyst.symbol}')">
                    📱 Trade ${catalyst.symbol}
                </button>
                <button class="btn btn-secondary btn-small" onclick="setPriceAlert('${catalyst.symbol}', ${catalyst.targetPrice})">
                    🔔 Set Target Alert
                </button>
                <button class="btn btn-secondary btn-small" onclick="addToWatchlist('${catalyst.symbol}', '${catalyst.getFormattedDate()}')">
                    👁️ Add to Watchlist
                </button>
            </div>
        </div>
    `;
}

// News-to-Recommendation Correlation Engine
class NewsRecommendationEngine {
    constructor() {
        this.correlationThresholds = {
            strong: 0.8,
            moderate: 0.5,
            weak: 0.3
        };
        this.impactMultipliers = {
            'fda': 1.5,
            'earnings': 1.2,
            'merger': 1.8,
            'contract': 1.1,
            'regulatory': 1.4,
            'clinical': 1.3,
            'partnership': 1.0
        };
    }

    // Correlate news items with existing recommendations
    correlateNewsWithRecommendations(newsItems, recommendations) {
        const correlations = [];
        
        newsItems.forEach(news => {
            news.affectedSymbols.forEach(symbol => {
                const relatedRecommendations = recommendations.filter(rec => 
                    rec.symbol === symbol || rec.affectedSymbols?.includes(symbol)
                );
                
                relatedRecommendations.forEach(rec => {
                    const correlation = this.calculateCorrelation(news, rec);
                    if (correlation.strength >= this.correlationThresholds.weak) {
                        correlations.push(correlation);
                    }
                });
            });
        });
        
        return correlations.sort((a, b) => b.strength - a.strength);
    }

    // Calculate correlation strength between news and recommendation
    calculateCorrelation(news, recommendation) {
        let strength = 0.5; // Base correlation
        
        // Symbol match
        if (news.affectedSymbols.includes(recommendation.symbol)) {
            strength += 0.3;
        }
        
        // Category alignment
        if (this.categoriesAlign(news.category, recommendation.catalyst)) {
            strength += 0.2;
        }
        
        // Sentiment alignment
        const sentimentAlignment = this.calculateSentimentAlignment(news.sentiment, recommendation.action);
        strength += sentimentAlignment * 0.3;
        
        // Impact multiplier
        const multiplier = this.impactMultipliers[news.category] || 1.0;
        strength *= multiplier;
        
        // Time relevance (recent news is more relevant)
        const hoursOld = (Date.now() - news.publishedAt) / (1000 * 60 * 60);
        const timeRelevance = Math.max(0.5, 1 - (hoursOld / 48)); // Decay over 48 hours
        strength *= timeRelevance;
        
        return {
            news: news,
            recommendation: recommendation,
            strength: Math.min(1.0, strength),
            reasoning: this.generateCorrelationReasoning(news, recommendation, strength)
        };
    }

    // Check if news category aligns with recommendation catalyst
    categoriesAlign(newsCategory, recommendationCatalyst) {
        const alignments = {
            'fda': ['FDA', 'approval', 'drug', 'clinical'],
            'earnings': ['earnings', 'revenue', 'profit', 'guidance'],
            'merger': ['merger', 'acquisition', 'takeover', 'deal'],
            'contract': ['contract', 'government', 'defense', 'award'],
            'regulatory': ['regulatory', 'SEC', 'approval', 'decision'],
            'clinical': ['clinical', 'trial', 'study', 'results'],
            'partnership': ['partnership', 'collaboration', 'alliance']
        };
        
        const keywords = alignments[newsCategory] || [];
        return keywords.some(keyword => 
            recommendationCatalyst.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    // Calculate sentiment alignment with recommendation action
    calculateSentimentAlignment(newsSentiment, recommendationAction) {
        if (recommendationAction === 'buy' && newsSentiment > 0) return 1.0;
        if (recommendationAction === 'sell' && newsSentiment < 0) return 1.0;
        if (Math.abs(newsSentiment) < 0.2) return 0.5; // Neutral news
        return 0.0; // Misaligned sentiment
    }

    // Generate reasoning for correlation
    generateCorrelationReasoning(news, recommendation, strength) {
        const reasons = [];
        
        if (news.affectedSymbols.includes(recommendation.symbol)) {
            reasons.push('Direct symbol match');
        }
        
        if (strength > this.correlationThresholds.strong) {
            reasons.push('Strong correlation - news directly supports recommendation');
        } else if (strength > this.correlationThresholds.moderate) {
            reasons.push('Moderate correlation - news provides additional context');
        } else {
            reasons.push('Weak correlation - tangential relationship');
        }
        
        if (news.isBreaking()) {
            reasons.push('Breaking news - immediate relevance');
        }
        
        return reasons.join('; ');
    }

    // Generate updated recommendations based on news
    generateNewsBasedRecommendations(correlations) {
        return correlations
            .filter(corr => corr.strength >= this.correlationThresholds.moderate)
            .map(corr => ({
                symbol: corr.recommendation.symbol,
                action: this.adjustActionBasedOnNews(corr.recommendation.action, corr.news),
                confidence: this.adjustConfidenceBasedOnNews(corr.recommendation.confidence, corr.news, corr.strength),
                reasoning: `Updated based on ${corr.news.source} news: ${corr.news.headline.substring(0, 100)}...`,
                newsCorrelation: corr,
                originalRecommendation: corr.recommendation
            }));
    }

    // Adjust recommendation action based on news sentiment
    adjustActionBasedOnNews(originalAction, news) {
        if (news.sentiment > 0.5 && news.impactScore >= 7) {
            return originalAction === 'sell' ? 'hold' : 'strong_buy';
        } else if (news.sentiment < -0.5 && news.impactScore >= 7) {
            return originalAction === 'buy' ? 'hold' : 'strong_sell';
        }
        return originalAction;
    }

    // Adjust confidence based on news correlation
    adjustConfidenceBasedOnNews(originalConfidence, news, correlationStrength) {
        const newsImpact = (news.impactScore / 10) * correlationStrength;
        const sentimentBoost = Math.abs(news.sentiment) * 0.2;
        
        let adjustment = newsImpact + sentimentBoost;
        if (news.isBreaking()) adjustment += 0.1;
        
        // Positive news increases confidence for buy recommendations
        if (news.sentiment > 0) {
            return Math.min(95, originalConfidence + (adjustment * 20));
        } else {
            return Math.max(30, originalConfidence - (adjustment * 15));
        }
    }
}

// Create global news recommendation engine
const newsRecommendationEngine = new NewsRecommendationEngine();

// Utility functions for news analysis
function shareNews(headline, source) {
    const shareText = `${headline} - ${source}`;
    if (navigator.share) {
        navigator.share({
            title: 'Market News',
            text: shareText,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            alert('✅ News headline copied to clipboard!');
        }).catch(() => {
            alert('❌ Failed to copy to clipboard');
        });
    }
}

function addToWatchlist(symbol, eventDate) {
    // This would integrate with a watchlist system
    alert(`✅ ${symbol} added to watchlist with catalyst date: ${eventDate}`);
}

// Real-time news processing pipeline
class NewsProcessingPipeline {
    constructor() {
        this.processingQueue = [];
        this.isProcessing = false;
        this.updateInterval = 30000; // 30 seconds
        this.sentimentAnalyzer = new SentimentAnalyzer();
        this.impactScorer = new ImpactScorer();
    }

    // Start real-time news processing
    startProcessing() {
        setInterval(() => {
            this.processNewsFeed();
        }, this.updateInterval);
    }

    // Process incoming news feed
    async processNewsFeed() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        try {
            // In a real implementation, this would fetch from news APIs
            const rawNews = await this.fetchLatestNews();
            
            for (const newsItem of rawNews) {
                const processedNews = await this.processNewsItem(newsItem);
                if (processedNews.impactScore >= 5) {
                    this.triggerRecommendationUpdate(processedNews);
                }
            }
        } catch (error) {
            console.error('Error processing news feed:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    // Process individual news item
    async processNewsItem(rawNews) {
        const sentiment = this.sentimentAnalyzer.analyze(rawNews.headline + ' ' + rawNews.content);
        const impactScore = this.impactScorer.calculateImpact(rawNews);
        const affectedSymbols = this.extractAffectedSymbols(rawNews);
        const category = this.categorizeNews(rawNews);
        
        return new NewsAnalysis({
            ...rawNews,
            sentiment: sentiment,
            impactScore: impactScore,
            affectedSymbols: affectedSymbols,
            category: category,
            priceImpactPrediction: this.predictPriceImpact(sentiment, impactScore, category),
            confidence: this.calculateConfidence(rawNews, sentiment, impactScore)
        });
    }

    // Extract affected stock symbols from news content
    extractAffectedSymbols(newsItem) {
        // Simplified symbol extraction - in reality would use NLP
        const symbolPattern = /\b[A-Z]{1,5}\b/g;
        const potentialSymbols = (newsItem.headline + ' ' + newsItem.content).match(symbolPattern) || [];
        
        // Filter to known stock symbols (simplified)
        const knownSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'MRNA', 'PFE', 'PLTR', 'COIN'];
        return potentialSymbols.filter(symbol => knownSymbols.includes(symbol));
    }

    // Categorize news by type
    categorizeNews(newsItem) {
        const content = (newsItem.headline + ' ' + newsItem.content).toLowerCase();
        
        if (content.includes('fda') || content.includes('approval') || content.includes('drug')) return 'fda';
        if (content.includes('earnings') || content.includes('revenue') || content.includes('profit')) return 'earnings';
        if (content.includes('merger') || content.includes('acquisition') || content.includes('takeover')) return 'merger';
        if (content.includes('contract') || content.includes('government') || content.includes('pentagon')) return 'contract';
        if (content.includes('sec') || content.includes('regulatory') || content.includes('investigation')) return 'regulatory';
        if (content.includes('clinical') || content.includes('trial') || content.includes('study')) return 'clinical';
        if (content.includes('partnership') || content.includes('collaboration')) return 'partnership';
        
        return 'general';
    }

    // Predict price impact based on news analysis
    predictPriceImpact(sentiment, impactScore, category) {
        const baseImpact = (impactScore / 10) * Math.abs(sentiment) * 10;
        const categoryMultiplier = this.impactMultipliers[category] || 1.0;
        
        return sentiment >= 0 ? baseImpact * categoryMultiplier : -baseImpact * categoryMultiplier;
    }

    // Calculate confidence in news analysis
    calculateConfidence(newsItem, sentiment, impactScore) {
        let confidence = 0.5;
        
        // Source reliability (simplified)
        const reliableSources = ['Reuters', 'Bloomberg', 'Wall Street Journal', 'SEC', 'FDA'];
        if (reliableSources.some(source => newsItem.source.includes(source))) {
            confidence += 0.3;
        }
        
        // Content quality indicators
        if (newsItem.content && newsItem.content.length > 200) confidence += 0.1;
        if (Math.abs(sentiment) > 0.5) confidence += 0.1;
        if (impactScore >= 7) confidence += 0.1;
        
        return Math.min(0.95, confidence);
    }

    // Trigger recommendation updates based on breaking news
    triggerRecommendationUpdate(newsItem) {
        if (newsItem.isBreaking() && newsItem.impactScore >= 8) {
            // Trigger immediate recommendation refresh for affected symbols
            newsItem.affectedSymbols.forEach(symbol => {
                this.updateRecommendationsForSymbol(symbol, newsItem);
            });
        }
    }

    // Update recommendations for specific symbol based on news
    updateRecommendationsForSymbol(symbol, newsItem) {
        // This would integrate with the main recommendation system
        console.log(`Updating recommendations for ${symbol} based on breaking news: ${newsItem.headline}`);
        
        // Emit event for real-time updates
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('recommendationUpdate', {
                detail: { symbol, newsItem }
            }));
        }
    }

    // Fetch latest news (placeholder for real API integration)
    async fetchLatestNews() {
        // In a real implementation, this would call news APIs like:
        // - Alpha Vantage News API
        // - Finnhub News API  
        // - NewsAPI
        // - Custom RSS feeds
        
        return []; // Placeholder
    }
}

// Simplified sentiment analyzer
class SentimentAnalyzer {
    constructor() {
        this.positiveWords = ['approved', 'beat', 'growth', 'increase', 'positive', 'strong', 'success', 'win', 'gain', 'up'];
        this.negativeWords = ['rejected', 'miss', 'decline', 'decrease', 'negative', 'weak', 'failure', 'lose', 'loss', 'down'];
    }

    analyze(text) {
        const words = text.toLowerCase().split(/\s+/);
        let score = 0;
        
        words.forEach(word => {
            if (this.positiveWords.includes(word)) score += 1;
            if (this.negativeWords.includes(word)) score -= 1;
        });
        
        // Normalize to -1 to 1 range
        return Math.max(-1, Math.min(1, score / Math.max(1, words.length / 10)));
    }
}

// Simplified impact scorer
class ImpactScorer {
    calculateImpact(newsItem) {
        let score = 5; // Base score
        
        // Source impact
        if (newsItem.source.includes('SEC') || newsItem.source.includes('FDA')) score += 3;
        if (newsItem.source.includes('Reuters') || newsItem.source.includes('Bloomberg')) score += 2;
        
        // Content indicators
        const content = (newsItem.headline + ' ' + newsItem.content).toLowerCase();
        if (content.includes('billion')) score += 2;
        if (content.includes('approval') || content.includes('merger')) score += 2;
        if (content.includes('investigation') || content.includes('lawsuit')) score += 1;
        
        return Math.min(10, score);
    }
}

// Initialize news processing pipeline
const newsProcessingPipeline = new NewsProcessingPipeline();

// Utility functions for news and catalyst system
function getCompanyName(symbol) {
    const companies = {
        'AAPL': 'Apple Inc.',
        'MSFT': 'Microsoft Corporation',
        'GOOGL': 'Alphabet Inc.',
        'AMZN': 'Amazon.com Inc.',
        'TSLA': 'Tesla Inc.',
        'NVDA': 'NVIDIA Corporation',
        'META': 'Meta Platforms Inc.',
        'NFLX': 'Netflix Inc.',
        'MRNA': 'Moderna Inc.',
        'PFE': 'Pfizer Inc.',
        'PLTR': 'Palantir Technologies',
        'COIN': 'Coinbase Global Inc.',
        'BNTX': 'BioNTech SE',
        'GILD': 'Gilead Sciences',
        'DIS': 'The Walt Disney Company',
        'REGN': 'Regeneron Pharmaceuticals',
        'ENPH': 'Enphase Energy',
        'RBLX': 'Roblox Corporation',
        'LMT': 'Lockheed Martin',
        'GEO': 'The GEO Group',
        'VMW': 'VMware Inc.',
        'ATVI': 'Activision Blizzard',
        'AVGO': 'Broadcom Inc.'
    };
    return companies[symbol] || `${symbol} Corporation`;
}

function formatDate(date) {
    if (typeof date === 'string') date = new Date(date);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function openBrokerLink(symbol) {
    // Placeholder for broker integration
    alert(`Opening ${symbol} in your broker app. This would integrate with:\n• Robinhood\n• TD Ameritrade\n• Charles Schwab\n• E*TRADE\n• Fidelity`);
}

function openAnalysisLink(symbol) {
    // Placeholder for analysis tool integration
    alert(`Opening ${symbol} analysis in Think or Swim / TradingView`);
}

function setPriceAlert(symbol, price) {
    // Placeholder for price alert system
    alert(`✅ Price alert set for ${symbol} at $${price.toFixed(2)}`);
}

// ============================================================================
// SHORT SQUEEZE DETECTOR SECTION (Task 2.6)
// ============================================================================

// Main function to scan short squeeze opportunities
async function scanShortSqueezeOpportunities() {
    const resultsDiv = document.getElementById('shortSqueezeResults');
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Scanning for short squeeze potential...</div>';
    
    try {
        // Fetch data from API
        const shortSqueezeStocks = await API.makeRequest('/short-squeeze');
        
        // Generate HTML for results
        let html = '';
        shortSqueezeStocks.forEach(stock => {
            html += generateShortSqueezeCard(stock);
        });
        
        if (html === '') {
            html = '<div class="tip-box">No significant short squeeze opportunities detected at this time.</div>';
        }
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error fetching short squeeze data:', error);
        resultsDiv.innerHTML = `
            <div class="tip-box danger">
                <div class="tip-title">⚠️ Error Loading Data</div>
                <div>Unable to load short squeeze data. Please try again in a moment.</div>
            </div>
        `;
    }
}

// Generate HTML card for short squeeze candidate
function generateShortSqueezeCard(stock) {
    const upside = ((stock.targetPrice - stock.currentPrice) / stock.currentPrice * 100).toFixed(1);
    
    return `
        <div class="stock-result">
            <div class="stock-header">
                <div>
                    <div class="stock-symbol">${stock.symbol}</div>
                    <div style="color: var(--text-gray); font-size: 0.9rem;">${stock.company}</div>
                </div>
                <div style="text-align: right;">
                    <div class="catalyst-tag profit-negative">${stock.riskLevel} Risk</div>
                    <div class="catalyst-tag">${stock.gammaLevel} Gamma</div>
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary-yellow); margin-bottom: 5px;">
                    Short Squeeze Candidate
                </div>
                <div style="color: var(--text-gray);">
                    ${stock.unusualOptions}
                </div>
            </div>
            
            <div class="trade-details">
                <div class="detail-row">
                    <span class="detail-label">Current Price:</span>
                    <span class="detail-value">$${stock.currentPrice.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Squeeze Target:</span>
                    <span class="detail-value profit-positive">$${stock.targetPrice.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Short Interest:</span>
                    <span class="detail-value">${stock.shortInterest}%</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Days to Cover:</span>
                    <span class="detail-value">${stock.daysToCover} days</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Borrow Cost:</span>
                    <span class="detail-value">${stock.borrowCost}%</span>
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
                <div class="tip-title">⚠️ EXTREME RISK WARNING:</div>
                <div style="color: var(--text-gray);">
                    Short squeezes are extremely volatile and unpredictable. Most fail. 
                    Only use money you can afford to lose completely. 
                    Potential upside: +${upside}%, but losses can be 100%.
                </div>
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-primary btn-small" onclick="openBrokerLink('${stock.symbol}')">
                    📱 Trade ${stock.symbol}
                </button>
                <button class="btn btn-secondary btn-small" onclick="setPriceAlert('${stock.symbol}', ${stock.currentPrice})">
                    🔔 Set Alert
                </button>
            </div>
        </div>
    `;
}

// ============================================================================
// IPO ANALYZER SECTION (Task 2.7)
// ============================================================================

// Filter IPOs
function filterIPOs(category) {
    currentIPOFilter = category;
    
    // Update active chip
    const parentElement = event.target.closest('.tab-content');
    parentElement.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Rescan with filter
    scanIPOOpportunities();
}

// Main function to scan IPO opportunities
async function scanIPOOpportunities() {
    const resultsDiv = document.getElementById('ipoResults');
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Analyzing IPO investment opportunities...</div>';
    
    try {
        // Fetch data from API
        const ipoData = await API.makeRequest('/ipo-analysis', { 
            filter: currentIPOFilter 
        });
        
        // Generate HTML for results
        let html = '';
        ipoData.forEach(ipo => {
            html += generateIPOCard(ipo);
        });
        
        if (html === '') {
            html = '<div class="tip-box">No IPO opportunities found for the selected filter. Try selecting "All IPOs" or a different category.</div>';
        }
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error fetching IPO data:', error);
        resultsDiv.innerHTML = `
            <div class="tip-box danger">
                <div class="tip-title">⚠️ Error Loading Data</div>
                <div>Unable to load IPO data. Please try again in a moment.</div>
            </div>
        `;
    }
}

// Generate HTML card for IPO
function generateIPOCard(ipo) {
    const isUpcoming = ipo.status === 'upcoming';
    const currentPrice = ipo.currentPrice || ipo.expectedPrice;
    const targetPrice = ipo.targetPrice;
    const upside = ((targetPrice - currentPrice) / currentPrice * 100).toFixed(1);
    
    return `
        <div class="stock-result">
            <div class="stock-header">
                <div>
                    <div class="stock-symbol">${ipo.symbol}</div>
                    <div style="color: var(--text-gray); font-size: 0.9rem;">${ipo.company}</div>
                </div>
                <div style="text-align: right;">
                    <div class="catalyst-tag ${isUpcoming ? 'warning' : 'profit-positive'}">
                        ${isUpcoming ? 'Upcoming' : 'Recent IPO'}
                    </div>
                    <div class="catalyst-tag">${ipo.sector}</div>
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary-yellow); margin-bottom: 5px;">
                    ${isUpcoming ? 'IPO Expected' : 'Public Since'}: ${formatDate(ipo.ipoDate)}
                </div>
                <div style="color: var(--text-gray);">
                    Market Cap: $${(ipo.marketCap / 1000000000).toFixed(1)}B | 
                    Revenue: $${(ipo.revenue / 1000000000).toFixed(1)}B
                </div>
            </div>
            
            <div class="trade-details">
                <div class="detail-row">
                    <span class="detail-label">${isUpcoming ? 'Expected Price' : 'IPO Price'}:</span>
                    <span class="detail-value">$${(ipo.ipoPrice || ipo.expectedPrice).toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Current Price:</span>
                    <span class="detail-value">$${currentPrice.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Target Price:</span>
                    <span class="detail-value profit-positive">$${targetPrice.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Potential Upside:</span>
                    <span class="detail-value profit-positive">+${upside}%</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Revenue Growth:</span>
                    <span class="detail-value profit-positive">+${ipo.revenueGrowth}%</span>
                </div>
                ${ipo.lockupExpiry ? `
                <div class="detail-row">
                    <span class="detail-label">Lockup Expiry:</span>
                    <span class="detail-value">${formatDate(ipo.lockupExpiry)}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="probability-meter">
                <span style="color: var(--text-gray); font-size: 0.9rem;">Success Probability:</span>
                <div class="probability-bar">
                    <div class="probability-fill" style="width: ${ipo.confidence}%"></div>
                </div>
                <span style="font-weight: 700; color: var(--primary-green);">${ipo.confidence}%</span>
            </div>
            
            <div style="margin: 15px 0;">
                <div style="font-weight: 700; color: var(--primary-yellow); margin-bottom: 10px;">🚀 Growth Catalysts:</div>
                <div>
                    ${ipo.catalysts.map(catalyst => `<span class="catalyst-tag">${catalyst}</span>`).join('')}
                </div>
            </div>
            
            <div class="tip-box">
                <div class="tip-title">📊 Investment Thesis:</div>
                <div style="color: var(--text-gray);">
                    ${ipo.fundamentals}. Revenue growing ${ipo.revenueGrowth}% in ${ipo.sector} sector.
                </div>
            </div>
            
            <div class="tip-box danger">
                <div class="tip-title">⚠️ Key Risks:</div>
                <ul style="margin: 10px 0 0 20px; color: var(--text-gray);">
                    ${ipo.risks.map(risk => `<li>${risk}</li>`).join('')}
                </ul>
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-primary btn-small" onclick="openBrokerLink('${ipo.symbol}')">
                    📱 Trade ${ipo.symbol}
                </button>
                <button class="btn btn-secondary btn-small" onclick="setPriceAlert('${ipo.symbol}', ${currentPrice})">
                    🔔 Set Alert
                </button>
            </div>
        </div>
    `;
}

// ============================================================================
// M&A AND CORPORATE ACTIONS TRACKER SECTION (Task 2.8)
// ============================================================================

// Filter M&A deals
function filterMA(category) {
    currentMAFilter = category;
    
    // Update active chip
    const parentElement = event.target.closest('.tab-content');
    parentElement.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Rescan with filter
    scanMergerArbitrage();
}

// Main function to scan merger arbitrage opportunities
async function scanMergerArbitrage() {
    const resultsDiv = document.getElementById('maResults');
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Scanning merger arbitrage and corporate action opportunities...</div>';
    
    try {
        // Fetch data from API
        const maData = await API.makeRequest('/mergers-acquisitions', { 
            filter: currentMAFilter 
        });
        
        // Generate HTML for results
        let html = '';
        maData.forEach(deal => {
            html += generateMACard(deal);
        });
        
        if (html === '') {
            html = '<div class="tip-box">No M&A opportunities found for the selected filter. Try selecting "All Events" or a different category.</div>';
        }
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error fetching M&A data:', error);
        resultsDiv.innerHTML = `
            <div class="tip-box danger">
                <div class="tip-title">⚠️ Error Loading Data</div>
                <div>Unable to load M&A data. Please try again in a moment.</div>
            </div>
        `;
    }
}

// Generate HTML card for M&A deal
function generateMACard(deal) {
    let cardContent = '';
    
    if (deal.type === 'merger') {
        const spreadClass = deal.spread >= 0 ? 'profit-positive' : 'profit-negative';
        
        cardContent = `
            <div class="stock-result">
                <div class="stock-header">
                    <div>
                        <div class="stock-symbol">${deal.symbol}</div>
                        <div style="color: var(--text-gray); font-size: 0.9rem;">${deal.company}</div>
                    </div>
                    <div style="text-align: right;">
                        <div class="catalyst-tag profit-positive">Merger Arbitrage</div>
                        <div style="color: var(--text-gray); font-size: 0.8rem; margin-top: 5px;">
                            ${deal.probability}% probability
                        </div>
                    </div>
                </div>
                
                <div style="margin: 20px 0;">
                    <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary-yellow); margin-bottom: 5px;">
                        Acquisition by ${deal.acquirer}
                    </div>
                    <div style="color: var(--text-gray);">
                        Deal Value: $${(deal.dealValue / 1000000000).toFixed(1)}B | 
                        Expected Close: ${formatDate(deal.expectedClose)}
                    </div>
                </div>
                
                <div class="trade-details">
                    <div class="detail-row">
                        <span class="detail-label">Current Price:</span>
                        <span class="detail-value">$${deal.currentPrice.toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Deal Price:</span>
                        <span class="detail-value profit-positive">$${deal.dealPrice.toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Arbitrage Spread:</span>
                        <span class="detail-value ${spreadClass}">${deal.spread >= 0 ? '+' : ''}${deal.spread.toFixed(2)}%</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Annualized Return:</span>
                        <span class="detail-value ${spreadClass}">${deal.annualizedReturn.toFixed(1)}%</span>
                    </div>
                </div>
                
                <div class="probability-meter">
                    <span style="color: var(--text-gray); font-size: 0.9rem;">Deal Completion Probability:</span>
                    <div class="probability-bar">
                        <div class="probability-fill" style="width: ${deal.probability}%"></div>
                    </div>
                    <span style="font-weight: 700; color: var(--primary-green);">${deal.probability}%</span>
                </div>
                
                <div class="tip-box">
                    <div class="tip-title">📊 Deal Status:</div>
                    <div style="color: var(--text-gray);">${deal.regulatoryStatus}</div>
                </div>
                
                <div class="tip-box danger">
                    <div class="tip-title">⚠️ Key Risks:</div>
                    <ul style="margin: 10px 0 0 20px; color: var(--text-gray);">
                        ${deal.risks.map(risk => `<li>${risk}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    } else if (deal.type === 'split') {
        cardContent = `
            <div class="stock-result">
                <div class="stock-header">
                    <div>
                        <div class="stock-symbol">${deal.symbol}</div>
                        <div style="color: var(--text-gray); font-size: 0.9rem;">${deal.company}</div>
                    </div>
                    <div style="text-align: right;">
                        <div class="catalyst-tag warning">Stock Split</div>
                        <div style="color: var(--text-gray); font-size: 0.8rem; margin-top: 5px;">
                            ${deal.splitRatio}
                        </div>
                    </div>
                </div>
                
                <div style="margin: 20px 0;">
                    <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary-yellow); margin-bottom: 5px;">
                        Stock Split: ${deal.splitRatio}
                    </div>
                    <div style="color: var(--text-gray);">
                        Ex-Date: ${formatDate(deal.exDate)} | Strategy: ${deal.strategy}
                    </div>
                </div>
                
                <div class="trade-details">
                    <div class="detail-row">
                        <span class="detail-label">Current Price:</span>
                        <span class="detail-value">$${deal.currentPrice.toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Pre-Split Target:</span>
                        <span class="detail-value profit-positive">$${deal.preSplitTarget.toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Post-Split Target:</span>
                        <span class="detail-value profit-positive">$${deal.postSplitTarget.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="tip-box success">
                    <div class="tip-title">📊 Split Strategy:</div>
                    <div style="color: var(--text-gray);">
                        ${deal.catalyst}. ${deal.strategy}.
                    </div>
                </div>
            </div>
        `;
    } else if (deal.type === 'dividend') {
        cardContent = `
            <div class="stock-result">
                <div class="stock-header">
                    <div>
                        <div class="stock-symbol">${deal.symbol}</div>
                        <div style="color: var(--text-gray); font-size: 0.9rem;">${deal.company}</div>
                    </div>
                    <div style="text-align: right;">
                        <div class="catalyst-tag profit-positive">Special Dividend</div>
                        <div style="color: var(--text-gray); font-size: 0.8rem; margin-top: 5px;">
                            ${deal.yield}% yield
                        </div>
                    </div>
                </div>
                
                <div style="margin: 20px 0;">
                    <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary-yellow); margin-bottom: 5px;">
                        Special Dividend: $${deal.amount.toFixed(2)}
                    </div>
                    <div style="color: var(--text-gray);">
                        Ex-Date: ${formatDate(deal.exDate)} | Yield: ${deal.yield}%
                    </div>
                </div>
                
                <div class="trade-details">
                    <div class="detail-row">
                        <span class="detail-label">Current Price:</span>
                        <span class="detail-value">$${deal.currentPrice.toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Dividend Amount:</span>
                        <span class="detail-value profit-positive">$${deal.amount.toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Dividend Yield:</span>
                        <span class="detail-value profit-positive">${deal.yield}%</span>
                    </div>
                </div>
                
                <div class="tip-box success">
                    <div class="tip-title">💰 Dividend Opportunity:</div>
                    <div style="color: var(--text-gray);">
                        ${deal.catalyst}. Must own shares before ex-date to receive dividend.
                    </div>
                </div>
            </div>
        `;
    }
    
    return cardContent + `
        <div class="action-buttons">
            <button class="btn btn-primary btn-small" onclick="openBrokerLink('${deal.symbol}')">
                📱 Trade ${deal.symbol}
            </button>
            <button class="btn btn-secondary btn-small" onclick="setPriceAlert('${deal.symbol}', ${deal.currentPrice})">
                🔔 Set Alert
            </button>
        </div>
    `;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Format date for display
function formatDate(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return date < now ? 'Yesterday' : 'Tomorrow';
    if (diffDays < 7) return date < now ? `${diffDays} days ago` : `In ${diffDays} days`;
    
    return date.toLocaleDateString();
}

// Get company name from symbol (simplified mapping)
function getCompanyName(symbol) {
    const companies = {
        'NVDA': 'NVIDIA Corporation',
        'TSLA': 'Tesla Inc.',
        'AAPL': 'Apple Inc.',
        'MSFT': 'Microsoft Corporation',
        'LMT': 'Lockheed Martin',
        'GEO': 'The GEO Group',
        'MRNA': 'Moderna Inc.',
        'BNTX': 'BioNTech SE',
        'GILD': 'Gilead Sciences',
        'REGN': 'Regeneron Pharmaceuticals',
        'PLTR': 'Palantir Technologies',
        'COIN': 'Coinbase Global',
        'AMZN': 'Amazon.com Inc.',
        'DIS': 'The Walt Disney Company'
    };
    return companies[symbol] || `${symbol} Corporation`;
}

// Open broker link (placeholder)
function openBrokerLink(symbol) {
    alert(`Opening ${symbol} on your preferred broker. This would integrate with Robinhood, TD Ameritrade, etc.`);
}

// Open analysis link (placeholder)
function openAnalysisLink(symbol) {
    alert(`Opening ${symbol} analysis in Think or Swim. This would integrate with trading platforms.`);
}

// Set price alert (placeholder)
function setPriceAlert(symbol, currentPrice) {
    const alertPrice = prompt(`Set price alert for ${symbol} (current: $${currentPrice.toFixed(2)}):`);
    if (alertPrice) {
        alert(`✅ Price alert set for ${symbol} at $${parseFloat(alertPrice).toFixed(2)}`);
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Auto-load content when tabs are switched
document.addEventListener('DOMContentLoaded', function() {
    // Override the existing showTab function to handle new tabs
    const originalShowTab = window.showTab;
    
    window.showTab = function(tabName) {
        // Call original function if it exists
        if (originalShowTab) {
            originalShowTab(tabName);
        } else {
            // Fallback tab switching logic
            const tabs = document.querySelectorAll('.tab');
            const contents = document.querySelectorAll('.tab-content');
            
            tabs.forEach(tab => tab.classList.remove('active'));
            contents.forEach(content => content.classList.remove('active'));
            
            event.target.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        }

        // Auto-load content for new smart recommendation tabs
        switch(tabName) {
            case 'politicians-big-investors':
                if (document.getElementById('politiciansResults').innerHTML === '') {
                    scanPoliticiansInvestors();
                }
                break;
            case 'catalyst-scanner':
                if (document.getElementById('catalystScannerResults').innerHTML === '') {
                    scanCatalystOpportunities();
                }
                break;
            case 'biotech-analyzer':
                if (document.getElementById('biotechResults').innerHTML === '') {
                    scanBiotechBreakthroughs();
                }
                break;
            case 'growth-stocks':
                if (document.getElementById('growthStocksResults').innerHTML === '') {
                    scanGrowthStocks();
                }
                break;
            case 'short-squeeze':
                if (document.getElementById('shortSqueezeResults').innerHTML === '') {
                    scanShortSqueezeOpportunities();
                }
                break;
            case 'crypto-infrastructure':
                if (document.getElementById('cryptoResults').innerHTML === '') {
                    scanCryptoInfrastructure();
                }
                break;
            case 'ipo-analyzer':
                if (document.getElementById('ipoResults').innerHTML === '') {
                    scanIPOOpportunities();
                }
                break;
            case 'mergers-acquisitions':
                if (document.getElementById('maResults').innerHTML === '') {
                    scanMergerArbitrage();
                }
                break;
            case 'options-recommendations':
                if (document.getElementById('optionsResults').innerHTML === '') {
                    scanOptionsRecommendations();
                }
                break;
            case 'forex-analyzer':
                if (document.getElementById('forexResults').innerHTML === '') {
                    scanForexOpportunities();
                }
                break;
        }
    };
});

// Export functions for global access
window.filterPoliticians = filterPoliticians;
window.scanPoliticiansInvestors = scanPoliticiansInvestors;
window.filterCatalysts = filterCatalysts;
window.scanCatalystOpportunities = scanCatalystOpportunities;
window.filterBiotech = filterBiotech;
window.scanBiotechBreakthroughs = scanBiotechBreakthroughs;
window.filterGrowthStocks = filterGrowthStocks;
window.scanGrowthStocks = scanGrowthStocks;
window.scanPennyStocksRecommendations = scanPennyStocksRecommendations;
window.scanShortSqueezeOpportunities = scanShortSqueezeOpportunities;
window.filterIPOs = filterIPOs;
window.scanIPOOpportunities = scanIPOOpportunities;
window.filterOptions = filterOptions;
window.scanOptionsRecommendations = scanOptionsRecommendations;
window.openOptionsOrder = openOptionsOrder;
window.copyOptionsOrder = copyOptionsOrder;
window.filterMA = filterMA;
window.scanMergerArbitrage = scanMergerArbitrage;
window.openBrokerLink = openBrokerLink;
window.openAnalysisLink = openAnalysisLink;
window.setPriceAlert = setPriceAlert;

// ============================================================================
// CRYPTO INFRASTRUCTURE ANALYZER SECTION (Task 4.1 & 4.2)
// ============================================================================

// Filter crypto infrastructure protocols
function filterCrypto(category) {
    currentCryptoFilter = category;
    
    // Update active chip
    const parentElement = event.target.closest('.tab-content');
    parentElement.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Rescan with filter
    scanCryptoInfrastructure();
}

// Main function to scan crypto infrastructure protocols
async function scanCryptoInfrastructure() {
    const resultsDiv = document.getElementById('cryptoResults');
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Scanning blockchain infrastructure protocols...</div>';
    
    try {
        // Fetch data from API
        const cryptoRecommendations = await API.makeRequest('/crypto-infrastructure', { 
            filter: currentCryptoFilter 
        });
        
        // Generate HTML for results
        let html = '';
        cryptoRecommendations.forEach(crypto => {
            html += generateCryptoInfrastructureCard(crypto);
        });
        
        if (html === '') {
            html = '<div class="tip-box">No crypto infrastructure protocols found for the selected filter. Try selecting "All Infrastructure" or a different category.</div>';
        }
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error fetching crypto infrastructure data:', error);
        resultsDiv.innerHTML = `
            <div class="tip-box danger">
                <div class="tip-title">⚠️ Error Loading Data</div>
                <div>Unable to load crypto infrastructure data. Please try again in a moment.</div>
            </div>
        `;
    }
}

// Generate HTML card for crypto infrastructure recommendation
function generateCryptoInfrastructureCard(crypto) {
    const upside = crypto.calculateUpside();
    const sectorColor = crypto.getSectorColor();
    const riskClass = crypto.riskLevel === 'Low' ? 'profit-positive' : 
                     crypto.riskLevel === 'Medium' ? 'warning' : 'profit-negative';
    
    // Format large numbers
    const formatLargeNumber = (num) => {
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };
    
    return `
        <div class="stock-result">
            <div class="stock-header">
                <div>
                    <div class="stock-symbol">${crypto.symbol}</div>
                    <div style="color: var(--text-gray); font-size: 0.9rem;">${crypto.project}</div>
                </div>
                <div style="text-align: right;">
                    <div class="catalyst-tag" style="background-color: ${sectorColor}; color: white;">
                        ${crypto.sector}
                    </div>
                    <div class="catalyst-tag ${riskClass}">${crypto.riskLevel} Risk</div>
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary-yellow); margin-bottom: 5px;">
                    ${crypto.catalyst}
                </div>
                <div style="color: var(--text-gray);">
                    Market Cap: ${formatLargeNumber(crypto.marketCap)} | 
                    Category: ${getCryptoInfrastructureCategory(crypto.sector)}
                </div>
            </div>
            
            <div class="trade-details">
                <div class="detail-row">
                    <span class="detail-label">Current Price:</span>
                    <span class="detail-value">${crypto.entryPrice.toFixed(crypto.entryPrice < 1 ? 4 : 2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Target Price:</span>
                    <span class="detail-value profit-positive">${crypto.targetPrice.toFixed(crypto.targetPrice < 1 ? 4 : 2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Stop Loss:</span>
                    <span class="detail-value profit-negative">${crypto.stopLoss.toFixed(crypto.stopLoss < 1 ? 4 : 2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Potential Upside:</span>
                    <span class="detail-value profit-positive">+${upside}%</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Timeframe:</span>
                    <span class="detail-value">${crypto.timeframe}</span>
                </div>
            </div>
            
            <div class="probability-meter">
                <span style="color: var(--text-gray); font-size: 0.9rem;">Success Probability:</span>
                <div class="probability-bar">
                    <div class="probability-fill" style="width: ${crypto.confidence}%"></div>
                </div>
                <span style="font-weight: 700; color: var(--primary-green);">${crypto.confidence}%</span>
            </div>
            
            <!-- Network Metrics Display -->
            <div class="insider-stats" style="margin: 20px 0;">
                <div class="stat-box">
                    <div class="stat-label">Active Users</div>
                    <div class="stat-value">${formatLargeNumber(crypto.networkMetrics.activeUsers)}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Daily Transactions</div>
                    <div class="stat-value">${formatLargeNumber(crypto.networkMetrics.transactionVolume)}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Developers</div>
                    <div class="stat-value">${formatLargeNumber(crypto.networkMetrics.developerActivity)}</div>
                </div>
                ${crypto.networkMetrics.tvl ? `
                <div class="stat-box">
                    <div class="stat-label">TVL</div>
                    <div class="stat-value">${formatLargeNumber(crypto.networkMetrics.tvl)}</div>
                </div>
                ` : ''}
                ${crypto.networkMetrics.connectedDevices ? `
                <div class="stat-box">
                    <div class="stat-label">IoT Devices</div>
                    <div class="stat-value">${formatLargeNumber(crypto.networkMetrics.connectedDevices)}</div>
                </div>
                ` : ''}
                ${crypto.networkMetrics.storageCapacity ? `
                <div class="stat-box">
                    <div class="stat-label">Storage</div>
                    <div class="stat-value">${formatLargeNumber(crypto.networkMetrics.storageCapacity / 1000000000)}GB</div>
                </div>
                ` : ''}
                ${crypto.networkMetrics.gpuNodes ? `
                <div class="stat-box">
                    <div class="stat-label">GPU Nodes</div>
                    <div class="stat-value">${formatLargeNumber(crypto.networkMetrics.gpuNodes)}</div>
                </div>
                ` : ''}
                ${crypto.networkMetrics.computingPower ? `
                <div class="stat-box">
                    <div class="stat-label">Computing Units</div>
                    <div class="stat-value">${formatLargeNumber(crypto.networkMetrics.computingPower)}</div>
                </div>
                ` : ''}
            </div>
            
            <!-- Infrastructure Use Case -->
            <div class="tip-box success">
                <div class="tip-title">⛓️ Infrastructure Role:</div>
                <div style="color: var(--text-gray);">
                    ${crypto.description}
                </div>
            </div>
            
            <!-- Investment Thesis -->
            <div class="tip-box">
                <div class="tip-title">📊 Investment Thesis:</div>
                <ul style="margin: 10px 0 0 20px; color: var(--text-gray); line-height: 1.8;">
                    ${crypto.reasoning.map(reason => `<li>${reason}</li>`).join('')}
                </ul>
            </div>
            
            <!-- Upcoming Catalysts -->
            ${crypto.upcomingEvents.length > 0 ? `
                <div style="margin: 15px 0;">
                    <div style="font-weight: 700; color: var(--primary-yellow); margin-bottom: 10px;">🚀 Upcoming Catalysts:</div>
                    <div>
                        ${crypto.upcomingEvents.map(event => `<span class="catalyst-tag">${event}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- Protocol Analysis -->
            <div class="tip-box ${riskClass}">
                <div class="tip-title">🔍 Protocol Analysis:</div>
                <div style="color: var(--text-gray);">
                    ${getProtocolAnalysis(crypto)}
                </div>
            </div>
            
            <!-- Risk Assessment for Crypto -->
            <div class="tip-box danger">
                <div class="tip-title">⚠️ Crypto Investment Risks:</div>
                <div style="color: var(--text-gray);">
                    Cryptocurrency investments are highly volatile and speculative. 
                    Infrastructure tokens depend on network adoption and technological success. 
                    Only invest what you can afford to lose completely.
                </div>
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-primary btn-small" onclick="openCryptoExchange('${crypto.symbol}')">
                    📱 Trade on Exchange
                </button>
                <button class="btn btn-secondary btn-small" onclick="setCryptoPriceAlert('${crypto.symbol}', ${crypto.entryPrice})">
                    🔔 Set Price Alert
                </button>
                <button class="btn btn-secondary btn-small" onclick="viewProtocolDetails('${crypto.project}')">
                    🔍 Protocol Details
                </button>
            </div>
        </div>
    `;
}

// Get crypto infrastructure category description
function getCryptoInfrastructureCategory(sector) {
    switch(sector) {
        case 'Layer1': return 'Blockchain Foundation';
        case 'Layer2': return 'Scaling Solution';
        case 'IoT': return 'Internet of Things';
        case 'Storage': return 'Decentralized Storage';
        case 'Computing': return 'Distributed Computing';
        case 'Oracle': return 'Data Oracle Network';
        default: return 'Infrastructure Protocol';
    }
}

// Get detailed protocol analysis
function getProtocolAnalysis(crypto) {
    const analyses = {
        'Layer1': `Foundation blockchain with ${formatLargeNumber(crypto.networkMetrics.activeUsers)} active users and ${formatLargeNumber(crypto.networkMetrics.developerActivity)} developers. Network effects strengthen with adoption.`,
        'Layer2': `Scaling solution processing ${formatLargeNumber(crypto.networkMetrics.transactionVolume)} daily transactions. Success depends on Layer 1 adoption and competitive positioning.`,
        'IoT': `IoT network connecting ${formatLargeNumber(crypto.networkMetrics.connectedDevices || 0)} devices. Growth driven by industrial IoT adoption and machine-to-machine economy development.`,
        'Storage': `Decentralized storage network with ${formatLargeNumber((crypto.networkMetrics.storageCapacity || 0) / 1000000000)}GB capacity. Revenue model based on storage demand and network utilization.`,
        'Computing': `Distributed computing network with ${formatLargeNumber(crypto.networkMetrics.gpuNodes || crypto.networkMetrics.computingPower || 0)} nodes. Growth tied to AI/ML workload demand and cost competitiveness.`
    };
    
    return analyses[crypto.sector] || `Infrastructure protocol in ${crypto.sector} sector with growing network adoption and enterprise partnerships.`;
}

// Crypto Infrastructure Protocol Analyzer Class
class CryptoInfrastructureAnalyzer {
    constructor() {
        this.sectorWeights = {
            'Layer1': { adoption: 0.4, technology: 0.3, ecosystem: 0.3 },
            'Layer2': { scalability: 0.4, security: 0.3, adoption: 0.3 },
            'IoT': { devices: 0.4, partnerships: 0.3, utility: 0.3 },
            'Storage': { capacity: 0.4, utilization: 0.3, partnerships: 0.3 },
            'Computing': { nodes: 0.4, demand: 0.3, efficiency: 0.3 }
        };
    }

    // Analyze protocol fundamentals
    analyzeProtocolFundamentals(crypto) {
        const metrics = crypto.networkMetrics;
        const analysis = {
            networkHealth: this.calculateNetworkHealth(crypto),
            adoptionScore: this.calculateAdoptionScore(crypto),
            technologyScore: this.calculateTechnologyScore(crypto),
            competitivePosition: this.assessCompetitivePosition(crypto),
            growthPotential: this.assessGrowthPotential(crypto)
        };

        return {
            overallScore: this.calculateOverallScore(analysis),
            strengths: this.identifyStrengths(analysis, crypto),
            weaknesses: this.identifyWeaknesses(analysis, crypto),
            recommendations: this.generateRecommendations(analysis, crypto)
        };
    }

    // Calculate network health score
    calculateNetworkHealth(crypto) {
        const metrics = crypto.networkMetrics;
        let score = 50; // Base score

        // Active users contribution
        if (metrics.activeUsers > 100000) score += 20;
        else if (metrics.activeUsers > 50000) score += 15;
        else if (metrics.activeUsers > 10000) score += 10;

        // Transaction volume contribution
        if (metrics.transactionVolume > 1000000) score += 15;
        else if (metrics.transactionVolume > 100000) score += 10;
        else if (metrics.transactionVolume > 10000) score += 5;

        // Developer activity contribution
        if (metrics.developerActivity > 1000) score += 15;
        else if (metrics.developerActivity > 500) score += 10;
        else if (metrics.developerActivity > 100) score += 5;

        return Math.min(100, score);
    }

    // Calculate adoption score
    calculateAdoptionScore(crypto) {
        let score = 40; // Base score

        // Market cap indicates adoption level
        if (crypto.marketCap > 10000000000) score += 25; // >10B
        else if (crypto.marketCap > 1000000000) score += 20; // >1B
        else if (crypto.marketCap > 100000000) score += 15; // >100M

        // Network-specific adoption metrics
        const metrics = crypto.networkMetrics;
        switch(crypto.sector) {
            case 'Layer1':
            case 'Layer2':
                if (metrics.tvl > 1000000000) score += 20;
                else if (metrics.tvl > 100000000) score += 15;
                break;
            case 'IoT':
                if (metrics.connectedDevices > 500000) score += 20;
                else if (metrics.connectedDevices > 100000) score += 15;
                break;
            case 'Storage':
                if (metrics.storageCapacity > 10000000000000) score += 20; // >10TB
                else if (metrics.storageCapacity > 1000000000000) score += 15; // >1TB
                break;
            case 'Computing':
                if (metrics.gpuNodes > 10000) score += 20;
                else if (metrics.gpuNodes > 1000) score += 15;
                break;
        }

        return Math.min(100, score);
    }

    // Calculate technology score
    calculateTechnologyScore(crypto) {
        let score = 60; // Base score for established protocols

        // Sector-specific technology assessment
        switch(crypto.sector) {
            case 'Layer1':
                // Assess consensus mechanism, scalability, security
                if (crypto.symbol === 'ETH') score += 25; // Proven technology
                else if (crypto.symbol === 'SOL') score += 20; // High performance
                break;
            case 'Layer2':
                // Assess scaling efficiency and security model
                score += 15; // Layer 2s generally have good tech
                break;
            case 'IoT':
                // Assess device integration and data handling
                score += 10; // Emerging technology
                break;
            case 'Storage':
                // Assess storage efficiency and retrieval
                score += 15; // Proven storage models
                break;
            case 'Computing':
                // Assess computational efficiency and distribution
                score += 12; // Growing field
                break;
        }

        return Math.min(100, score);
    }

    // Assess competitive position
    assessCompetitivePosition(crypto) {
        const positions = {
            'ETH': 'Dominant',
            'SOL': 'Strong Challenger',
            'MATIC': 'Market Leader',
            'FIL': 'Established Player',
            'RNDR': 'Growing Leader'
        };

        return positions[crypto.symbol] || 'Emerging Player';
    }

    // Assess growth potential
    assessGrowthPotential(crypto) {
        let potential = 'Medium';

        // High growth potential indicators
        if (crypto.networkMetrics.developerActivity > 500 && 
            crypto.marketCap < 5000000000) {
            potential = 'High';
        }

        // Very high growth for emerging sectors
        if ((crypto.sector === 'IoT' || crypto.sector === 'Computing') && 
            crypto.networkMetrics.activeUsers > 10000) {
            potential = 'Very High';
        }

        // Lower growth for mature protocols
        if (crypto.marketCap > 50000000000) {
            potential = 'Moderate';
        }

        return potential;
    }

    // Calculate overall score
    calculateOverallScore(analysis) {
        return Math.round(
            (analysis.networkHealth * 0.3 +
             analysis.adoptionScore * 0.3 +
             analysis.technologyScore * 0.25 +
             (analysis.growthPotential === 'Very High' ? 90 : 
              analysis.growthPotential === 'High' ? 80 : 
              analysis.growthPotential === 'Medium' ? 70 : 60) * 0.15)
        );
    }

    // Identify protocol strengths
    identifyStrengths(analysis, crypto) {
        const strengths = [];

        if (analysis.networkHealth > 80) {
            strengths.push('Strong network activity and user engagement');
        }
        if (analysis.adoptionScore > 75) {
            strengths.push('High market adoption and institutional interest');
        }
        if (analysis.technologyScore > 80) {
            strengths.push('Proven and scalable technology stack');
        }
        if (crypto.networkMetrics.developerActivity > 1000) {
            strengths.push('Vibrant developer ecosystem');
        }
        if (analysis.competitivePosition.includes('Leader') || 
            analysis.competitivePosition.includes('Dominant')) {
            strengths.push('Strong competitive positioning');
        }

        return strengths.length > 0 ? strengths : ['Emerging infrastructure protocol with growth potential'];
    }

    // Identify protocol weaknesses
    identifyWeaknesses(analysis, crypto) {
        const weaknesses = [];

        if (analysis.networkHealth < 60) {
            weaknesses.push('Limited network activity and user base');
        }
        if (analysis.adoptionScore < 50) {
            weaknesses.push('Early stage adoption with execution risk');
        }
        if (crypto.networkMetrics.developerActivity < 100) {
            weaknesses.push('Small developer community');
        }
        if (crypto.marketCap < 100000000) {
            weaknesses.push('Small market cap with high volatility risk');
        }
        if (analysis.competitivePosition === 'Emerging Player') {
            weaknesses.push('Faces strong competition from established players');
        }

        return weaknesses.length > 0 ? weaknesses : ['Standard crypto market volatility and regulatory risks'];
    }

    // Generate investment recommendations
    generateRecommendations(analysis, crypto) {
        const recommendations = [];
        const overallScore = analysis.overallScore;

        if (overallScore > 80) {
            recommendations.push('Strong buy for infrastructure exposure');
            recommendations.push('Suitable for core crypto portfolio allocation');
        } else if (overallScore > 70) {
            recommendations.push('Good buy for diversified crypto portfolio');
            recommendations.push('Monitor network growth metrics closely');
        } else if (overallScore > 60) {
            recommendations.push('Speculative buy with higher risk tolerance');
            recommendations.push('Small position size recommended');
        } else {
            recommendations.push('High risk - only for experienced crypto investors');
            recommendations.push('Wait for stronger fundamentals or lower entry');
        }

        // Sector-specific recommendations
        switch(crypto.sector) {
            case 'Layer1':
                recommendations.push('Benefits from overall blockchain adoption growth');
                break;
            case 'IoT':
                recommendations.push('Exposure to IoT and machine economy trends');
                break;
            case 'Storage':
                recommendations.push('Play on decentralized storage demand growth');
                break;
            case 'Computing':
                recommendations.push('Leverages AI/ML computational demand trends');
                break;
        }

        return recommendations;
    }

    // Generate protocol comparison
    compareProtocols(protocols) {
        return protocols.map(protocol => {
            const analysis = this.analyzeProtocolFundamentals(protocol);
            return {
                symbol: protocol.symbol,
                project: protocol.project,
                sector: protocol.sector,
                score: analysis.overallScore,
                strengths: analysis.strengths.slice(0, 2), // Top 2 strengths
                riskLevel: protocol.riskLevel,
                upside: protocol.calculateUpside()
            };
        }).sort((a, b) => b.score - a.score);
    }
}

// Create global crypto analyzer instance
const cryptoAnalyzer = new CryptoInfrastructureAnalyzer();

// Enhanced crypto analysis function
function generateAdvancedCryptoAnalysis(crypto) {
    const fundamentalAnalysis = cryptoAnalyzer.analyzeProtocolFundamentals(crypto);
    
    return {
        overallScore: fundamentalAnalysis.overallScore,
        networkHealth: fundamentalAnalysis.networkHealth,
        adoptionScore: fundamentalAnalysis.adoptionScore,
        technologyScore: fundamentalAnalysis.technologyScore,
        competitivePosition: fundamentalAnalysis.competitivePosition,
        growthPotential: fundamentalAnalysis.growthPotential,
        strengths: fundamentalAnalysis.strengths,
        weaknesses: fundamentalAnalysis.weaknesses,
        recommendations: fundamentalAnalysis.recommendations
    };
}

// Open crypto exchange (placeholder)
function openCryptoExchange(symbol) {
    alert(`Opening ${symbol} on crypto exchange. This would integrate with Coinbase, Binance, etc.`);
}

// Set crypto price alert (placeholder)
function setCryptoPriceAlert(symbol, currentPrice) {
    const alertPrice = prompt(`Set price alert for ${symbol} (current: ${currentPrice.toFixed(currentPrice < 1 ? 4 : 2)}):`);
    if (alertPrice) {
        alert(`✅ Price alert set for ${symbol} at ${parseFloat(alertPrice).toFixed(currentPrice < 1 ? 4 : 2)}`);
    }
}

// View protocol details (placeholder)
function viewProtocolDetails(project) {
    alert(`Opening detailed protocol analysis for ${project}. This would show technical documentation, roadmap, and ecosystem details.`);
}

// Format large numbers helper function
function formatLargeNumber(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// ============================================================================
// CRYPTO INFRASTRUCTURE PROTOCOL COMPARISON TOOL
// ============================================================================

// Generate protocol comparison table
async function generateProtocolComparison() {
    try {
        const allProtocols = await API.makeRequest('/crypto-infrastructure');
        const comparison = cryptoAnalyzer.compareProtocols(allProtocols);
        
        let html = `
            <div class="card" style="margin-top: 20px;">
                <div class="card-header">📊 Infrastructure Protocol Comparison</div>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--border-color);">
                                <th style="padding: 10px; text-align: left; color: var(--primary-yellow);">Protocol</th>
                                <th style="padding: 10px; text-align: center; color: var(--primary-yellow);">Sector</th>
                                <th style="padding: 10px; text-align: center; color: var(--primary-yellow);">Score</th>
                                <th style="padding: 10px; text-align: center; color: var(--primary-yellow);">Risk</th>
                                <th style="padding: 10px; text-align: center; color: var(--primary-yellow);">Upside</th>
                                <th style="padding: 10px; text-align: left; color: var(--primary-yellow);">Key Strengths</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        comparison.forEach(protocol => {
            const riskClass = protocol.riskLevel === 'Low' ? 'profit-positive' : 
                             protocol.riskLevel === 'Medium' ? 'warning' : 'profit-negative';
            
            html += `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 10px;">
                        <div style="font-weight: 700; color: var(--text-white);">${protocol.symbol}</div>
                        <div style="font-size: 0.8rem; color: var(--text-gray);">${protocol.project}</div>
                    </td>
                    <td style="padding: 10px; text-align: center;">
                        <span class="catalyst-tag">${protocol.sector}</span>
                    </td>
                    <td style="padding: 10px; text-align: center;">
                        <div style="font-weight: 700; color: var(--primary-green);">${protocol.score}/100</div>
                    </td>
                    <td style="padding: 10px; text-align: center;">
                        <span class="catalyst-tag ${riskClass}">${protocol.riskLevel}</span>
                    </td>
                    <td style="padding: 10px; text-align: center;">
                        <div style="font-weight: 700; color: var(--profit-positive);">+${protocol.upside}%</div>
                    </td>
                    <td style="padding: 10px; font-size: 0.85rem; color: var(--text-gray);">
                        ${protocol.strengths.slice(0, 2).join('; ')}
                    </td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        return html;
    } catch (error) {
        console.error('Error generating protocol comparison:', error);
        return '<div class="tip-box danger">Unable to generate protocol comparison at this time.</div>';
    }
}

// Add protocol comparison to crypto results
async function addProtocolComparison() {
    const resultsDiv = document.getElementById('cryptoResults');
    const comparisonHtml = await generateProtocolComparison();
    resultsDiv.innerHTML += comparisonHtml;
}
/
/ ============================================================================
// FOREX TRADING ANALYZER SECTION (Task 5.1 & 5.2)
// ============================================================================

// Filter forex currency pairs
function filterForex(category) {
    currentForexFilter = category;
    
    // Update active chip
    const parentElement = event.target.closest('.tab-content');
    parentElement.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Rescan with filter
    scanForexOpportunities();
}

// Main function to scan forex opportunities
async function scanForexOpportunities() {
    const resultsDiv = document.getElementById('forexResults');
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Analyzing forex markets and economic conditions...</div>';
    
    try {
        // Fetch data from API
        const forexRecommendations = await API.makeRequest('/forex-analysis', { 
            filter: currentForexFilter 
        });
        
        // Generate HTML for results
        let html = '';
        forexRecommendations.forEach(forex => {
            html += generateForexRecommendationCard(forex);
        });
        
        if (html === '') {
            html = '<div class="tip-box">No forex opportunities found for the selected filter. Try selecting "All Pairs" or a different category.</div>';
        }
        
        // Add economic calendar
        html += await generateEconomicCalendar(forexRecommendations);
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error fetching forex data:', error);
        resultsDiv.innerHTML = `
            <div class="tip-box danger">
                <div class="tip-title">⚠️ Error Loading Data</div>
                <div>Unable to load forex data. Please try again in a moment.</div>
            </div>
        `;
    }
}

// Generate HTML card for forex recommendation
function generateForexRecommendationCard(forex) {
    const upside = forex.calculateUpside();
    const actionClass = forex.action === 'buy' ? 'profit-positive' : 'profit-negative';
    const riskClass = forex.riskLevel === 'Low' ? 'profit-positive' : 
                     forex.riskLevel === 'Medium' ? 'warning' : 'profit-negative';
    const trendClass = forex.technicalLevels.trend === 'bullish' ? 'profit-positive' : 
                      forex.technicalLevels.trend === 'bearish' ? 'profit-negative' : 'warning';
    
    // Get currency pair flag emojis
    const currencyFlags = getCurrencyFlags(forex.baseCurrency, forex.quoteCurrency);
    
    return `
        <div class="stock-result">
            <div class="stock-header">
                <div>
                    <div class="stock-symbol">${currencyFlags} ${forex.getCurrencyPair()}</div>
                    <div style="color: var(--text-gray); font-size: 0.9rem;">
                        ${getCurrencyName(forex.baseCurrency)} / ${getCurrencyName(forex.quoteCurrency)}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div class="trade-badge ${forex.action}">
                        ${forex.action === 'buy' ? '🟢 BUY' : '🔴 SELL'}
                    </div>
                    <div class="catalyst-tag ${riskClass}">${forex.riskLevel} Risk</div>
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary-yellow); margin-bottom: 5px;">
                    ${forex.catalyst}
                </div>
                <div style="color: var(--text-gray);">
                    Timeframe: ${forex.timeframe} | 
                    Trend: <span class="${trendClass}">${forex.technicalLevels.trend.toUpperCase()}</span>
                </div>
            </div>
            
            <div class="trade-details">
                <div class="detail-row">
                    <span class="detail-label">Entry Price:</span>
                    <span class="detail-value">${forex.entryPrice.toFixed(4)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Target Price:</span>
                    <span class="detail-value ${actionClass}">${forex.targetPrice.toFixed(4)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Stop Loss:</span>
                    <span class="detail-value profit-negative">${forex.stopLoss.toFixed(4)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Potential ${forex.action === 'buy' ? 'Upside' : 'Downside'}:</span>
                    <span class="detail-value ${actionClass}">${forex.action === 'buy' ? '+' : ''}${upside}%</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Interest Rate Diff:</span>
                    <span class="detail-value ${forex.interestRateDiff >= 0 ? 'profit-positive' : 'profit-negative'}">
                        ${forex.interestRateDiff >= 0 ? '+' : ''}${forex.interestRateDiff.toFixed(2)}%
                    </span>
                </div>
            </div>
            
            <div class="probability-meter">
                <span style="color: var(--text-gray); font-size: 0.9rem;">Success Probability:</span>
                <div class="probability-bar">
                    <div class="probability-fill" style="width: ${forex.confidence}%"></div>
                </div>
                <span style="font-weight: 700; color: var(--primary-green);">${forex.confidence}%</span>
            </div>
            
            <!-- Technical Levels Display -->
            <div class="insider-stats" style="margin: 20px 0;">
                <div class="stat-box">
                    <div class="stat-label">Support</div>
                    <div class="stat-value">${forex.technicalLevels.support[0].toFixed(4)}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Resistance</div>
                    <div class="stat-value">${forex.technicalLevels.resistance[0].toFixed(4)}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Trend</div>
                    <div class="stat-value ${trendClass}">${forex.technicalLevels.trend.toUpperCase()}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Risk/Reward</div>
                    <div class="stat-value">${forex.riskRewardRatio ? forex.riskRewardRatio.toFixed(1) : calculateRiskReward(forex).toFixed(1)}</div>
                </div>
            </div>
            
            <!-- Economic Analysis -->
            <div class="tip-box">
                <div class="tip-title">📊 Economic Analysis:</div>
                <div style="color: var(--text-gray);">
                    ${forex.description}
                </div>
                <ul style="margin: 10px 0 0 20px; color: var(--text-gray); line-height: 1.8;">
                    ${forex.reasoning.map(reason => `<li>${reason}</li>`).join('')}
                </ul>
            </div>
            
            <!-- Upcoming Economic Events -->
            ${forex.economicEvents.length > 0 ? `
                <div style="margin: 15px 0;">
                    <div style="font-weight: 700; color: var(--primary-yellow); margin-bottom: 10px;">📅 Key Economic Events:</div>
                    ${forex.economicEvents.map(event => generateEconomicEventDisplay(event)).join('')}
                </div>
            ` : ''}
            
            <!-- Technical Analysis -->
            <div class="tip-box ${trendClass}">
                <div class="tip-title">📈 Technical Analysis:</div>
                <div style="color: var(--text-gray);">
                    <strong>Support Levels:</strong> ${forex.technicalLevels.support.map(level => level.toFixed(4)).join(', ')}<br>
                    <strong>Resistance Levels:</strong> ${forex.technicalLevels.resistance.map(level => level.toFixed(4)).join(', ')}<br>
                    <strong>Current Trend:</strong> ${forex.technicalLevels.trend.charAt(0).toUpperCase() + forex.technicalLevels.trend.slice(1)} momentum
                </div>
            </div>
            
            <!-- Interest Rate Analysis -->
            ${Math.abs(forex.interestRateDiff) > 1 ? `
                <div class="tip-box ${forex.interestRateDiff > 0 ? 'success' : 'warning'}">
                    <div class="tip-title">💰 Carry Trade Analysis:</div>
                    <div style="color: var(--text-gray);">
                        ${forex.interestRateDiff > 0 ? 
                            `Positive carry: Earn ${forex.interestRateDiff.toFixed(2)}% annually by holding ${forex.baseCurrency}. Suitable for carry trade strategies.` :
                            `Negative carry: Pay ${Math.abs(forex.interestRateDiff).toFixed(2)}% annually. Focus on capital appreciation rather than carry.`
                        }
                    </div>
                </div>
            ` : ''}
            
            <!-- Forex Trading Risks -->
            <div class="tip-box danger">
                <div class="tip-title">⚠️ Forex Trading Risks:</div>
                <div style="color: var(--text-gray);">
                    Forex trading involves substantial risk of loss. Leverage can amplify both gains and losses. 
                    Economic events can cause rapid price movements. Only trade with risk capital.
                </div>
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-primary btn-small" onclick="openForexTrade('${forex.getCurrencyPair()}', '${forex.action}')">
                    📱 Trade ${forex.getCurrencyPair()}
                </button>
                <button class="btn btn-secondary btn-small" onclick="setForexAlert('${forex.getCurrencyPair()}', ${forex.entryPrice})">
                    🔔 Set Price Alert
                </button>
                <button class="btn btn-secondary btn-small" onclick="copyForexOrder(${JSON.stringify(forex).replace(/"/g, '&quot;')})">
                    📋 Copy Order
                </button>
            </div>
        </div>
    `;
}

// Generate economic event display
function generateEconomicEventDisplay(event) {
    const impactClass = event.getImpactColor();
    const daysUntil = Math.ceil((new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24));
    
    return `
        <div style="background: var(--bg-black); padding: 12px; border-radius: 8px; margin: 8px 0; border-left: 3px solid ${impactClass};">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 700; color: var(--text-white);">${event.event}</div>
                    <div style="color: var(--text-gray); font-size: 0.85rem;">${event.country}</div>
                </div>
                <div style="text-align: right;">
                    <div class="catalyst-tag" style="background-color: ${impactClass}; color: white; font-size: 0.8rem;">
                        ${event.impact} IMPACT
                    </div>
                    <div style="color: var(--text-gray); font-size: 0.8rem; margin-top: 4px;">
                        ${daysUntil > 0 ? `${daysUntil} days` : daysUntil === 0 ? 'Today' : 'Past'}
                    </div>
                </div>
            </div>
            ${event.forecast !== undefined ? `
                <div style="margin-top: 8px; font-size: 0.85rem; color: var(--text-gray);">
                    Forecast: ${event.forecast} | Previous: ${event.previous}
                </div>
            ` : ''}
        </div>
    `;
}

// Generate economic calendar
async function generateEconomicCalendar(forexRecommendations) {
    try {
        // Collect all economic events from recommendations
        const allEvents = [];
        forexRecommendations.forEach(forex => {
            forex.economicEvents.forEach(event => {
                allEvents.push({
                    ...event,
                    currencyPair: forex.getCurrencyPair(),
                    impact: event.impact
                });
            });
        });
        
        // Sort events by date
        allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Take next 7 days of events
        const upcomingEvents = allEvents.filter(event => {
            const eventDate = new Date(event.date);
            const today = new Date();
            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            return eventDate >= today && eventDate <= weekFromNow;
        }).slice(0, 10);
        
        if (upcomingEvents.length === 0) {
            return '';
        }
        
        let html = `
            <div class="card" style="margin-top: 30px;">
                <div class="card-header">📅 Economic Calendar - Next 7 Days</div>
                <div style="color: var(--text-gray); margin-bottom: 20px;">
                    High-impact economic events that could move currency markets
                </div>
        `;
        
        upcomingEvents.forEach(event => {
            const eventDate = new Date(event.date);
            const today = new Date();
            const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
            const impactColor = event.getImpactColor();
            
            html += `
                <div style="background: var(--bg-black); padding: 15px; border-radius: 10px; margin: 10px 0; border-left: 4px solid ${impactColor};">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <div style="font-weight: 700; color: var(--primary-yellow); margin-bottom: 5px;">
                                ${event.event}
                            </div>
                            <div style="color: var(--text-gray); font-size: 0.9rem; margin-bottom: 8px;">
                                ${event.country} | Affects: ${event.currencyPair}
                            </div>
                            ${event.forecast !== undefined ? `
                                <div style="font-size: 0.85rem; color: var(--text-gray);">
                                    <span style="color: var(--text-white);">Forecast:</span> ${event.forecast} | 
                                    <span style="color: var(--text-white);">Previous:</span> ${event.previous}
                                </div>
                            ` : ''}
                        </div>
                        <div style="text-align: right;">
                            <div class="catalyst-tag" style="background-color: ${impactColor}; color: white;">
                                ${event.impact}
                            </div>
                            <div style="color: var(--text-gray); font-size: 0.8rem; margin-top: 5px;">
                                ${eventDate.toLocaleDateString()} 
                                ${daysUntil === 0 ? '(Today)' : daysUntil === 1 ? '(Tomorrow)' : `(${daysUntil} days)`}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                <div class="tip-box">
                    <div class="tip-title">💡 Economic Calendar Tips:</div>
                    <ul style="margin: 10px 0 0 20px; color: var(--text-gray); line-height: 1.8;">
                        <li>High impact events can cause 50-100+ pip moves</li>
                        <li>Avoid trading 30 minutes before/after major releases</li>
                        <li>Focus on forecast vs actual deviations</li>
                        <li>Central bank decisions have the highest impact</li>
                    </ul>
                </div>
            </div>
        `;
        
        return html;
        
    } catch (error) {
        console.error('Error generating economic calendar:', error);
        return '';
    }
}

// Get currency flag emojis
function getCurrencyFlags(baseCurrency, quoteCurrency) {
    const flags = {
        'USD': '🇺🇸',
        'EUR': '🇪🇺', 
        'GBP': '🇬🇧',
        'JPY': '🇯🇵',
        'AUD': '🇦🇺',
        'CAD': '🇨🇦',
        'CHF': '🇨🇭',
        'NZD': '🇳🇿',
        'TRY': '🇹🇷',
        'ZAR': '🇿🇦'
    };
    
    return `${flags[baseCurrency] || '💱'} ${flags[quoteCurrency] || '💱'}`;
}

// Get currency full names
function getCurrencyName(currency) {
    const names = {
        'USD': 'US Dollar',
        'EUR': 'Euro',
        'GBP': 'British Pound',
        'JPY': 'Japanese Yen',
        'AUD': 'Australian Dollar',
        'CAD': 'Canadian Dollar',
        'CHF': 'Swiss Franc',
        'NZD': 'New Zealand Dollar',
        'TRY': 'Turkish Lira',
        'ZAR': 'South African Rand'
    };
    
    return names[currency] || currency;
}

// Calculate risk/reward ratio
function calculateRiskReward(forex) {
    const risk = Math.abs(forex.entryPrice - forex.stopLoss);
    const reward = Math.abs(forex.targetPrice - forex.entryPrice);
    return reward / risk;
}

// Open forex trade (placeholder for broker integration)
function openForexTrade(currencyPair, action) {
    alert(`Opening ${action.toUpperCase()} order for ${currencyPair}.\n\n` +
          `This would integrate with forex brokers like:\n` +
          `• MetaTrader 4/5\n` +
          `• Interactive Brokers\n` +
          `• OANDA\n` +
          `• TD Ameritrade\n` +
          `• Charles Schwab`);
}

// Set forex price alert
function setForexAlert(currencyPair, currentPrice) {
    const alertPrice = prompt(`Set price alert for ${currencyPair} (current: ${currentPrice.toFixed(4)}):`);
    if (alertPrice) {
        alert(`✅ Price alert set for ${currencyPair} at ${parseFloat(alertPrice).toFixed(4)}`);
    }
}

// Copy forex order details to clipboard
function copyForexOrder(forex) {
    const orderText = `Forex Trade Setup:\n` +
                     `Pair: ${forex.getCurrencyPair()}\n` +
                     `Action: ${forex.action.toUpperCase()}\n` +
                     `Entry: ${forex.entryPrice.toFixed(4)}\n` +
                     `Target: ${forex.targetPrice.toFixed(4)}\n` +
                     `Stop Loss: ${forex.stopLoss.toFixed(4)}\n` +
                     `Risk/Reward: ${calculateRiskReward(forex).toFixed(1)}\n` +
                     `Timeframe: ${forex.timeframe}\n` +
                     `Catalyst: ${forex.catalyst}`;
    
    navigator.clipboard.writeText(orderText).then(() => {
        alert('✅ Forex trade details copied to clipboard!');
    }).catch(() => {
        alert('❌ Failed to copy to clipboard. Please copy manually:\n\n' + orderText);
    });
}

// ============================================================================
// FOREX ECONOMIC ANALYSIS ENGINE (Task 5.2)
// ============================================================================

// Forex Economic Analysis Class
class ForexEconomicAnalyzer {
    constructor() {
        this.centralBanks = {
            'USD': { name: 'Federal Reserve', currentRate: 5.25, nextMeeting: '2024-12-18' },
            'EUR': { name: 'European Central Bank', currentRate: 4.25, nextMeeting: '2024-12-12' },
            'GBP': { name: 'Bank of England', currentRate: 5.00, nextMeeting: '2024-12-19' },
            'JPY': { name: 'Bank of Japan', currentRate: -0.10, nextMeeting: '2024-12-19' },
            'AUD': { name: 'Reserve Bank of Australia', currentRate: 4.35, nextMeeting: '2024-12-10' },
            'CAD': { name: 'Bank of Canada', currentRate: 5.00, nextMeeting: '2024-12-11' },
            'CHF': { name: 'Swiss National Bank', currentRate: 1.75, nextMeeting: '2024-12-12' },
            'NZD': { name: 'Reserve Bank of New Zealand', currentRate: 5.50, nextMeeting: '2024-11-27' }
        };
        
        this.economicIndicators = {
            'USD': { gdp: 2.4, inflation: 3.2, unemployment: 3.7, pmi: 48.4 },
            'EUR': { gdp: 0.4, inflation: 2.9, unemployment: 6.5, pmi: 46.5 },
            'GBP': { gdp: -0.1, inflation: 4.6, unemployment: 4.2, pmi: 49.9 },
            'JPY': { gdp: 1.2, inflation: 3.0, unemployment: 2.5, pmi: 48.9 },
            'AUD': { gdp: 2.1, inflation: 5.4, unemployment: 3.9, pmi: 47.3 },
            'CAD': { gdp: 1.1, inflation: 3.8, unemployment: 5.2, pmi: 47.8 }
        };
    }

    // Analyze central bank policy divergence
    analyzePolicyDivergence(baseCurrency, quoteCurrency) {
        const baseBank = this.centralBanks[baseCurrency];
        const quoteBank = this.centralBanks[quoteCurrency];
        
        if (!baseBank || !quoteBank) {
            return { divergence: 'unknown', impact: 'neutral', confidence: 50 };
        }
        
        const rateDiff = baseBank.currentRate - quoteBank.currentRate;
        const analysis = {
            rateDifferential: rateDiff,
            divergence: this.assessDivergence(baseCurrency, quoteCurrency),
            impact: rateDiff > 2 ? 'strong_positive' : rateDiff > 0.5 ? 'positive' : 
                   rateDiff < -2 ? 'strong_negative' : rateDiff < -0.5 ? 'negative' : 'neutral',
            confidence: this.calculatePolicyConfidence(baseCurrency, quoteCurrency),
            nextEvents: this.getUpcomingPolicyEvents(baseCurrency, quoteCurrency)
        };
        
        return analysis;
    }

    // Assess policy divergence trend
    assessDivergence(baseCurrency, quoteCurrency) {
        // Simplified divergence assessment based on recent policy trends
        const hawkishCurrencies = ['USD', 'GBP', 'AUD', 'NZD'];
        const dovishCurrencies = ['JPY', 'CHF'];
        const neutralCurrencies = ['EUR', 'CAD'];
        
        const baseStance = hawkishCurrencies.includes(baseCurrency) ? 'hawkish' :
                          dovishCurrencies.includes(baseCurrency) ? 'dovish' : 'neutral';
        const quoteStance = hawkishCurrencies.includes(quoteCurrency) ? 'hawkish' :
                           dovishCurrencies.includes(quoteCurrency) ? 'dovish' : 'neutral';
        
        if (baseStance === 'hawkish' && quoteStance === 'dovish') return 'strong_divergence';
        if (baseStance === 'dovish' && quoteStance === 'hawkish') return 'strong_divergence';
        if (baseStance !== quoteStance) return 'moderate_divergence';
        return 'convergence';
    }

    // Calculate policy confidence score
    calculatePolicyConfidence(baseCurrency, quoteCurrency) {
        let confidence = 60; // Base confidence
        
        const baseIndicators = this.economicIndicators[baseCurrency];
        const quoteIndicators = this.economicIndicators[quoteCurrency];
        
        if (baseIndicators && quoteIndicators) {
            // Higher confidence when economic data supports policy direction
            const baseStrength = this.calculateEconomicStrength(baseIndicators);
            const quoteStrength = this.calculateEconomicStrength(quoteIndicators);
            
            if (Math.abs(baseStrength - quoteStrength) > 20) {
                confidence += 15; // Clear economic divergence
            }
            
            // Adjust for inflation trends
            if (baseIndicators.inflation > 3 && quoteIndicators.inflation < 2) {
                confidence += 10; // Clear inflation divergence
            }
        }
        
        return Math.min(95, confidence);
    }

    // Calculate economic strength score
    calculateEconomicStrength(indicators) {
        let score = 50; // Base score
        
        // GDP contribution
        if (indicators.gdp > 2) score += 15;
        else if (indicators.gdp > 0) score += 5;
        else if (indicators.gdp < -1) score -= 15;
        
        // Unemployment contribution (lower is better)
        if (indicators.unemployment < 4) score += 10;
        else if (indicators.unemployment > 7) score -= 10;
        
        // PMI contribution
        if (indicators.pmi > 50) score += 10;
        else if (indicators.pmi < 45) score -= 10;
        
        // Inflation contribution (moderate inflation is good)
        if (indicators.inflation > 2 && indicators.inflation < 4) score += 5;
        else if (indicators.inflation > 6) score -= 10;
        
        return Math.max(0, Math.min(100, score));
    }

    // Get upcoming policy events
    getUpcomingPolicyEvents(baseCurrency, quoteCurrency) {
        const events = [];
        const baseBank = this.centralBanks[baseCurrency];
        const quoteBank = this.centralBanks[quoteCurrency];
        
        if (baseBank) {
            events.push({
                currency: baseCurrency,
                event: `${baseBank.name} Meeting`,
                date: baseBank.nextMeeting,
                currentRate: baseBank.currentRate
            });
        }
        
        if (quoteBank) {
            events.push({
                currency: quoteCurrency,
                event: `${quoteBank.name} Meeting`,
                date: quoteBank.nextMeeting,
                currentRate: quoteBank.currentRate
            });
        }
        
        return events.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // Analyze geopolitical impact
    analyzeGeopoliticalImpact(baseCurrency, quoteCurrency) {
        const geopoliticalFactors = {
            'USD': { safehaven: 0.9, stability: 0.8, geopolitical_risk: 0.2 },
            'EUR': { safehaven: 0.6, stability: 0.7, geopolitical_risk: 0.4 },
            'GBP': { safehaven: 0.5, stability: 0.6, geopolitical_risk: 0.5 },
            'JPY': { safehaven: 0.8, stability: 0.9, geopolitical_risk: 0.1 },
            'CHF': { safehaven: 0.9, stability: 0.9, geopolitical_risk: 0.1 },
            'AUD': { safehaven: 0.3, stability: 0.7, geopolitical_risk: 0.3 },
            'CAD': { safehaven: 0.4, stability: 0.8, geopolitical_risk: 0.2 }
        };
        
        const baseFactor = geopoliticalFactors[baseCurrency] || { safehaven: 0.5, stability: 0.5, geopolitical_risk: 0.5 };
        const quoteFactor = geopoliticalFactors[quoteCurrency] || { safehaven: 0.5, stability: 0.5, geopolitical_risk: 0.5 };
        
        return {
            safehavenAdvantage: baseFactor.safehaven - quoteFactor.safehaven,
            stabilityDifference: baseFactor.stability - quoteFactor.stability,
            riskDifference: quoteFactor.geopolitical_risk - baseFactor.geopolitical_risk,
            overallImpact: this.calculateGeopoliticalScore(baseFactor, quoteFactor)
        };
    }

    // Calculate geopolitical score
    calculateGeopoliticalScore(baseFactor, quoteFactor) {
        const score = (baseFactor.safehaven + baseFactor.stability - baseFactor.geopolitical_risk) -
                     (quoteFactor.safehaven + quoteFactor.stability - quoteFactor.geopolitical_risk);
        
        if (score > 0.3) return 'strong_positive';
        if (score > 0.1) return 'positive';
        if (score < -0.3) return 'strong_negative';
        if (score < -0.1) return 'negative';
        return 'neutral';
    }

    // Analyze commodity correlation
    analyzeCommodityCorrelation(currency) {
        const commodityCorrelations = {
            'AUD': { commodity: 'Iron Ore', correlation: 0.8, impact: 'high' },
            'CAD': { commodity: 'Oil', correlation: 0.7, impact: 'high' },
            'NZD': { commodity: 'Dairy', correlation: 0.6, impact: 'medium' },
            'ZAR': { commodity: 'Gold', correlation: 0.7, impact: 'high' },
            'USD': { commodity: 'Oil', correlation: -0.4, impact: 'medium' }
        };
        
        return commodityCorrelations[currency] || { commodity: 'None', correlation: 0, impact: 'low' };
    }

    // Generate comprehensive forex analysis
    generateComprehensiveAnalysis(forexRecommendation) {
        const policyAnalysis = this.analyzePolicyDivergence(
            forexRecommendation.baseCurrency, 
            forexRecommendation.quoteCurrency
        );
        
        const geopoliticalAnalysis = this.analyzeGeopoliticalImpact(
            forexRecommendation.baseCurrency, 
            forexRecommendation.quoteCurrency
        );
        
        const baseCommodity = this.analyzeCommodityCorrelation(forexRecommendation.baseCurrency);
        const quoteCommodity = this.analyzeCommodityCorrelation(forexRecommendation.quoteCurrency);
        
        return {
            policyDivergence: policyAnalysis,
            geopoliticalFactors: geopoliticalAnalysis,
            commodityExposure: {
                base: baseCommodity,
                quote: quoteCommodity
            },
            overallAssessment: this.calculateOverallAssessment(policyAnalysis, geopoliticalAnalysis),
            keyRisks: this.identifyKeyRisks(forexRecommendation, policyAnalysis, geopoliticalAnalysis),
            tradingRecommendations: this.generateTradingRecommendations(forexRecommendation, policyAnalysis)
        };
    }

    // Calculate overall assessment
    calculateOverallAssessment(policyAnalysis, geopoliticalAnalysis) {
        let score = 50; // Neutral base
        
        // Policy divergence impact
        switch(policyAnalysis.divergence) {
            case 'strong_divergence': score += 20; break;
            case 'moderate_divergence': score += 10; break;
            case 'convergence': score -= 5; break;
        }
        
        // Geopolitical impact
        switch(geopoliticalAnalysis.overallImpact) {
            case 'strong_positive': score += 15; break;
            case 'positive': score += 8; break;
            case 'strong_negative': score -= 15; break;
            case 'negative': score -= 8; break;
        }
        
        // Confidence adjustment
        score = score * (policyAnalysis.confidence / 100);
        
        return {
            score: Math.round(score),
            assessment: score > 70 ? 'Strong' : score > 60 ? 'Moderate' : score > 40 ? 'Weak' : 'Poor',
            confidence: policyAnalysis.confidence
        };
    }

    // Identify key risks
    identifyKeyRisks(forex, policyAnalysis, geopoliticalAnalysis) {
        const risks = [];
        
        if (policyAnalysis.confidence < 70) {
            risks.push('Policy uncertainty - central bank decisions unpredictable');
        }
        
        if (geopoliticalAnalysis.overallImpact.includes('negative')) {
            risks.push('Geopolitical tensions affecting currency stability');
        }
        
        if (Math.abs(forex.interestRateDiff) > 3) {
            risks.push('High interest rate differential - carry trade unwinding risk');
        }
        
        const daysToExpiration = Math.ceil((new Date(forex.economicEvents[0]?.date) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysToExpiration < 7) {
            risks.push('Major economic event within 7 days - high volatility expected');
        }
        
        return risks.length > 0 ? risks : ['Standard forex market volatility and leverage risks'];
    }

    // Generate trading recommendations
    generateTradingRecommendations(forex, policyAnalysis) {
        const recommendations = [];
        
        if (policyAnalysis.confidence > 80) {
            recommendations.push('High confidence setup - suitable for larger position sizes');
        } else if (policyAnalysis.confidence < 60) {
            recommendations.push('Lower confidence - reduce position size or wait for clarity');
        }
        
        if (Math.abs(forex.interestRateDiff) > 2) {
            recommendations.push('Consider carry trade implications for holding period');
        }
        
        if (forex.technicalLevels.trend === 'bullish' && forex.action === 'buy') {
            recommendations.push('Technical and fundamental alignment - strong setup');
        } else if (forex.technicalLevels.trend !== forex.action + 'ish') {
            recommendations.push('Technical-fundamental divergence - monitor closely');
        }
        
        recommendations.push('Use proper risk management - never risk more than 2% per trade');
        recommendations.push('Consider economic calendar for optimal entry timing');
        
        return recommendations;
    }
}

// Create global forex analyzer instance
const forexAnalyzer = new ForexEconomicAnalyzer();

// Enhanced forex analysis function
function generateAdvancedForexAnalysis(forexRecommendation) {
    return forexAnalyzer.generateComprehensiveAnalysis(forexRecommendation);
}

// Export forex functions for global access
window.filterForex = filterForex;
window.scanForexOpportunities = scanForexOpportunities;
window.openForexTrade = openForexTrade;
window.setForexAlert = setForexAlert;
window.copyForexOrder = copyForexOrder;
// =
===========================================================================
// RISK ASSESSMENT INTEGRATION (Task 7.1)
// ============================================================================

/**
 * Apply risk assessment to any recommendation
 * @param {Object} recommendation - The recommendation object
 * @param {Object} marketData - Market data for risk calculation
 * @returns {Object} Recommendation with risk assessment
 */
function applyRiskAssessment(recommendation, marketData = {}) {
    try {
        // Prepare assessment data
        const assessmentData = {
            priceData: {
                prices: marketData.historicalPrices || generateMockPrices(recommendation.entryPrice || recommendation.currentPrice)
            },
            liquidityData: {
                avgVolume: marketData.avgVolume || 1000000,
                marketCap: marketData.marketCap || 1000000000,
                spread: marketData.spread || 0.01
            },
            marketCap: marketData.marketCap || 1000000000,
            newsData: {
                sentiment: marketData.sentiment || 0,
                impactScore: marketData.impactScore || 5,
                volatilityIncrease: marketData.volatilityIncrease || 0.1,
                controversyLevel: marketData.controversyLevel || 0
            },
            technicalData: {
                trendStrength: marketData.trendStrength || 0.6,
                supportLevel: marketData.supportLevel || 0,
                resistanceLevel: marketData.resistanceLevel || 0,
                rsi: marketData.rsi || 50,
                macdSignal: marketData.macdSignal || 0.1,
                volumeConfirmation: marketData.volumeConfirmation !== false,
                breakoutProbability: marketData.breakoutProbability || 0.6
            },
            positionData: {
                entryPrice: recommendation.entryPrice || recommendation.currentPrice,
                positionSize: recommendation.positionSize || 100,
                stopLoss: recommendation.stopLoss,
                volatility: marketData.volatility || 0.3,
                timeframe: recommendation.timeframe || 30,
                assetType: recommendation.assetType || 'stock'
            },
            probabilityData: {
                historicalWinRate: recommendation.confidence ? recommendation.confidence / 100 : 0.6,
                marketConditions: marketData.marketConditions || 'neutral',
                volatilityLevel: marketData.volatilityLevel || 'medium',
                newsRisk: marketData.newsRisk || 50,
                technicalRisk: marketData.technicalRisk || 50,
                timeframe: recommendation.timeframe || 30
            }
        };

        // Generate risk assessment
        const riskAssessment = RiskScorer.generateRiskAssessment(assessmentData);
        
        // Calculate position sizing if account size is available
        let positionSizing = null;
        if (marketData.accountSize) {
            positionSizing = PositionSizer.calculatePositionSize({
                accountSize: marketData.accountSize,
                riskTolerance: marketData.riskTolerance || 0.02,
                entryPrice: recommendation.entryPrice || recommendation.currentPrice,
                stopLoss: recommendation.stopLoss,
                riskScore: riskAssessment.riskScore,
                maxLossPercent: riskAssessment.maxLoss
            });
        }

        // Add risk assessment to recommendation
        recommendation.riskAssessment = riskAssessment;
        recommendation.positionSizing = positionSizing;
        
        return recommendation;
        
    } catch (error) {
        console.error('Error applying risk assessment:', error);
        // Return recommendation with default risk assessment
        recommendation.riskAssessment = new RiskAssessment({
            overallRisk: 'Medium',
            riskScore: 50
        });
        return recommendation;
    }
}

/**
 * Generate mock historical prices for risk calculation
 * @param {number} currentPrice - Current stock price
 * @returns {Array} Array of historical prices
 */
function generateMockPrices(currentPrice) {
    const prices = [];
    let price = currentPrice;
    
    // Generate 30 days of mock price data
    for (let i = 0; i < 30; i++) {
        // Add some random volatility (±5%)
        const change = (Math.random() - 0.5) * 0.1;
        price = price * (1 + change);
        prices.unshift(price); // Add to beginning to get chronological order
    }
    
    return prices;
}

/**
 * Display risk assessment in recommendation card
 * @param {Object} riskAssessment - Risk assessment object
 * @returns {string} HTML for risk display
 */
function generateRiskAssessmentHTML(riskAssessment) {
    if (!riskAssessment) return '';
    
    const riskClass = riskAssessment.overallRisk === 'Low' ? 'profit-positive' : 
                     riskAssessment.overallRisk === 'Medium' ? 'warning' : 'profit-negative';
    
    return `
        <div class="risk-meter ${riskAssessment.overallRisk.toLowerCase()}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="color: var(--text-gray); font-size: 0.9rem;">Risk Level:</span>
                <span class="catalyst-tag ${riskClass}">${riskAssessment.overallRisk} Risk</span>
            </div>
            <div class="risk-bar">
                <div class="risk-fill" style="width: ${riskAssessment.riskScore}%"></div>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-gray); margin-top: 5px;">
                Score: ${riskAssessment.riskScore}/100 | Max Loss: ${riskAssessment.maxLoss.toFixed(1)}%
            </div>
        </div>
    `;
}

/**
 * Display position sizing recommendations
 * @param {Object} positionSizing - Position sizing object
 * @returns {string} HTML for position sizing display
 */
function generatePositionSizingHTML(positionSizing) {
    if (!positionSizing) return '';
    
    return `
        <div class="tip-box">
            <div class="tip-title">📊 Position Sizing Recommendation:</div>
            <div style="color: var(--text-gray); line-height: 1.6;">
                Recommended Shares: <strong>${positionSizing.recommendedShares}</strong><br>
                Position Value: <strong>$${positionSizing.positionValue.toLocaleString()}</strong><br>
                Portfolio %: <strong>${positionSizing.positionPercent}%</strong><br>
                Max Risk: <strong>$${positionSizing.maxRiskAmount.toLocaleString()}</strong>
            </div>
        </div>
    `;
}

/**
 * Enhanced recommendation card generator with risk assessment
 * @param {Object} recommendation - Recommendation with risk assessment
 * @returns {string} HTML for enhanced recommendation card
 */
function generateEnhancedRecommendationCard(recommendation) {
    const baseCard = generateBasicRecommendationCard(recommendation);
    const riskHTML = generateRiskAssessmentHTML(recommendation.riskAssessment);
    const positionHTML = generatePositionSizingHTML(recommendation.positionSizing);
    
    // Insert risk assessment before action buttons
    const actionButtonsIndex = baseCard.lastIndexOf('<div class="action-buttons">');
    if (actionButtonsIndex !== -1) {
        return baseCard.slice(0, actionButtonsIndex) + 
               riskHTML + 
               positionHTML + 
               baseCard.slice(actionButtonsIndex);
    }
    
    return baseCard + riskHTML + positionHTML;
}

/**
 * Apply risk assessment to all recommendations in a list
 * @param {Array} recommendations - Array of recommendations
 * @param {Object} globalMarketData - Global market conditions
 * @returns {Array} Enhanced recommendations with risk assessments
 */
function enhanceRecommendationsWithRisk(recommendations, globalMarketData = {}) {
    return recommendations.map(recommendation => {
        // Merge global market data with recommendation-specific data
        const marketData = {
            ...globalMarketData,
            ...recommendation.marketData
        };
        
        return applyRiskAssessment(recommendation, marketData);
    });
}

// ============================================================================
// RISK ASSESSMENT UTILITY FUNCTIONS
// ============================================================================

/**
 * Get risk color based on risk level
 * @param {string} riskLevel - Risk level (Low, Medium, High)
 * @returns {string} CSS color class
 */
function getRiskColorClass(riskLevel) {
    switch (riskLevel) {
        case 'Low': return 'profit-positive';
        case 'Medium': return 'warning';
        case 'High': return 'profit-negative';
        default: return 'warning';
    }
}

/**
 * Format risk score for display
 * @param {number} riskScore - Risk score 0-100
 * @returns {string} Formatted risk score
 */
function formatRiskScore(riskScore) {
    if (riskScore <= 30) return `${riskScore}/100 (Low Risk)`;
    if (riskScore <= 70) return `${riskScore}/100 (Medium Risk)`;
    return `${riskScore}/100 (High Risk)`;
}

/**
 * Get risk recommendation text
 * @param {Object} riskAssessment - Risk assessment object
 * @returns {string} Risk recommendation text
 */
function getRiskRecommendationText(riskAssessment) {
    if (!riskAssessment) return 'Risk assessment unavailable';
    
    const { overallRisk, riskScore, maxLoss } = riskAssessment;
    
    if (overallRisk === 'Low') {
        return `Low risk investment with ${maxLoss.toFixed(1)}% maximum expected loss. Suitable for conservative portfolios.`;
    } else if (overallRisk === 'Medium') {
        return `Moderate risk investment with ${maxLoss.toFixed(1)}% maximum expected loss. Appropriate position sizing recommended.`;
    } else {
        return `High risk investment with ${maxLoss.toFixed(1)}% maximum expected loss. Only suitable for aggressive risk tolerance.`;
    }
}
/
/ ============================================================================
// CONFIDENCE AND ACCURACY TRACKING INTEGRATION (Task 7.2)
// ============================================================================

/**
 * Enhanced recommendation generation with confidence and accuracy tracking
 * Integrates with the confidence-accuracy-tracker.js system
 */

/**
 * Generate recommendation with confidence score and accuracy tracking
 * @param {Object} baseRecommendation - Base recommendation data
 * @param {Object} analysisData - Analysis data for confidence calculation
 * @returns {Object} Enhanced recommendation with confidence and tracking
 */
function generateTrackedRecommendation(baseRecommendation, analysisData = {}) {
    try {
        // Calculate confidence score using the ConfidenceCalculator
        const confidence = ConfidenceCalculator.calculateConfidence({
            technicalAnalysis: analysisData.technical || generateMockTechnicalAnalysis(baseRecommendation),
            fundamentalAnalysis: analysisData.fundamental || generateMockFundamentalAnalysis(baseRecommendation),
            newsAnalysis: analysisData.news || generateMockNewsAnalysis(baseRecommendation),
            marketConditions: analysisData.market || generateMockMarketConditions(),
            historicalAccuracy: getHistoricalAccuracyForType(baseRecommendation.assetType, baseRecommendation.category),
            riskAssessment: baseRecommendation.riskAssessment,
            volumeAnalysis: analysisData.volume || generateMockVolumeAnalysis(baseRecommendation),
            catalystStrength: analysisData.catalystStrength || 0.5
        });

        // Calculate success probability
        const successProbability = ConfidenceCalculator.calculateSuccessProbability({
            confidence: confidence,
            timeframe: baseRecommendation.timeframe,
            historicalAccuracy: getHistoricalAccuracyForType(baseRecommendation.assetType, baseRecommendation.category),
            marketConditions: analysisData.market?.overallTrend || 'neutral',
            riskLevel: baseRecommendation.riskAssessment?.overallRisk || 'Medium'
        });

        // Get similar historical setups
        const similarSetups = globalAccuracyTracker.getSimilarSetups(baseRecommendation);

        // Create enhanced recommendation
        const enhancedRecommendation = {
            ...baseRecommendation,
            confidence: confidence,
            successProbability: successProbability,
            historicalPerformance: formatHistoricalPerformanceData(similarSetups),
            accuracyStats: getAccuracyStatsForType(baseRecommendation.assetType, baseRecommendation.category),
            confidenceCalibration: getConfidenceCalibrationData(confidence),
            trackingId: generateTrackingId(),
            enhancedAt: new Date().toISOString()
        };

        // Record for tracking
        globalAccuracyTracker.recordRecommendation(enhancedRecommendation);

        return enhancedRecommendation;
    } catch (error) {
        console.error('Error generating tracked recommendation:', error);
        // Return base recommendation with default confidence if enhancement fails
        return {
            ...baseRecommendation,
            confidence: 50,
            trackingId: generateTrackingId(),
            enhancementError: error.message
        };
    }
}

/**
 * Generate mock technical analysis for confidence calculation
 * @param {Object} recommendation - Base recommendation
 * @returns {Object} Mock technical analysis data
 */
function generateMockTechnicalAnalysis(recommendation) {
    // Generate realistic technical analysis based on recommendation type
    const baseStrength = recommendation.category === 'growth-stocks' ? 0.7 : 0.6;
    
    return {
        trendStrength: Math.min(0.9, baseStrength + (Math.random() * 0.3)),
        supportResistance: Math.min(0.9, baseStrength + (Math.random() * 0.2)),
        momentum: Math.min(0.9, baseStrength + (Math.random() * 0.25)),
        volumeConfirmation: Math.random() > 0.3,
        patternStrength: Math.min(0.9, baseStrength + (Math.random() * 0.2))
    };
}

/**
 * Generate mock fundamental analysis for confidence calculation
 * @param {Object} recommendation - Base recommendation
 * @returns {Object} Mock fundamental analysis data
 */
function generateMockFundamentalAnalysis(recommendation) {
    const baseStrength = recommendation.category === 'biotech-analyzer' ? 0.6 : 0.7;
    
    return {
        financialHealth: Math.min(0.95, baseStrength + (Math.random() * 0.3)),
        growthProspects: Math.min(0.95, baseStrength + (Math.random() * 0.25)),
        valuation: Math.min(0.9, 0.5 + (Math.random() * 0.4)),
        competitivePosition: Math.min(0.9, baseStrength + (Math.random() * 0.2)),
        managementQuality: Math.min(0.9, baseStrength + (Math.random() * 0.2))
    };
}

/**
 * Generate mock news analysis for confidence calculation
 * @param {Object} recommendation - Base recommendation
 * @returns {Object} Mock news analysis data
 */
function generateMockNewsAnalysis(recommendation) {
    const baseSentiment = recommendation.action === 'buy' ? 0.3 : -0.3;
    
    return {
        sentiment: Math.max(-0.8, Math.min(0.8, baseSentiment + (Math.random() * 0.6 - 0.3))),
        impactScore: Math.floor(Math.random() * 5) + 5, // 5-10
        sourceCredibility: 0.7 + (Math.random() * 0.3),
        recency: Math.random(),
        relevance: 0.6 + (Math.random() * 0.4)
    };
}

/**
 * Generate mock market conditions for confidence calculation
 * @returns {Object} Mock market conditions data
 */
function generateMockMarketConditions() {
    const trends = ['bullish', 'bearish', 'neutral', 'volatile'];
    const volatilities = ['low', 'medium', 'high'];
    const volumes = ['low', 'normal', 'high'];
    
    return {
        overallTrend: trends[Math.floor(Math.random() * trends.length)],
        volatility: volatilities[Math.floor(Math.random() * volatilities.length)],
        volume: volumes[Math.floor(Math.random() * volumes.length)],
        sectorPerformance: 0.3 + (Math.random() * 0.7)
    };
}

/**
 * Generate mock volume analysis for confidence calculation
 * @param {Object} recommendation - Base recommendation
 * @returns {Object} Mock volume analysis data
 */
function generateMockVolumeAnalysis(recommendation) {
    return {
        volumeIncrease: 1 + (Math.random() * 2), // 1x to 3x
        institutionalFlow: Math.random() > 0.5 ? 'buying' : Math.random() > 0.5 ? 'selling' : 'neutral',
        liquidityLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.3 ? 'normal' : 'low'
    };
}

/**
 * Get historical accuracy for recommendation type
 * @param {string} assetType - Asset type
 * @param {string} category - Recommendation category
 * @returns {Object} Historical accuracy data
 */
function getHistoricalAccuracyForType(assetType, category) {
    return globalAccuracyTracker.getAccuracyByType(assetType, category);
}

/**
 * Get accuracy statistics for recommendation type
 * @param {string} assetType - Asset type
 * @param {string} category - Recommendation category
 * @returns {Object} Accuracy statistics
 */
function getAccuracyStatsForType(assetType, category) {
    const typeStats = globalAccuracyTracker.getAccuracyByType(assetType, category);
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
 * Format historical performance data for display
 * @param {Array} similarSetups - Similar historical recommendations
 * @returns {Object} Formatted historical performance
 */
function formatHistoricalPerformanceData(similarSetups) {
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
 * Get confidence calibration data
 * @param {number} confidence - Confidence score
 * @returns {Object} Confidence calibration data
 */
function getConfidenceCalibrationData(confidence) {
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
function generateTrackingId() {
    return 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Enhanced recommendation card generation with confidence and accuracy
 * @param {Object} recommendation - Enhanced recommendation object
 * @returns {string} HTML for enhanced recommendation card
 */
function generateConfidenceEnhancedCard(recommendation) {
    // Generate base recommendation card
    const baseCard = generateBasicRecommendationCard(recommendation);
    
    // Generate confidence and accuracy components
    const confidenceHTML = ConfidenceDisplayUtils.generateConfidenceHTML(
        recommendation.confidence, 
        recommendation.confidenceCalibration
    );
    
    const probabilityHTML = ConfidenceDisplayUtils.generateSuccessProbabilityHTML(
        recommendation.successProbability
    );
    
    const historicalHTML = ConfidenceDisplayUtils.generateHistoricalPerformanceHTML(
        recommendation.historicalPerformance
    );
    
    const accuracyHTML = ConfidenceDisplayUtils.generateAccuracyStatsHTML(
        recommendation.accuracyStats
    );

    // Combine all components
    const enhancedSection = `
        <div class="confidence-accuracy-section">
            ${confidenceHTML}
            ${probabilityHTML}
            ${accuracyHTML}
            ${historicalHTML}
        </div>
    `;

    // Insert enhanced section before action buttons
    const actionButtonsIndex = baseCard.lastIndexOf('<div class="action-buttons">');
    if (actionButtonsIndex !== -1) {
        const beforeButtons = baseCard.slice(0, actionButtonsIndex);
        const afterButtons = baseCard.slice(actionButtonsIndex);
        
        // Add tracking ID to the card
        const cardWithTracking = beforeButtons.replace(
            'class="stock-result"',
            `class="stock-result enhanced-recommendation-card" data-tracking-id="${recommendation.trackingId}"`
        );
        
        return cardWithTracking + enhancedSection + afterButtons.replace(
            '</div>',
            `<button class="btn btn-secondary btn-small" onclick="trackRecommendationOutcome('${recommendation.trackingId}')">
                📊 Track Outcome
            </button>
        </div>`
        );
    }
    
    return baseCard + enhancedSection;
}

/**
 * Update existing recommendation functions to use confidence tracking
 */

// Override the existing recommendation generation functions
const originalGenerateInsiderTradeCard = generateInsiderTradeCard;
const originalGenerateCatalystCard = generateCatalystCard;
const originalGenerateBiotechCard = generateBiotechCard;
const originalGenerateGrowthStockCard = generateGrowthStockCard;

/**
 * Enhanced insider trade card with confidence tracking
 */
function generateInsiderTradeCard(trade) {
    const baseCard = originalGenerateInsiderTradeCard(trade);
    
    // Convert insider trade to recommendation format for tracking
    const recommendation = {
        id: generateTrackingId(),
        symbol: trade.symbol,
        assetType: 'stock',
        action: trade.action,
        entryPrice: trade.currentPrice,
        targetPrice: trade.currentPrice * (trade.action === 'buy' ? 1.2 : 0.8),
        confidence: trade.confidence,
        category: 'insider-following',
        timeframe: '3-6 months'
    };
    
    const trackedRecommendation = generateTrackedRecommendation(recommendation);
    return generateConfidenceEnhancedCard(trackedRecommendation);
}

/**
 * Enhanced catalyst card with confidence tracking
 */
function generateCatalystCard(catalyst) {
    const baseCard = originalGenerateCatalystCard(catalyst);
    
    // Convert catalyst to recommendation format for tracking
    const recommendation = {
        id: generateTrackingId(),
        symbol: catalyst.symbol,
        assetType: 'stock',
        action: 'buy',
        entryPrice: catalyst.currentPrice,
        targetPrice: catalyst.targetPrice,
        confidence: catalyst.probability,
        category: 'catalyst-trading',
        timeframe: catalyst.timeframe || '1-3 months'
    };
    
    const trackedRecommendation = generateTrackedRecommendation(recommendation);
    return generateConfidenceEnhancedCard(trackedRecommendation);
}

/**
 * Enhanced biotech card with confidence tracking
 */
function generateBiotechCard(play) {
    const baseCard = originalGenerateBiotechCard(play);
    
    // Convert biotech play to recommendation format for tracking
    const recommendation = {
        id: generateTrackingId(),
        symbol: play.symbol,
        assetType: 'stock',
        action: 'buy',
        entryPrice: play.currentPrice,
        targetPrice: play.targetPrice,
        confidence: play.probability,
        category: 'biotech-analyzer',
        timeframe: '6-18 months'
    };
    
    const trackedRecommendation = generateTrackedRecommendation(recommendation);
    return generateConfidenceEnhancedCard(trackedRecommendation);
}

/**
 * Enhanced growth stock card with confidence tracking
 */
function generateGrowthStockCard(stock) {
    const baseCard = originalGenerateGrowthStockCard(stock);
    
    // Convert growth stock to recommendation format for tracking
    const recommendation = {
        id: generateTrackingId(),
        symbol: stock.symbol,
        assetType: 'stock',
        action: 'buy',
        entryPrice: stock.currentPrice,
        targetPrice: stock.targetPrice,
        confidence: stock.confidence,
        category: 'growth-stocks',
        timeframe: stock.timeframe || '12-24 months'
    };
    
    const trackedRecommendation = generateTrackedRecommendation(recommendation);
    return generateConfidenceEnhancedCard(trackedRecommendation);
}

/**
 * Utility function to simulate recommendation outcomes for testing
 * @param {string} trackingId - Tracking ID of recommendation
 * @param {boolean} success - Whether the recommendation was successful
 * @param {number} returnPercent - Actual return percentage
 * @param {number} daysHeld - Days the position was held
 */
function simulateRecommendationOutcome(trackingId, success, returnPercent, daysHeld) {
    const outcomeData = {
        actualReturn: returnPercent,
        daysToTarget: daysHeld,
        hitTarget: success,
        hitStopLoss: !success && returnPercent < -10,
        finalPrice: null, // Will be calculated
        outcomeType: success ? 'target_hit' : 'manual_exit'
    };
    
    globalAccuracyTracker.updateOutcome(trackingId, outcomeData);
}

/**
 * Get accuracy dashboard data for display
 * @returns {Object} Dashboard data
 */
function getAccuracyDashboardData() {
    const overallStats = globalAccuracyTracker.getOverallAccuracy();
    const stockStats = globalAccuracyTracker.getAccuracyByType('stock', 'growth-stocks');
    const biotechStats = globalAccuracyTracker.getAccuracyByType('stock', 'biotech-analyzer');
    const catalystStats = globalAccuracyTracker.getAccuracyByType('stock', 'catalyst-trading');
    
    return {
        overall: overallStats,
        byType: {
            growthStocks: stockStats,
            biotech: biotechStats,
            catalyst: catalystStats
        },
        recentRecommendations: globalAccuracyTracker.performanceHistory.slice(-10)
    };
}

// Initialize confidence and accuracy tracking on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load existing tracking data
    globalAccuracyTracker.loadFromStorage();
    
    console.log('Confidence and Accuracy Tracking initialized');
    console.log('Total tracked recommendations:', globalAccuracyTracker.recommendations.size);
    console.log('Performance history entries:', globalAccuracyTracker.performanceHistory.length);
});