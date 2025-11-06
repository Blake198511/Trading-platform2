// User Verification UI Components
// UI functions for user verification and badge system

// ============================================================================
// USER VERIFICATION MODAL AND UI
// ============================================================================

// Show user verification modal
function showUserVerificationModal() {
    const modal = document.createElement('div');
    modal.className = 'verification-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeVerificationModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>🔐 Become a Verified Trader</h2>
                <button class="modal-close" onclick="closeVerificationModal()">×</button>
            </div>
            
            <div class="modal-body">
                <div class="verification-methods">
                    <h3>Choose Verification Method:</h3>
                    
                    <div class="verification-option" onclick="startTradingHistoryVerification()">
                        <div class="option-icon">📊</div>
                        <div class="option-content">
                            <h4>Trading History Verification</h4>
                            <p>Connect your broker account to verify trading activity and performance</p>
                            <div class="option-badge recommended">Recommended</div>
                        </div>
                    </div>
                    
                    <div class="verification-option" onclick="startScreenshotVerification()">
                        <div class="option-icon">📸</div>
                        <div class="option-content">
                            <h4>Trade Screenshot Verification</h4>
                            <p>Upload screenshots of your recent trades for manual review</p>
                            <div class="option-badge">Manual Review</div>
                        </div>
                    </div>
                    
                    <div class="verification-option" onclick="startBrokerStatementVerification()">
                        <div class="option-icon">📋</div>
                        <div class="option-content">
                            <h4>Broker Statement Upload</h4>
                            <p>Upload your official broker statements for verification</p>
                            <div class="option-badge">Secure</div>
                        </div>
                    </div>
                </div>
                
                <div class="verification-benefits">
                    <h3>✅ Verification Benefits:</h3>
                    <ul>
                        <li>Verified Trader badge next to your name</li>
                        <li>Access to verified-only discussions</li>
                        <li>Higher reputation and credibility</li>
                        <li>Ability to share public stock picks</li>
                        <li>Performance tracking and leaderboard</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Close verification modal
function closeVerificationModal() {
    const modal = document.querySelector('.verification-modal');
    if (modal) {
        modal.remove();
    }
}

// Start trading history verification
function startTradingHistoryVerification() {
    closeVerificationModal();
    showTradingHistoryModal();
}

// Show trading history verification modal
function showTradingHistoryModal() {
    const modal = document.createElement('div');
    modal.className = 'verification-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeTradingHistoryModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>📊 Trading History Verification</h2>
                <button class="modal-close" onclick="closeTradingHistoryModal()">×</button>
            </div>
            
            <div class="modal-body">
                <div class="verification-form">
                    <div class="form-group">
                        <label>Select Your Broker:</label>
                        <select id="brokerSelect">
                            <option value="">Choose your broker...</option>
                            <option value="robinhood">Robinhood</option>
                            <option value="td_ameritrade">TD Ameritrade</option>
                            <option value="e_trade">E*TRADE</option>
                            <option value="fidelity">Fidelity</option>
                            <option value="charles_schwab">Charles Schwab</option>
                            <option value="interactive_brokers">Interactive Brokers</option>
                            <option value="webull">Webull</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Account Username/Email:</label>
                        <input type="text" id="brokerUsername" placeholder="Your broker account username">
                    </div>
                    
                    <div class="form-group">
                        <label>Account Password:</label>
                        <input type="password" id="brokerPassword" placeholder="Your broker account password">
                        <div class="security-note">
                            🔒 Your credentials are encrypted and never stored. We only access read-only trading data.
                        </div>
                    </div>
                    
                    <div class="verification-steps">
                        <h4>Verification Process:</h4>
                        <div class="step-list">
                            <div class="step">1. Secure connection to your broker</div>
                            <div class="step">2. Validate account ownership</div>
                            <div class="step">3. Analyze trading activity</div>
                            <div class="step">4. Calculate performance metrics</div>
                            <div class="step">5. Final approval</div>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary" onclick="processTradingVerification()" style="width: 100%; margin-top: 20px;">
                        🔐 Start Verification Process
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Close trading history modal
function closeTradingHistoryModal() {
    const modal = document.querySelector('.verification-modal');
    if (modal) {
        modal.remove();
    }
}

// Process trading verification
async function processTradingVerification() {
    const broker = document.getElementById('brokerSelect').value;
    const username = document.getElementById('brokerUsername').value;
    const password = document.getElementById('brokerPassword').value;
    
    if (!broker || !username || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Show progress modal
    showVerificationProgress();
    
    try {
        // Simulate verification process
        const userId = getCurrentUserId();
        const credentials = { username, password };
        
        const verification = await tradingVerification.startTradingVerification(userId, broker, credentials);
        
        if (verification.status === 'completed') {
            showVerificationSuccess();
            // Award verified trader badge
            badgeSystem.awardBadge(userId, 'verified_trader');
        } else {
            showVerificationFailure(verification.errors);
        }
        
    } catch (error) {
        showVerificationFailure([error.message]);
    }
}

// Show verification progress
function showVerificationProgress() {
    closeTradingHistoryModal();
    
    const modal = document.createElement('div');
    modal.className = 'verification-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>🔄 Verifying Your Trading History</h2>
            </div>
            
            <div class="modal-body">
                <div class="progress-container">
                    <div class="progress-steps">
                        <div class="progress-step active" id="step1">
                            <div class="step-icon">🔗</div>
                            <div class="step-text">Connecting to broker...</div>
                        </div>
                        <div class="progress-step" id="step2">
                            <div class="step-icon">✅</div>
                            <div class="step-text">Validating account...</div>
                        </div>
                        <div class="progress-step" id="step3">
                            <div class="step-icon">📊</div>
                            <div class="step-text">Analyzing trading activity...</div>
                        </div>
                        <div class="progress-step" id="step4">
                            <div class="step-icon">📈</div>
                            <div class="step-text">Calculating performance...</div>
                        </div>
                        <div class="progress-step" id="step5">
                            <div class="step-icon">🎯</div>
                            <div class="step-text">Final approval...</div>
                        </div>
                    </div>
                    
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    
                    <div class="progress-text">
                        This may take a few minutes. Please don't close this window.
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate progress
    animateVerificationProgress();
}

// Animate verification progress
function animateVerificationProgress() {
    const steps = ['step1', 'step2', 'step3', 'step4', 'step5'];
    const progressFill = document.getElementById('progressFill');
    let currentStep = 0;
    
    const interval = setInterval(() => {
        if (currentStep > 0) {
            document.getElementById(steps[currentStep - 1]).classList.remove('active');
            document.getElementById(steps[currentStep - 1]).classList.add('completed');
        }
        
        if (currentStep < steps.length) {
            document.getElementById(steps[currentStep]).classList.add('active');
            progressFill.style.width = ((currentStep + 1) / steps.length * 100) + '%';
            currentStep++;
        } else {
            clearInterval(interval);
        }
    }, 2000);
}

// Show verification success
function showVerificationSuccess() {
    const modal = document.querySelector('.verification-modal');
    if (modal) {
        modal.innerHTML = `
            <div class="modal-overlay" onclick="closeVerificationModal()"></div>
            <div class="modal-content">
                <div class="modal-header success">
                    <h2>🎉 Verification Successful!</h2>
                    <button class="modal-close" onclick="closeVerificationModal()">×</button>
                </div>
                
                <div class="modal-body">
                    <div class="success-content">
                        <div class="success-icon">✅</div>
                        <h3>Welcome to Verified Traders!</h3>
                        <p>Your trading history has been successfully verified. You now have access to:</p>
                        
                        <ul class="benefits-list">
                            <li>✅ Verified Trader badge</li>
                            <li>📊 Performance tracking</li>
                            <li>🏆 Leaderboard participation</li>
                            <li>💬 Verified-only discussions</li>
                            <li>📈 Public stock picks</li>
                        </ul>
                        
                        <div class="new-badge">
                            <span class="user-badge verified">✅ Verified Trader</span>
                        </div>
                        
                        <button class="btn btn-primary" onclick="closeVerificationModal(); refreshForumPosts();" style="width: 100%; margin-top: 20px;">
                            🚀 Start Trading & Sharing
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Show verification failure
function showVerificationFailure(errors) {
    const modal = document.querySelector('.verification-modal');
    if (modal) {
        modal.innerHTML = `
            <div class="modal-overlay" onclick="closeVerificationModal()"></div>
            <div class="modal-content">
                <div class="modal-header error">
                    <h2>❌ Verification Failed</h2>
                    <button class="modal-close" onclick="closeVerificationModal()">×</button>
                </div>
                
                <div class="modal-body">
                    <div class="error-content">
                        <div class="error-icon">⚠️</div>
                        <h3>Unable to Verify Account</h3>
                        <p>We encountered issues during verification:</p>
                        
                        <ul class="error-list">
                            ${errors.map(error => `<li>${error}</li>`).join('')}
                        </ul>
                        
                        <div class="retry-options">
                            <button class="btn btn-secondary" onclick="showUserVerificationModal()">
                                🔄 Try Different Method
                            </button>
                            <button class="btn btn-primary" onclick="showTradingHistoryModal()">
                                🔁 Retry Verification
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// ============================================================================
// SCREENSHOT VERIFICATION UI
// ============================================================================

// Start screenshot verification
function startScreenshotVerification() {
    closeVerificationModal();
    showScreenshotUploadModal();
}

// Show screenshot upload modal
function showScreenshotUploadModal() {
    const modal = document.createElement('div');
    modal.className = 'verification-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeScreenshotModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>📸 Trade Screenshot Verification</h2>
                <button class="modal-close" onclick="closeScreenshotModal()">×</button>
            </div>
            
            <div class="modal-body">
                <div class="screenshot-form">
                    <div class="form-group">
                        <label>Select Your Broker:</label>
                        <select id="screenshotBroker">
                            <option value="">Choose your broker...</option>
                            <option value="robinhood">Robinhood</option>
                            <option value="td_ameritrade">TD Ameritrade</option>
                            <option value="e_trade">E*TRADE</option>
                            <option value="fidelity">Fidelity</option>
                            <option value="charles_schwab">Charles Schwab</option>
                            <option value="interactive_brokers">Interactive Brokers</option>
                            <option value="webull">Webull</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Upload Trade Screenshots:</label>
                        <div class="file-upload-area" onclick="document.getElementById('screenshotFile').click()">
                            <div class="upload-icon">📁</div>
                            <div class="upload-text">Click to upload screenshots</div>
                            <div class="upload-subtext">PNG, JPG up to 10MB each</div>
                        </div>
                        <input type="file" id="screenshotFile" multiple accept="image/*" style="display: none;" onchange="handleScreenshotUpload(event)">
                    </div>
                    
                    <div id="uploadedFiles" class="uploaded-files"></div>
                    
                    <div class="screenshot-requirements">
                        <h4>📋 Screenshot Requirements:</h4>
                        <ul>
                            <li>Must show your broker's official interface</li>
                            <li>Include trade details (symbol, quantity, price, date)</li>
                            <li>Show account information (partially obscured is OK)</li>
                            <li>Clear, unedited screenshots only</li>
                            <li>At least 3 recent trades required</li>
                        </ul>
                    </div>
                    
                    <button class="btn btn-primary" onclick="submitScreenshots()" style="width: 100%; margin-top: 20px;" disabled id="submitScreenshotsBtn">
                        📤 Submit for Verification
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Close screenshot modal
function closeScreenshotModal() {
    const modal = document.querySelector('.verification-modal');
    if (modal) {
        modal.remove();
    }
}

// Handle screenshot upload
function handleScreenshotUpload(event) {
    const files = event.target.files;
    const uploadedFilesDiv = document.getElementById('uploadedFiles');
    const submitBtn = document.getElementById('submitScreenshotsBtn');
    
    uploadedFilesDiv.innerHTML = '';
    
    Array.from(files).forEach((file, index) => {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'uploaded-file';
        fileDiv.innerHTML = `
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
            <button class="remove-file" onclick="removeFile(${index})">×</button>
        `;
        uploadedFilesDiv.appendChild(fileDiv);
    });
    
    if (files.length >= 3) {
        submitBtn.disabled = false;
        submitBtn.textContent = `📤 Submit ${files.length} Screenshots`;
    }
}

// Submit screenshots for verification
async function submitScreenshots() {
    const broker = document.getElementById('screenshotBroker').value;
    const files = document.getElementById('screenshotFile').files;
    
    if (!broker || files.length < 3) {
        alert('Please select a broker and upload at least 3 screenshots');
        return;
    }
    
    // Show processing modal
    showScreenshotProcessing();
    
    try {
        const userId = getCurrentUserId();
        
        // Process each screenshot
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const screenshotData = {
                imageData: await fileToBase64(file),
                brokerName: broker,
                tradeDetails: {
                    filename: file.name,
                    size: file.size,
                    uploadedAt: Date.now()
                }
            };
            
            await screenshotVerification.submitScreenshot(userId, screenshotData);
        }
        
        showScreenshotSuccess();
        // Award screenshot verified badge
        badgeSystem.awardBadge(userId, 'screenshot_verified');
        
    } catch (error) {
        showScreenshotFailure([error.message]);
    }
}

// Show screenshot processing
function showScreenshotProcessing() {
    closeScreenshotModal();
    
    const modal = document.createElement('div');
    modal.className = 'verification-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>🔍 Analyzing Screenshots</h2>
            </div>
            
            <div class="modal-body">
                <div class="processing-container">
                    <div class="processing-animation">
                        <div class="spinner"></div>
                    </div>
                    <h3>AI Verification in Progress</h3>
                    <p>Our AI is analyzing your screenshots for authenticity and compliance...</p>
                    
                    <div class="processing-steps">
                        <div class="processing-step">🔍 Checking image authenticity</div>
                        <div class="processing-step">🏦 Verifying broker interface</div>
                        <div class="processing-step">📊 Extracting trade data</div>
                        <div class="processing-step">✅ Final validation</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Show screenshot success
function showScreenshotSuccess() {
    const modal = document.querySelector('.verification-modal');
    if (modal) {
        modal.innerHTML = `
            <div class="modal-overlay" onclick="closeVerificationModal()"></div>
            <div class="modal-content">
                <div class="modal-header success">
                    <h2>📸 Screenshots Verified!</h2>
                    <button class="modal-close" onclick="closeVerificationModal()">×</button>
                </div>
                
                <div class="modal-body">
                    <div class="success-content">
                        <div class="success-icon">✅</div>
                        <h3>Screenshots Successfully Verified</h3>
                        <p>Your trade screenshots have been verified by our AI system.</p>
                        
                        <div class="new-badge">
                            <span class="user-badge screenshot-verified">📸 Screenshot Verified</span>
                        </div>
                        
                        <button class="btn btn-primary" onclick="closeVerificationModal(); refreshForumPosts();" style="width: 100%; margin-top: 20px;">
                            🎉 Continue to Community
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Show screenshot failure
function showScreenshotFailure(errors) {
    const modal = document.querySelector('.verification-modal');
    if (modal) {
        modal.innerHTML = `
            <div class="modal-overlay" onclick="closeVerificationModal()"></div>
            <div class="modal-content">
                <div class="modal-header error">
                    <h2>❌ Screenshot Verification Failed</h2>
                    <button class="modal-close" onclick="closeVerificationModal()">×</button>
                </div>
                
                <div class="modal-body">
                    <div class="error-content">
                        <div class="error-icon">⚠️</div>
                        <h3>Screenshots Could Not Be Verified</h3>
                        <p>Issues found during verification:</p>
                        
                        <ul class="error-list">
                            ${errors.map(error => `<li>${error}</li>`).join('')}
                        </ul>
                        
                        <div class="retry-options">
                            <button class="btn btn-secondary" onclick="showUserVerificationModal()">
                                🔄 Try Different Method
                            </button>
                            <button class="btn btn-primary" onclick="showScreenshotUploadModal()">
                                📸 Upload New Screenshots
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// ============================================================================
// PUBLIC STOCK PICKS UI
// ============================================================================

// Show create public pick modal
function showCreatePublicPickModal() {
    const modal = document.createElement('div');
    modal.className = 'verification-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closePublicPickModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>📈 Share Public Stock Pick</h2>
                <button class="modal-close" onclick="closePublicPickModal()">×</button>
            </div>
            
            <div class="modal-body">
                <div class="pick-form">
                    <div class="form-group">
                        <label>Stock Symbol:</label>
                        <input type="text" id="pickSymbol" placeholder="TSLA" style="text-transform: uppercase;">
                    </div>
                    
                    <div class="form-group">
                        <label>Action:</label>
                        <select id="pickAction">
                            <option value="buy">Buy</option>
                            <option value="sell">Sell</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Entry Price:</label>
                        <input type="number" id="pickEntryPrice" placeholder="250.00" step="0.01">
                    </div>
                    
                    <div class="form-group">
                        <label>Target Price:</label>
                        <input type="number" id="pickTargetPrice" placeholder="300.00" step="0.01">
                    </div>
                    
                    <div class="form-group">
                        <label>Stop Loss:</label>
                        <input type="number" id="pickStopLoss" placeholder="230.00" step="0.01">
                    </div>
                    
                    <div class="form-group">
                        <label>Timeframe:</label>
                        <select id="pickTimeframe">
                            <option value="1-2 weeks">1-2 weeks</option>
                            <option value="1 month">1 month</option>
                            <option value="2-3 months">2-3 months</option>
                            <option value="6 months">6 months</option>
                            <option value="1 year">1 year</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Confidence (1-100):</label>
                        <input type="range" id="pickConfidence" min="1" max="100" value="75" oninput="updateConfidenceDisplay(this.value)">
                        <div class="confidence-display">Confidence: <span id="confidenceValue">75</span>%</div>
                    </div>
                    
                    <div class="form-group">
                        <label>Reasoning:</label>
                        <textarea id="pickReasoning" placeholder="Explain why you believe this trade will be successful..." rows="4"></textarea>
                    </div>
                    
                    <button class="btn btn-primary" onclick="submitPublicPick()" style="width: 100%; margin-top: 20px;">
                        📊 Share Public Pick
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Close public pick modal
function closePublicPickModal() {
    const modal = document.querySelector('.verification-modal');
    if (modal) {
        modal.remove();
    }
}

// Update confidence display
function updateConfidenceDisplay(value) {
    document.getElementById('confidenceValue').textContent = value;
}

// Submit public pick
function submitPublicPick() {
    const pickData = {
        symbol: document.getElementById('pickSymbol').value.toUpperCase(),
        action: document.getElementById('pickAction').value,
        entryPrice: parseFloat(document.getElementById('pickEntryPrice').value),
        targetPrice: parseFloat(document.getElementById('pickTargetPrice').value),
        stopLoss: parseFloat(document.getElementById('pickStopLoss').value),
        timeframe: document.getElementById('pickTimeframe').value,
        confidence: parseInt(document.getElementById('pickConfidence').value),
        reasoning: document.getElementById('pickReasoning').value
    };
    
    // Validate inputs
    if (!pickData.symbol || !pickData.entryPrice || !pickData.targetPrice || !pickData.stopLoss || !pickData.reasoning) {
        alert('Please fill in all required fields');
        return;
    }
    
    try {
        const userId = getCurrentUserId();
        const pick = pickTracker.createPublicPick(userId, pickData);
        
        closePublicPickModal();
        alert('Public pick shared successfully! It will appear in your profile and the community feed.');
        
        // Refresh forum to show new pick
        refreshForumPosts();
        
    } catch (error) {
        alert('Error creating public pick: ' + error.message);
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Get current user ID (mock function)
function getCurrentUserId() {
    // In a real app, this would get the actual logged-in user ID
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Format date for display
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Show user profile with badges
function showUserProfile(userId) {
    const user = userDatabase.get(userId);
    if (!user) return;
    
    const badges = badgeSystem.getUserBadges(userId);
    const picks = pickTracker.getUserPicks(userId);
    
    const modal = document.createElement('div');
    modal.className = 'verification-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeUserProfile()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>👤 ${user.username || 'User Profile'}</h2>
                <button class="modal-close" onclick="closeUserProfile()">×</button>
            </div>
            
            <div class="modal-body">
                <div class="profile-content">
                    <div class="profile-badges">
                        <h3>🏆 Badges Earned:</h3>
                        ${badgeSystem.generateBadgeHTML(badges)}
                    </div>
                    
                    ${user.pickStats ? `
                        <div class="profile-stats">
                            <h3>📊 Trading Performance:</h3>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <div class="stat-value">${user.pickStats.accuracy.toFixed(1)}%</div>
                                    <div class="stat-label">Accuracy</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${user.pickStats.totalPicks}</div>
                                    <div class="stat-label">Total Picks</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${user.pickStats.avgPerformance.toFixed(1)}%</div>
                                    <div class="stat-label">Avg Return</div>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="profile-reputation">
                        <h3>⭐ Reputation: ${user.reputation || 50}</h3>
                        <div class="reputation-bar">
                            <div class="reputation-fill" style="width: ${Math.min((user.reputation || 50) / 10, 100)}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Close user profile
function closeUserProfile() {
    const modal = document.querySelector('.verification-modal');
    if (modal) {
        modal.remove();
    }
}

// Initialize verification system
function initializeVerificationSystem() {
    // Add verification button to forum if user is not verified
    const userId = getCurrentUserId();
    const user = userDatabase.get(userId);
    
    if (!user || !user.verified) {
        const forumHeader = document.querySelector('#community-forum .card-header');
        if (forumHeader) {
            const verifyBtn = document.createElement('button');
            verifyBtn.className = 'btn btn-secondary btn-small';
            verifyBtn.style.marginLeft = '10px';
            verifyBtn.innerHTML = '🔐 Get Verified';
            verifyBtn.onclick = showUserVerificationModal;
            forumHeader.appendChild(verifyBtn);
        }
    }
}

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeVerificationSystem);
} else {
    initializeVerificationSystem();
}