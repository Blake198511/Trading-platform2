// Community Forum Integration
// Task 8: Implement community forum system
// Integrates all forum functionality including data models, UI, content moderation, and user verification

// ============================================================================
// GLOBAL FORUM STATE
// ============================================================================

let currentForumFilter = 'all';
let currentUser = null;
let forumPosts = [];
let forumUsers = new Map();

// Initialize current user (simulate logged in user)
function getCurrentUserId() {
    if (!currentUser) {
        currentUser = 'user_' + Math.random().toString(36).substr(2, 9);
        // Create default user if not exists
        if (!userDatabase.has(currentUser)) {
            contentModerator.createDefaultUser(currentUser);
        }
    }
    return currentUser;
}

// ============================================================================
// FORUM POST DATA MODELS
// ============================================================================

class ForumPost {
    constructor(data) {
        this.id = data.id || this.generateId();
        this.userId = data.userId;
        this.username = data.username || 'Anonymous';
        this.title = data.title;
        this.content = data.content;
        this.category = data.category || 'general';
        this.symbols = data.symbols || [];
        this.upvotes = data.upvotes || 0;
        this.downvotes = data.downvotes || 0;
        this.replies = data.replies || [];
        this.createdAt = data.createdAt || Date.now();
        this.moderationStatus = data.moderationStatus || 'pending';
        this.tags = data.tags || [];
        this.verified = data.verified || false;
    }

    generateId() {
        return 'post_' + Math.random().toString(36).substr(2, 9);
    }

    getScore() {
        return this.upvotes - this.downvotes;
    }

    addReply(reply) {
        this.replies.push(reply);
    }

    upvote(userId) {
        if (!this.hasUserVoted(userId)) {
            this.upvotes++;
            this.recordVote(userId, 'upvote');
        }
    }

    downvote(userId) {
        if (!this.hasUserVoted(userId)) {
            this.downvotes++;
            this.recordVote(userId, 'downvote');
        }
    }

    hasUserVoted(userId) {
        // In a real implementation, this would check a votes database
        return false; // Simplified for demo
    }

    recordVote(userId, voteType) {
        // In a real implementation, this would record the vote in a database
        console.log(`User ${userId} ${voteType}d post ${this.id}`);
    }
}

class ForumReply {
    constructor(data) {
        this.id = data.id || this.generateId();
        this.postId = data.postId;
        this.userId = data.userId;
        this.username = data.username || 'Anonymous';
        this.content = data.content;
        this.createdAt = data.createdAt || Date.now();
        this.upvotes = data.upvotes || 0;
        this.downvotes = data.downvotes || 0;
        this.moderationStatus = data.moderationStatus || 'pending';
    }

    generateId() {
        return 'reply_' + Math.random().toString(36).substr(2, 9);
    }
}

// ============================================================================
// FORUM FUNCTIONS
// ============================================================================

