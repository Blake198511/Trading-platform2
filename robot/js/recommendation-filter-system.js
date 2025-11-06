/**
 * Recommendation Filter and Search System
 * Provides filtering by market cap, sector, risk level, and search functionality
 * Supports real-time updates and saved preferences
 */

class RecommendationFilterSystem {
    constructor() {
        this.filters = {
            marketCap: 'all',
            sector: 'all',
            riskLevel: 'all',
            assetType: 'all',
            searchQuery: ''
        };
        
        this.allRecommendations = [];
        this.filteredRecommendations = [];
        this.currentSection = null;
        
        // Load saved preferences
        this.loadFilterPreferences();
    }

    /**
     * Initialize the filter system for a specific section
     */
    initialize(section, recommendations) {
        this.currentSection = section;
        this.allRecommendations = recommendations;
        this.applyFilters();
    }

    /**
     * Set filter value and apply filters
     */
    setFilter(filterType, value) {
        if (this.filters.hasOwnProperty(filterType)) {
            this.filters[filterType] = value;
            this.applyFilters();
            this.saveFilterPreferences();
            return true;
        }
        return false;
    }

    /**
     * Set search query and apply filters
     */
    setSearchQuery(query) {
        this.filters.searchQuery = query.toLowerCase().trim();
        this.applyFilters();
    }

    /**
     * Apply all active filters to recommendations
     */
    applyFilters() {
        let filtered = [...this.allRecommendations];

        // Apply market cap filter
        if (this.filters.marketCap !== 'all') {
            filtered = filtered.filter(rec => this.matchesMarketCap(rec, this.filters.marketCap));
        }

        // Apply sector filter
        if (this.filters.sector !== 'all') {
            filtered = filtered.filter(rec => this.matchesSector(rec, this.filters.sector));
        }

        // Apply risk level filter
        if (this.filters.riskLevel !== 'all') {
            filtered = filtered.filter(rec => rec.riskLevel === this.filters.riskLevel);
        }

        // Apply asset type filter
        if (this.filters.assetType !== 'all') {
            filtered = filtered.filter(rec => rec.assetType.toLowerCase() === this.filters.assetType.toLowerCase());
        }

        // Apply search query
        if (this.filters.searchQuery) {
            filtered = filtered.filter(rec => this.matchesSearch(rec, this.filters.searchQuery));
        }

        this.filteredRecommendations = filtered;
        return filtered;
    }

    /**
     * Check if recommendation matches market cap filter
     */
    matchesMarketCap(recommendation, marketCapFilter) {
        const marketCap = recommendation.marketCap || 0;
        
        switch (marketCapFilter) {
            case 'small':
                return marketCap < 2000000000; // < $2B
            case 'mid':
                return marketCap >= 2000000000 && marketCap < 10000000000; // $2B - $10B
            case 'large':
                return marketCap >= 10000000000; // >= $10B
            default:
                return true;
        }
    }

    /**
     * Check if recommendation matches sector filter
     */
    matchesSector(recommendation, sectorFilter) {
        const sector = (recommendation.sector || '').toLowerCase();
        const category = (recommendation.category || '').toLowerCase();
        
        return sector === sectorFilter.toLowerCase() || 
               category === sectorFilter.toLowerCase() ||
               sector.includes(sectorFilter.toLowerCase());
    }

    /**
     * Check if recommendation matches search query
     */
    matchesSearch(recommendation, query) {
        const searchableFields = [
            recommendation.symbol,
            recommendation.companyName,
            recommendation.description,
            recommendation.catalyst,
            recommendation.sector,
            recommendation.category,
            ...(recommendation.reasoning || [])
        ];

        return searchableFields.some(field => 
            field && field.toString().toLowerCase().includes(query)
        );
    }

    /**
     * Get filtered recommendations
     */
    getFilteredRecommendations() {
        return this.filteredRecommendations;
    }

    /**
     * Get current filter state
     */
    getFilters() {
        return { ...this.filters };
    }

    /**
     * Reset all filters to default
     */
    resetFilters() {
        this.filters = {
            marketCap: 'all',
            sector: 'all',
            riskLevel: 'all',
            assetType: 'all',
            searchQuery: ''
        };
        this.applyFilters();
        this.saveFilterPreferences();
    }

