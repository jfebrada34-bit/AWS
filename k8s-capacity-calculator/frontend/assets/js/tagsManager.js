// assets/js/tagsManager.js
class TagsManager {
    constructor() {
        this.init();
    }
    
    init() {
        console.log('✅ Tags Manager initialized');
        this.setupFormListeners();
        this.updateAllTags();
    }
    
    setupFormListeners() {
        // Listen to all form changes to update tags in real-time
        const formIds = ['tribe', 'squad', 'approver', 'platform', 'productOwner', 
                        'systemOwner', 'srTag', 'description', 'targetDate', 'duration'];
        
        formIds.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.addEventListener('change', () => {
                    this.updateTag(fieldId);
                });
                element.addEventListener('input', () => {
                    this.updateTag(fieldId);
                });
            }
        });
        
        // Special listener for cost calculations
        this.setupCostListeners();
    }
    
    setupCostListeners() {
        // Listen for namespace additions/updates
        document.addEventListener('namespaceAdded', () => {
            this.updateCostEstimates();
        });
        
        // Listen for finalize modal updates
        if (window.finalizeModalManager) {
            const originalShow = window.finalizeModalManager.show.bind(window.finalizeModalManager);
            window.finalizeModalManager.show = async function() {
                const result = await originalShow();
                window.tagsManager.updateCostEstimates();
                return result;
            };
        }
    }
    
    updateAllTags() {
        this.updateCostEstimates();
        this.updateTag('tribe');
        this.updateTag('squad');
        this.updateTag('approver');
        this.updateTag('platform');
        this.updateTag('productOwner');
        this.updateTag('systemOwner');
        this.updateTag('srTag');
        this.updateTag('description');
        this.updateTag('targetDate');
        this.updateTag('duration');
    }
    
    updateTag(fieldId) {
        const tagMapping = {
            'tribe': 'tagTribe',
            'squad': 'tagSquad',
            'approver': 'tagApprover',
            'platform': 'tagPlatform',
            'productOwner': 'tagPO',
            'systemOwner': 'tagSO',
            'srTag': 'tagSR',
            'description': 'tagDesc',
            'targetDate': 'tagFireupDate',
            'duration': 'tagDuration'
        };
        
        const tagElementId = tagMapping[fieldId];
        if (!tagElementId) return;
        
        const formElement = document.getElementById(fieldId);
        const tagElement = document.getElementById(tagElementId);
        
        if (formElement && tagElement) {
            let value = formElement.value.trim();
            
            // Handle special cases
            if (fieldId === 'targetDate' && value) {
                value = new Date(value).toLocaleDateString();
            }
            
            tagElement.textContent = value || 'Not specified';
            console.log(`✅ Updated tag ${tagElementId}: ${value || 'Not specified'}`);
        }
    }
    
    updateCostEstimates() {
        const costElement = document.getElementById('tagCostEstimates');
        if (!costElement) {
            console.log('⚠️ Cost estimates element not found');
            return;
        }
        
        const monthlyCost = this.getCurrentMonthlyCost();
        const annualCost = monthlyCost * 12;
        
        costElement.textContent = `$${monthlyCost.toFixed(2)}/monthly | $${annualCost.toFixed(2)}/yearly`;
        console.log(`✅ Updated cost estimates: $${monthlyCost.toFixed(2)}/monthly | $${annualCost.toFixed(2)}/yearly`);
    }
    
    getCurrentMonthlyCost() {
        // Try to get from finalized modal first
        if (window.finalizeModalManager && window.finalizeModalManager.lastFinalizedData) {
            const cost = window.finalizeModalManager.lastFinalizedData.raw_total_monthly || 0;
            console.log('💰 Using finalized modal cost:', cost);
            return cost;
        }
        
        // Fallback to global results
        const results = this.getCurrentResults();
        const cost = results.reduce((sum, ns) => sum + (ns.monthlyCost || 0), 0);
        console.log('💰 Using calculated cost from results:', cost);
        return cost;
    }
    
    getCurrentResults() {
        // Get current namespace results
        if (window.getCurrentResults && typeof window.getCurrentResults === 'function') {
            return window.getCurrentResults();
        }
        
        // Fallback to global results array
        if (window.results && Array.isArray(window.results)) {
            return window.results;
        }
        
        return [];
    }
    
    // ADD THIS METHOD - This was missing and causing the error
    updateFromFinalizedData(finalizedData) {
        console.log('🔄 TagsManager: Updating from finalized data', finalizedData);
        
        if (finalizedData && finalizedData.raw_total_monthly) {
            // Update cost estimates with the finalized data
            const costElement = document.getElementById('tagCostEstimates');
            if (costElement) {
                const monthly = finalizedData.raw_total_monthly || 0;
                const annual = finalizedData.raw_total_annual || (monthly * 12);
                costElement.textContent = `$${monthly.toFixed(2)}/monthly | $${annual.toFixed(2)}/yearly`;
                console.log(`✅ TagsManager: Updated cost estimates from finalized data: $${monthly.toFixed(2)}/monthly | $${annual.toFixed(2)}/yearly`);
            }
            
            // Also update all other tags
            this.updateAllTags();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.tagsManager = new TagsManager();
    console.log('✅ Tags Manager ready');
});