// Filter forum posts by category
function filterForum(category) {
    currentForumFilter = category;
    
    // Update active filter chip
    document.querySelectorAll('#community-forum .filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Refresh posts with filter
    refreshForumPosts();
}

// Main function to refresh forum posts
async function refreshForumPosts() {
    const resultsDiv = document.getElementById('forumResults');
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Loading community posts...</div>';
    
    try {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate mock forum posts
        const mockPosts = generateMockForumPosts();
        
        // Filter posts based on current filter
        let filteredPosts = mockPosts;
        if (currentForumFilter !== 'all') {
            if (currentForumFilter === 'verified-only') {
                filteredPosts = mockPosts.filter(post => post.verified);
            } else {
                filteredPosts = mockPosts.filter(post => post.category === currentForumFilter);
            }
        }
        
        // Sort by score (upvotes - downvotes) and recency
        filteredPosts.sort((a, b) => {
            const scoreA = a.upvotes - a.downvotes;
            const scoreB = b.upvotes - b.downvotes;
            if (Math.abs(scoreA - scoreB) > 5) {
                return scoreB - scoreA; // Sort by score first
            }
            return b.createdAt - a.createdAt; // Then by recency
        });
        
        // Generate HTML
        let html = '';
        if (filteredPosts.length === 0) {
            html = `
                <div class="card">
                    <div style="text-align: center; padding: 40px; color: var(--text-gray);">
                        <div style="font-size: 2rem; margin-bottom: 15px;">💬</div>
                        <h3>No posts found</h3>
                        <p>Be the first to start a discussion in this category!</p>
                        <button class="btn btn-primary" onclick="showCreatePost()" style="margin-top: 15px;">
                            ✍️ Create First Post
                        </button>
                    </div>
                </div>
            `;
        } else {
            filteredPosts.forEach(post => {
                html += generatePostHTML(post);
            });
        }
        
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        resultsDiv.innerHTML = `
            <div class="card">
                <div style="text-align: center; padding: 40px; color: var(--danger);">
                    <h3>Error Loading Posts</h3>
                    <p>${error.message}</p>
                    <button class="btn btn-secondary" onclick="refreshForumPosts()">🔄 Try Again</button>
                </div>
            </div>
        `;
    }
}

// Generate mock forum posts for demonstration
function generateMockForumPosts() {
    const categories = ['stocks', 'options', 'crypto', 'forex'];
    const mockPosts = [
        {
            id: 'post_1',
            userId: 'user_verified_1',
            username: 'TradingPro2024',
            title: 'NVDA Earnings Play - My Analysis',
            content: 'After analyzing NVDA\'s fundamentals and recent AI developments, I believe we\'re looking at a strong earnings beat. Here\'s my detailed analysis...',
            category: 'stocks',
            symbols: ['NVDA'],
            upvotes: 47,
            downvotes: 3,
            replies: [
                {
                    id: 'reply_1',
                    userId: 'user_2',
                    username: 'ChipInvestor',
                    content: 'Great analysis! I agree on the AI demand drivers. What\'s your price target?',
                    createdAt: Date.now() - 2 * 60 * 60 * 1000
                }
            ],
            createdAt: Date.now() - 4 * 60 * 60 * 1000,
            moderationStatus: 'approved',
            verified: true,
            tags: ['earnings', 'AI', 'semiconductors']
        },
        {
            id: 'post_2',
            userId: 'user_verified_2',
            username: 'OptionsWizard',
            title: 'SPY Iron Condor Strategy for This Week',
            content: 'Setting up an iron condor on SPY for this week\'s expiration. Here are the strikes I\'m targeting and why...',
            category: 'options',
            symbols: ['SPY'],
            upvotes: 32,
            downvotes: 1,
            replies: [],
            createdAt: Date.now() - 6 * 60 * 60 * 1000,
            moderationStatus: 'approved',
            verified: true,
            tags: ['iron-condor', 'weekly-options', 'SPY']
        },
        {
            id: 'post_3',
            userId: 'user_3',
            username: 'CryptoMiner88',
            title: 'Ethereum Layer 2 Infrastructure Plays',
            content: 'Looking at L2 scaling solutions and their tokens. MATIC, ARB, and OP all showing strong fundamentals...',
            category: 'crypto',
            symbols: ['MATIC', 'ARB', 'OP'],
            upvotes: 28,
            downvotes: 5,
            replies: [
                {
                    id: 'reply_2',
                    userId: 'user_4',
                    username: 'DeFiExplorer',
                    content: 'Don\'t forget about Optimism! The ecosystem is growing rapidly.',
                    createdAt: Date.now() - 1 * 60 * 60 * 1000
                }
            ],
            createdAt: Date.now() - 8 * 60 * 60 * 1000,
            moderationStatus: 'approved',
            verified: false,
            tags: ['layer2', 'ethereum', 'scaling']
        },
        {
            id: 'post_4',
            userId: 'user_verified_3',
            username: 'ForexTrader_Elite',
            title: 'EUR/USD Technical Analysis - Key Levels',
            content: 'EUR/USD is approaching a critical resistance level at 1.0950. Here\'s my technical analysis and trade setup...',
            category: 'forex',
            symbols: ['EURUSD'],
            upvotes: 19,
            downvotes: 2,
            replies: [],
            createdAt: Date.now() - 12 * 60 * 60 * 1000,
            moderationStatus: 'approved',
            verified: true,
            tags: ['technical-analysis', 'EUR/USD', 'resistance']
        },
        {
            id: 'post_5',
            userId: 'user_5',
            username: 'PennyStockHunter',
            title: 'Found a Hidden Gem Under $1',
            content: 'This biotech company just got FDA breakthrough designation but nobody\'s talking about it yet...',
            category: 'stocks',
            symbols: ['XXXX'],
            upvotes: 15,
            downvotes: 8,
            replies: [
                {
                    id: 'reply_3',
                    userId: 'user_verified_1',
                    username: 'TradingPro2024',
                    content: 'Can you share more details about the FDA designation? What\'s the timeline?',
                    createdAt: Date.now() - 30 * 60 * 1000
                }
            ],
            createdAt: Date.now() - 18 * 60 * 60 * 1000,
            moderationStatus: 'approved',
            verified: false,
            tags: ['penny-stocks', 'biotech', 'FDA']
        },
        {
            id: 'post_6',
            userId: 'user_verified_4',
            username: 'QuantTrader',
            title: 'My Algorithmic Trading Results - 6 Month Update',
            content: 'Sharing my algo trading performance for the past 6 months. 73% win rate with 2.1 profit factor...',
            category: 'stocks',
            symbols: [],
            upvotes: 89,
            downvotes: 4,
            replies: [
                {
                    id: 'reply_4',
                    userId: 'user_6',
                    username: 'AlgoNewbie',
                    content: 'Impressive results! What programming language do you use for your algorithms?',
                    createdAt: Date.now() - 45 * 60 * 1000
                },
                {
                    id: 'reply_5',
                    userId: 'user_7',
                    username: 'DataScientist',
                    content: 'Would love to see more details on your backtesting methodology.',
                    createdAt: Date.now() - 20 * 60 * 1000
                }
            ],
            createdAt: Date.now() - 24 * 60 * 60 * 1000,
            moderationStatus: 'approved',
            verified: true,
            tags: ['algorithmic-trading', 'performance', 'quantitative']
        }
    ];
    
    return mockPosts.map(postData => new ForumPost(postData));
}

// Generate HTML for a forum post
function generatePostHTML(post) {
    const timeAgo = getTimeAgo(post.createdAt);
    const score = post.upvotes - post.downvotes;
    const scoreClass = score > 0 ? 'profit-positive' : score < 0 ? 'profit-negative' : '';
    
    // Get user badges
    const user = userDatabase.get(post.userId);
    const badges = user?.badges || [];
    const badgeHTML = badgeSystem.generateBadgeHTML(badges);
    
    return `
        <div class="card forum-post" data-post-id="${post.id}">
            <div class="forum-post-header">
                <div class="post-author">
                    <div class="author-info">
                        <span class="author-name">${post.username}</span>
                        ${post.verified ? '<span class="verified-badge">✅</span>' : ''}
                        <span class="post-time">${timeAgo}</span>
                    </div>
                    <div class="author-badges">
                        ${badgeHTML}
                    </div>
                </div>
                <div class="post-category">
                    <span class="category-tag ${post.category}">${getCategoryIcon(post.category)} ${post.category.toUpperCase()}</span>
                </div>
            </div>
            
            <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <div class="post-text">${post.content}</div>
                
                ${post.symbols.length > 0 ? `
                    <div class="post-symbols">
                        ${post.symbols.map(symbol => `<span class="symbol-tag">${symbol}</span>`).join('')}
                    </div>
                ` : ''}
                
                ${post.tags.length > 0 ? `
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="post-actions">
                <div class="voting">
                    <button class="vote-btn upvote" onclick="votePost('${post.id}', 'upvote')">
                        ▲ ${post.upvotes}
                    </button>
                    <span class="score ${scoreClass}">${score > 0 ? '+' : ''}${score}</span>
                    <button class="vote-btn downvote" onclick="votePost('${post.id}', 'downvote')">
                        ▼ ${post.downvotes}
                    </button>
                </div>
                
                <div class="post-stats">
                    <span class="reply-count">💬 ${post.replies.length} replies</span>
                    <button class="btn btn-small" onclick="showReplies('${post.id}')">View Discussion</button>
                    <button class="btn btn-small" onclick="replyToPost('${post.id}')">Reply</button>
                    <button class="btn btn-small" onclick="flagPost('${post.id}')">🚩 Flag</button>
                </div>
            </div>
            
            <div id="replies-${post.id}" class="post-replies" style="display: none;">
                ${post.replies.map(reply => generateReplyHTML(reply)).join('')}
            </div>
        </div>
    `;
}

// Generate HTML for a reply
function generateReplyHTML(reply) {
    const timeAgo = getTimeAgo(reply.createdAt);
    
    return `
        <div class="forum-reply" data-reply-id="${reply.id}">
            <div class="reply-header">
                <span class="reply-author">${reply.username}</span>
                <span class="reply-time">${timeAgo}</span>
            </div>
            <div class="reply-content">${reply.content}</div>
            <div class="reply-actions">
                <button class="vote-btn upvote" onclick="voteReply('${reply.id}', 'upvote')">
                    ▲ ${reply.upvotes}
                </button>
                <button class="vote-btn downvote" onclick="voteReply('${reply.id}', 'downvote')">
                    ▼ ${reply.downvotes}
                </button>
                <button class="btn btn-small" onclick="flagReply('${reply.id}')">🚩 Flag</button>
            </div>
        </div>
    `;
}

// Show create post modal/form
function showCreatePost() {
    // Check if user is verified for posting
    const userId = getCurrentUserId();
    const userCheck = contentModerator.checkUserStatus(userId);
    
    if (!userCheck.canPost) {
        if (userCheck.requiresVerification) {
            showUserVerificationModal();
            return;
        } else {
            alert(userCheck.reason);
            return;
        }
    }
    
    const modal = document.createElement('div');
    modal.className = 'forum-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeCreatePostModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>✍️ Create New Post</h2>
                <button class="modal-close" onclick="closeCreatePostModal()">×</button>
            </div>
            
            <div class="modal-body">
                <div class="create-post-form">
                    <div class="form-group">
                        <label>Category:</label>
                        <select id="postCategory">
                            <option value="stocks">📈 Stocks</option>
                            <option value="options">📊 Options</option>
                            <option value="crypto">⛓️ Crypto</option>
                            <option value="forex">💱 Forex</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Title:</label>
                        <input type="text" id="postTitle" placeholder="What's your trading idea?" maxlength="100">
                    </div>
                    
                    <div class="form-group">
                        <label>Symbols (optional):</label>
                        <input type="text" id="postSymbols" placeholder="TSLA, NVDA, BTC (comma separated)" style="text-transform: uppercase;">
                    </div>
                    
                    <div class="form-group">
                        <label>Content:</label>
                        <textarea id="postContent" placeholder="Share your analysis, strategy, or trading idea..." rows="6" maxlength="2000"></textarea>
                        <div class="char-count">
                            <span id="charCount">0</span>/2000 characters
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Tags (optional):</label>
                        <input type="text" id="postTags" placeholder="earnings, technical-analysis, swing-trade (comma separated)">
                    </div>
                    
                    <div class="posting-guidelines">
                        <h4>📋 Posting Guidelines:</h4>
                        <ul>
                            <li>Share analysis, not just "buy this stock"</li>
                            <li>No promotional links or pump schemes</li>
                            <li>Be respectful and constructive</li>
                            <li>Include reasoning for your trades</li>
                        </ul>
                    </div>
                    
                    <button class="btn btn-primary" onclick="submitPost()" style="width: 100%; margin-top: 20px;">
                        📤 Post to Community
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add character counter
    document.getElementById('postContent').addEventListener('input', function() {
        const charCount = this.value.length;
        document.getElementById('charCount').textContent = charCount;
        
        if (charCount > 1800) {
            document.getElementById('charCount').style.color = 'var(--danger)';
        } else if (charCount > 1500) {
            document.getElementById('charCount').style.color = 'var(--warning)';
        } else {
            document.getElementById('charCount').style.color = 'var(--text-gray)';
        }
    });
}

// Close create post modal
function closeCreatePostModal() {
    const modal = document.querySelector('.forum-modal');
    if (modal) {
        modal.remove();
    }
}

// Submit new post
async function submitPost() {
    const category = document.getElementById('postCategory').value;
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    const symbolsText = document.getElementById('postSymbols').value.trim();
    const tagsText = document.getElementById('postTags').value.trim();
    
    if (!title || !content) {
        alert('Please fill in title and content');
        return;
    }
    
    if (title.length < 10) {
        alert('Title must be at least 10 characters');
        return;
    }
    
    if (content.length < 50) {
        alert('Content must be at least 50 characters');
        return;
    }
    
    const userId = getCurrentUserId();
    const user = userDatabase.get(userId);
    
    // Parse symbols and tags
    const symbols = symbolsText ? symbolsText.split(',').map(s => s.trim().toUpperCase()).filter(s => s) : [];
    const tags = tagsText ? tagsText.split(',').map(t => t.trim().toLowerCase()).filter(t => t) : [];
    
    // Content moderation
    const moderationResult = contentModerator.moderateContent(title + ' ' + content, userId, 'post');
    
    if (!moderationResult.approved) {
        alert(`Post rejected: ${moderationResult.reasons.join(', ')}`);
        return;
    }
    
    // Create post
    const postData = {
        userId: userId,
        username: user?.username || 'Anonymous',
        title: title,
        content: content,
        category: category,
        symbols: symbols,
        tags: tags,
        verified: user?.verified || false,
        moderationStatus: moderationResult.action === 'approve' ? 'approved' : 'pending'
    };
    
    const post = new ForumPost(postData);
    
    // Add to user's post history
    if (user) {
        if (!user.postHistory) user.postHistory = [];
        user.postHistory.push({
            postId: post.id,
            timestamp: Date.now(),
            upvotes: 0,
            downvotes: 0
        });
    }
    
    closeCreatePostModal();
    
    // Show success message
    showPostSubmissionSuccess(moderationResult.action);
    
    // Refresh forum posts
    refreshForumPosts();
}

// Show post submission success
function showPostSubmissionSuccess(action) {
    const message = action === 'approve' ? 
        'Post published successfully!' : 
        'Post submitted for review. It will appear once approved.';
    
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; 
        background: var(--card-black); border: 2px solid var(--primary-green); 
        border-radius: 10px; padding: 15px; max-width: 300px; z-index: 1000;
        box-shadow: 0 4px 15px rgba(0, 255, 65, 0.3);
    `;
    
    notification.innerHTML = `
        <div style="font-weight: 700; color: var(--primary-green); margin-bottom: 5px;">✅ Success!</div>
        <div style="color: var(--text-white); font-size: 0.9rem;">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 4000);
}

// ============================================================================
// VOTING AND INTERACTION FUNCTIONS
// ============================================================================

// Vote on post
function votePost(postId, voteType) {
    const userId = getCurrentUserId();
    
    // In a real implementation, this would update the database
    console.log(`User ${userId} ${voteType}d post ${postId}`);
    
    // Update UI (simplified)
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (postElement) {
        const voteButton = postElement.querySelector(`.vote-btn.${voteType}`);
        if (voteButton) {
            const currentCount = parseInt(voteButton.textContent.match(/\d+/)[0]);
            voteButton.innerHTML = voteType === 'upvote' ? 
                `▲ ${currentCount + 1}` : 
                `▼ ${currentCount + 1}`;
        }
    }
    
    // Update user reputation
    reputationSystem.calculateReputation(userId);
}

// Vote on reply
function voteReply(replyId, voteType) {
    const userId = getCurrentUserId();
    console.log(`User ${userId} ${voteType}d reply ${replyId}`);
    
    // Update UI (simplified)
    const replyElement = document.querySelector(`[data-reply-id="${replyId}"]`);
    if (replyElement) {
        const voteButton = replyElement.querySelector(`.vote-btn.${voteType}`);
        if (voteButton) {
            const currentCount = parseInt(voteButton.textContent.match(/\d+/)[0]);
            voteButton.innerHTML = voteType === 'upvote' ? 
                `▲ ${currentCount + 1}` : 
                `▼ ${currentCount + 1}`;
        }
    }
}

// Show/hide replies
function showReplies(postId) {
    const repliesDiv = document.getElementById(`replies-${postId}`);
    if (repliesDiv) {
        if (repliesDiv.style.display === 'none') {
            repliesDiv.style.display = 'block';
        } else {
            repliesDiv.style.display = 'none';
        }
    }
}

// Reply to post
function replyToPost(postId) {
    const userId = getCurrentUserId();
    const userCheck = contentModerator.checkUserStatus(userId);
    
    if (!userCheck.canPost) {
        alert(userCheck.reason);
        return;
    }
    
    const replyContent = prompt('Enter your reply:');
    if (replyContent && replyContent.trim()) {
        // Content moderation
        const moderationResult = contentModerator.moderateContent(replyContent, userId, 'reply');
        
        if (!moderationResult.approved) {
            alert(`Reply rejected: ${moderationResult.reasons.join(', ')}`);
            return;
        }
        
        // Add reply (simplified)
        console.log(`User ${userId} replied to post ${postId}: ${replyContent}`);
        alert('Reply submitted successfully!');
        
        // In a real implementation, this would add the reply to the database and refresh the UI
    }
}

// Flag post
function flagPost(postId) {
    const userId = getCurrentUserId();
    const reason = prompt('Why are you flagging this post?\n\nOptions:\n- Spam\n- Scam\n- Inappropriate\n- Misinformation\n- Other');
    
    if (reason) {
        flaggingSystem.flagContent(postId, userId, 'inappropriate', reason);
        alert('Post flagged for review. Thank you for helping keep our community safe.');
    }
}

// Flag reply
function flagReply(replyId) {
    const userId = getCurrentUserId();
    const reason = prompt('Why are you flagging this reply?');
    
    if (reason) {
        flaggingSystem.flagContent(replyId, userId, 'inappropriate', reason);
        alert('Reply flagged for review. Thank you for helping keep our community safe.');
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Get time ago string
function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
}

// Get category icon
function getCategoryIcon(category) {
    const icons = {
        stocks: '📈',
        options: '📊',
        crypto: '⛓️',
        forex: '💱',
        general: '💬'
    };
    return icons[category] || '💬';
}

// Convert file to base64 (for screenshot uploads)
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// ============================================================================
// INITIALIZE FORUM SYSTEM
// ============================================================================

// Initialize forum when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add forum-specific CSS if not already present
    if (!document.getElementById('forum-styles')) {
        const forumStyles = document.createElement('style');
        forumStyles.id = 'forum-styles';
        forumStyles.textContent = `
            /* Forum-specific styles */
            .forum-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
            }
            
            .modal-content {
                background: var(--card-black);
                border: 2px solid var(--border-color);
                border-radius: 15px;
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                z-index: 1;
            }
            
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-close {
                background: none;
                border: none;
                color: var(--text-gray);
                font-size: 1.5rem;
                cursor: pointer;
                padding: 5px;
            }
            
            .modal-body {
                padding: 20px;
            }
            
            .forum-post {
                margin-bottom: 20px;
            }
            
            .forum-post-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 15px;
            }
            
            .author-info {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .author-name {
                font-weight: 700;
                color: var(--primary-yellow);
            }
            
            .verified-badge {
                color: var(--primary-green);
            }
            
            .post-time {
                color: var(--text-gray);
                font-size: 0.9rem;
            }
            
            .category-tag {
                padding: 5px 12px;
                border-radius: 15px;
                font-size: 0.8rem;
                font-weight: 600;
            }
            
            .category-tag.stocks {
                background: rgba(0, 255, 65, 0.2);
                color: var(--primary-green);
                border: 1px solid var(--primary-green);
            }
            
            .category-tag.options {
                background: rgba(255, 215, 0, 0.2);
                color: var(--primary-yellow);
                border: 1px solid var(--primary-yellow);
            }
            
            .category-tag.crypto {
                background: rgba(255, 107, 53, 0.2);
                color: #FF6B35;
                border: 1px solid #FF6B35;
            }
            
            .category-tag.forex {
                background: rgba(155, 89, 182, 0.2);
                color: #9B59B6;
                border: 1px solid #9B59B6;
            }
            
            .post-title {
                font-size: 1.2rem;
                font-weight: 700;
                color: var(--text-white);
                margin-bottom: 10px;
            }
            
            .post-text {
                color: var(--text-gray);
                line-height: 1.6;
                margin-bottom: 15px;
            }
            
            .post-symbols {
                margin: 10px 0;
            }
            
            .symbol-tag {
                display: inline-block;
                padding: 3px 8px;
                background: rgba(255, 215, 0, 0.2);
                border: 1px solid var(--primary-yellow);
                border-radius: 10px;
                font-size: 0.8rem;
                font-weight: 600;
                margin-right: 5px;
                color: var(--primary-yellow);
            }
            
            .post-tags {
                margin: 10px 0;
            }
            
            .tag {
                display: inline-block;
                padding: 2px 6px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                font-size: 0.75rem;
                margin-right: 5px;
                color: var(--text-gray);
            }
            
            .post-actions {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 15px;
                border-top: 1px solid var(--border-color);
            }
            
            .voting {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .vote-btn {
                background: none;
                border: 1px solid var(--border-color);
                color: var(--text-gray);
                padding: 5px 10px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.3s ease;
            }
            
            .vote-btn:hover {
                border-color: var(--primary-yellow);
                color: var(--primary-yellow);
            }
            
            .vote-btn.upvote:hover {
                border-color: var(--primary-green);
                color: var(--primary-green);
            }
            
            .vote-btn.downvote:hover {
                border-color: var(--danger);
                color: var(--danger);
            }
            
            .score {
                font-weight: 700;
                min-width: 30px;
                text-align: center;
            }
            
            .post-stats {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .reply-count {
                color: var(--text-gray);
                font-size: 0.9rem;
            }
            
            .post-replies {
                margin-top: 15px;
                padding-left: 20px;
                border-left: 2px solid var(--border-color);
            }
            
            .forum-reply {
                background: var(--bg-black);
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 10px;
            }
            
            .reply-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .reply-author {
                font-weight: 600;
                color: var(--primary-yellow);
            }
            
            .reply-time {
                color: var(--text-gray);
                font-size: 0.8rem;
            }
            
            .reply-content {
                color: var(--text-gray);
                line-height: 1.5;
                margin-bottom: 10px;
            }
            
            .reply-actions {
                display: flex;
                gap: 10px;
            }
            
            .char-count {
                text-align: right;
                font-size: 0.8rem;
                color: var(--text-gray);
                margin-top: 5px;
            }
            
            .posting-guidelines {
                background: rgba(255, 215, 0, 0.1);
                border: 1px solid var(--primary-yellow);
                border-radius: 8px;
                padding: 15px;
                margin: 15px 0;
            }
            
            .posting-guidelines h4 {
                color: var(--primary-yellow);
                margin-bottom: 10px;
            }
            
            .posting-guidelines ul {
                margin-left: 20px;
                color: var(--text-gray);
            }
            
            .posting-guidelines li {
                margin-bottom: 5px;
            }
            
            .user-badge {
                display: inline-block;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 0.7rem;
                font-weight: 600;
                margin-right: 5px;
            }
            
            .no-badges {
                color: var(--text-gray);
                font-size: 0.8rem;
                font-style: italic;
            }
        `;
        document.head.appendChild(forumStyles);
    }
    
    console.log('Community Forum Integration loaded');
});

// Export functions for global use
window.filterForum = filterForum;
window.refreshForumPosts = refreshForumPosts;
window.showCreatePost = showCreatePost;
window.closeCreatePostModal = closeCreatePostModal;
window.submitPost = submitPost;
window.votePost = votePost;
window.voteReply = voteReply;
window.showReplies = showReplies;
window.replyToPost = replyToPost;
window.flagPost = flagPost;
window.flagReply = flagReply;