    /**
     * Save filter preferences to localStorage
     */
    saveFilterPreferences() {
        try {
            const preferences = {
                marketCap: this.filters.marketCap,
                sector: this.filters.sector,
                riskLevel: this.filters.riskLevel,
                assetType: this.filters.assetType
                // Don't save search query
            };
            localStorage.setItem('recommendationFilterPreferences', JSON.stringify(preferences));
        } catch (error) {
            console.error('Failed to save filter preferences:', error);
        }
    }

    /**
     * Load filter preferences from localStorage
     */
    loadFilterPreferences() {
        try {
            const saved = localStorage.getItem('recommendationFilterPreferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                this.filters = {
                    ...this.filters,
                    ...preferences,
                    searchQuery: '' // Always start with empty search
                };
            }
        } catch (error) {
            console.error('Failed to load filter preferences:', error);
        }
    }

    /**
     * Get filter statistics
     */
    getFilterStats() {
        return {
            total: this.allRecommendations.length,
            filtered: this.filteredRecommendations.length,
            hidden: this.allRecommendations.length - this.filteredRecommendations.length
        };
    }
}

/**
 * Filter UI Component Generator
 * Creates the HTML for filter controls
 */
class FilterUIGenerator {
    /**
     * Generate complete filter UI for a section
     */
    static generateFilterUI(sectionId, options = {}) {
        const {
            showMarketCap = true,
            showSector = true,
            showRiskLevel = true,
            showAssetType = false,
            showSearch = true,
            sectors = []
        } = options;

        return `
            <div class="filter-container" id="${sectionId}-filters">
                ${showSearch ? this.generateSearchBar(sectionId) : ''}
                
                <div class="filter-controls">
                    ${showMarketCap ? this.generateMarketCapFilter(sectionId) : ''}
                    ${showSector ? this.generateSectorFilter(sectionId, sectors) : ''}
                    ${showRiskLevel ? this.generateRiskLevelFilter(sectionId) : ''}
                    ${showAssetType ? this.generateAssetTypeFilter(sectionId) : ''}
                    
                    <div class="filter-actions">
                        <button class="filter-reset-btn" onclick="FilterManager.resetFilters('${sectionId}')">
                            🔄 Reset Filters
                        </button>
                    </div>
                </div>
                
                <div class="filter-stats" id="${sectionId}-filter-stats">
                    <span class="filter-stats-text">Showing all recommendations</span>
                </div>
            </div>
        `;
    }

    /**
     * Generate search bar
     */
    static generateSearchBar(sectionId) {
        return `
            <div class="filter-search-bar">
                <input 
                    type="text" 
                    id="${sectionId}-search" 
                    class="filter-search-input" 
                    placeholder="🔍 Search by symbol, company, sector, or catalyst..."
                    oninput="FilterManager.handleSearch('${sectionId}', this.value)"
                />
                <button class="filter-search-clear" onclick="FilterManager.clearSearch('${sectionId}')" style="display: none;">
                    ✕
                </button>
            </div>
        `;
    }

    /**
     * Generate market cap filter
     */
    static generateMarketCapFilter(sectionId) {
        return `
            <div class="filter-group">
                <div class="filter-group-label">Market Cap</div>
                <div class="filter-chips">
                    <div class="filter-chip active" data-filter="marketCap" data-value="all" onclick="FilterManager.handleFilterClick('${sectionId}', 'marketCap', 'all', event)">
                        All Caps
                    </div>
                    <div class="filter-chip" data-filter="marketCap" data-value="small" onclick="FilterManager.handleFilterClick('${sectionId}', 'marketCap', 'small', event)">
                        Small Cap (&lt;$2B)
                    </div>
                    <div class="filter-chip" data-filter="marketCap" data-value="mid" onclick="FilterManager.handleFilterClick('${sectionId}', 'marketCap', 'mid', event)">
                        Mid Cap ($2B-$10B)
                    </div>
                    <div class="filter-chip" data-filter="marketCap" data-value="large" onclick="FilterManager.handleFilterClick('${sectionId}', 'marketCap', 'large', event)">
                        Large Cap (&gt;$10B)
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate sector filter
     */
    static generateSectorFilter(sectionId, sectors = []) {
        const defaultSectors = sectors.length > 0 ? sectors : [
            { value: 'technology', label: 'Technology' },
            { value: 'healthcare', label: 'Healthcare' },
            { value: 'finance', label: 'Finance' },
            { value: 'energy', label: 'Energy' },
            { value: 'consumer', label: 'Consumer' },
            { value: 'industrial', label: 'Industrial' }
        ];

        return `
            <div class="filter-group">
                <div class="filter-group-label">Sector</div>
                <div class="filter-chips">
                    <div class="filter-chip active" data-filter="sector" data-value="all" onclick="FilterManager.handleFilterClick('${sectionId}', 'sector', 'all', event)">
                        All Sectors
                    </div>
                    ${defaultSectors.map(sector => `
                        <div class="filter-chip" data-filter="sector" data-value="${sector.value}" onclick="FilterManager.handleFilterClick('${sectionId}', 'sector', '${sector.value}', event)">
                            ${sector.label}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Generate risk level filter
     */
    static generateRiskLevelFilter(sectionId) {
        return `
            <div class="filter-group">
                <div class="filter-group-label">Risk Level</div>
                <div class="filter-chips">
                    <div class="filter-chip active" data-filter="riskLevel" data-value="all" onclick="FilterManager.handleFilterClick('${sectionId}', 'riskLevel', 'all', event)">
                        All Risk Levels
                    </div>
                    <div class="filter-chip" data-filter="riskLevel" data-value="Low" onclick="FilterManager.handleFilterClick('${sectionId}', 'riskLevel', 'Low', event)">
                        🟢 Low Risk
                    </div>
                    <div class="filter-chip" data-filter="riskLevel" data-value="Medium" onclick="FilterManager.handleFilterClick('${sectionId}', 'riskLevel', 'Medium', event)">
                        🟡 Medium Risk
                    </div>
                    <div class="filter-chip" data-filter="riskLevel" data-value="High" onclick="FilterManager.handleFilterClick('${sectionId}', 'riskLevel', 'High', event)">
                        🔴 High Risk
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate asset type filter
     */
    static generateAssetTypeFilter(sectionId) {
        return `
            <div class="filter-group">
                <div class="filter-group-label">Asset Type</div>
                <div class="filter-chips">
                    <div class="filter-chip active" data-filter="assetType" data-value="all" onclick="FilterManager.handleFilterClick('${sectionId}', 'assetType', 'all', event)">
                        All Assets
                    </div>
                    <div class="filter-chip" data-filter="assetType" data-value="stock" onclick="FilterManager.handleFilterClick('${sectionId}', 'assetType', 'stock', event)">
                        📈 Stocks
                    </div>
                    <div class="filter-chip" data-filter="assetType" data-value="option" onclick="FilterManager.handleFilterClick('${sectionId}', 'assetType', 'option', event)">
                        📊 Options
                    </div>
                    <div class="filter-chip" data-filter="assetType" data-value="crypto" onclick="FilterManager.handleFilterClick('${sectionId}', 'assetType', 'crypto', event)">
                        ⛓️ Crypto
                    </div>
                    <div class="filter-chip" data-filter="assetType" data-value="forex" onclick="FilterManager.handleFilterClick('${sectionId}', 'assetType', 'forex', event)">
                        💱 Forex
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Global Filter Manager
 * Manages filter instances for all sections
 */
class FilterManager {
    static instances = {};

    /**
     * Create or get filter instance for a section
     */
    static getInstance(sectionId) {
        if (!this.instances[sectionId]) {
            this.instances[sectionId] = new RecommendationFilterSystem();
        }
        return this.instances[sectionId];
    }

    /**
     * Initialize filters for a section
     */
    static initializeSection(sectionId, recommendations, options = {}) {
        const filterSystem = this.getInstance(sectionId);
        filterSystem.initialize(sectionId, recommendations);
        
        // Generate and inject filter UI if container exists
        const container = document.getElementById(`${sectionId}-filter-container`);
        if (container) {
            container.innerHTML = FilterUIGenerator.generateFilterUI(sectionId, options);
        }
        
        // Apply filters and render
        this.applyAndRender(sectionId);
    }

    /**
     * Handle filter chip click
     */
    static handleFilterClick(sectionId, filterType, value, event) {
        const filterSystem = this.getInstance(sectionId);
        filterSystem.setFilter(filterType, value);
        
        // Update UI
        this.updateFilterChipUI(event.target, filterType);
        this.applyAndRender(sectionId);
    }

    /**
     * Handle search input
     */
    static handleSearch(sectionId, query) {
        const filterSystem = this.getInstance(sectionId);
        filterSystem.setSearchQuery(query);
        
        // Show/hide clear button
        const searchInput = document.getElementById(`${sectionId}-search`);
        const clearBtn = searchInput?.nextElementSibling;
        if (clearBtn) {
            clearBtn.style.display = query ? 'block' : 'none';
        }
        
        this.applyAndRender(sectionId);
    }

    /**
     * Clear search
     */
    static clearSearch(sectionId) {
        const searchInput = document.getElementById(`${sectionId}-search`);
        if (searchInput) {
            searchInput.value = '';
            this.handleSearch(sectionId, '');
        }
    }

    /**
     * Reset all filters
     */
    static resetFilters(sectionId) {
        const filterSystem = this.getInstance(sectionId);
        filterSystem.resetFilters();
        
        // Reset UI
        this.resetFilterUI(sectionId);
        this.clearSearch(sectionId);
        this.applyAndRender(sectionId);
    }

    /**
     * Apply filters and render results
     */
    static applyAndRender(sectionId) {
        const filterSystem = this.getInstance(sectionId);
        const filtered = filterSystem.getFilteredRecommendations();
        
        // Update stats
        this.updateFilterStats(sectionId);
        
        // Render filtered recommendations
        const resultsContainer = document.getElementById(`${sectionId}Results`) || 
                                document.getElementById(`${sectionId}-results`);
        
        if (resultsContainer && typeof RecommendationCardSystem !== 'undefined') {
            RecommendationCardSystem.renderRecommendations(filtered, resultsContainer.id);
        }
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('filtersApplied', {
            detail: {
                section: sectionId,
                filters: filterSystem.getFilters(),
                results: filtered
            }
        }));
    }

    /**
     * Update filter chip UI
     */
    static updateFilterChipUI(clickedChip, filterType) {
        const container = clickedChip.closest('.filter-chips');
        if (!container) return;
        
        // Remove active class from all chips in this group
        container.querySelectorAll('.filter-chip').forEach(chip => {
            if (chip.dataset.filter === filterType) {
                chip.classList.remove('active');
            }
        });
        
        // Add active class to clicked chip
        clickedChip.classList.add('active');
    }

    /**
     * Reset filter UI
     */
    static resetFilterUI(sectionId) {
        const container = document.getElementById(`${sectionId}-filters`);
        if (!container) return;
        
        // Reset all filter chips to "all" option
        container.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.remove('active');
            if (chip.dataset.value === 'all') {
                chip.classList.add('active');
            }
        });
    }

    /**
     * Update filter statistics display
     */
    static updateFilterStats(sectionId) {
        const filterSystem = this.getInstance(sectionId);
        const stats = filterSystem.getFilterStats();
        const statsElement = document.getElementById(`${sectionId}-filter-stats`);
        
        if (statsElement) {
            const statsText = statsElement.querySelector('.filter-stats-text');
            if (statsText) {
                if (stats.hidden > 0) {
                    statsText.textContent = `Showing ${stats.filtered} of ${stats.total} recommendations (${stats.hidden} hidden by filters)`;
                    statsText.style.color = 'var(--primary-yellow)';
                } else {
                    statsText.textContent = `Showing all ${stats.total} recommendations`;
                    statsText.style.color = 'var(--text-gray)';
                }
            }
        }
    }

    /**
     * Get filtered recommendations for a section
     */
    static getFilteredRecommendations(sectionId) {
        const filterSystem = this.getInstance(sectionId);
        return filterSystem.getFilteredRecommendations();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        RecommendationFilterSystem,
        FilterUIGenerator,
        FilterManager
    };
}
