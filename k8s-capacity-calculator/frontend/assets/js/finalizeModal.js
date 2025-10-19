// finalizeModal.js - Updated with new tag mappings for organized layout
console.log('✅ Finalize Modal Manager created');

class FinalizeModalManager {
    constructor() {
        this.modalElement = document.getElementById('finalizeModal');
        this.summaryTableBody = document.getElementById('finalizedCostsTableBody');
        this.modalInstance = null;
        this.lastFinalizedData = null;
        
        // Bind methods to maintain 'this' context
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.getFormValue = this.getFormValue.bind(this);
        this.formatCurrency = this.formatCurrency.bind(this);
        this.parseCurrency = this.parseCurrency.bind(this);
        
        this.init();
    }

    init() {
        console.log('🔍 [FinalizeModal] initialize() called');
        if (this.modalElement) {
            this.modalInstance = new bootstrap.Modal(this.modalElement);
            
            this.modalElement.addEventListener('hidden.bs.modal', () => {
                this.cleanup();
            });
            
            const closeButton = this.modalElement.querySelector('.btn-secondary[data-bs-dismiss="modal"]');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    this.hide();
                });
            }
            
            console.log('✅ Finalize Modal Manager initialized');
        } else {
            console.error('❌ Finalize modal element not found');
        }
        
        if (!this.summaryTableBody) {
            console.error('❌ Summary table body not found - checking alternative IDs');
            this.summaryTableBody = document.getElementById('finalizedCostsBody') || 
                                  document.querySelector('#finalizeModal tbody');
            if (this.summaryTableBody) {
                console.log('✅ Found alternative table body');
            } else {
                console.log('⚠️ Will create table body when needed');
            }
        }
    }

    // Helper function to format currency with commas
    formatCurrency(amount) {
        if (typeof amount !== 'number') {
            amount = parseFloat(amount) || 0;
        }
        return `$${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    }

    // Helper function to parse currency strings (remove commas and $)
    parseCurrency(currencyString) {
        if (typeof currencyString === 'number') return currencyString;
        return parseFloat(currencyString.replace(/[$,]/g, '')) || 0;
    }

    async show() {
        console.log('🔍 [FinalizeModal] show() method called');
        
        try {
            // Step 1: Get current results data
            console.log('🔍 [FinalizeModal] Step 1: Getting current results data...');
            const results = this.getCurrentResultsData();
            
            if (results.length === 0) {
                alert('No namespace data found. Please add namespaces first.');
                return;
            }

            // Step 2: Fetch finalized costs from backend
            console.log('🔍 [FinalizeModal] Step 2: Fetching finalized costs from backend...');
            const finalizedData = await this.fetchFinalizedCosts(results);
            
            // Step 3: Validate and fix backend data if needed
            console.log('🔍 [FinalizeModal] Step 3: Validating backend data...');
            const validatedData = this.validateBackendData(finalizedData, results);
            
            // Store the finalized data for tags to use
            this.lastFinalizedData = validatedData;
            
            // Step 4: Populate summary table
            console.log('🔍 [FinalizeModal] Step 4: Populating summary table...');
            this.populateSummaryTable(validatedData, results);
            
            // Step 5: Populate organized tags and metadata
            console.log('🔍 [FinalizeModal] Step 5: Populating organized tags and metadata...');
            this.populateOrganizedTagsAndMetadata();
            
            // Step 6: Update modal title
            console.log('🔍 [FinalizeModal] Step 6: Updating modal title...');
            this.updateModalTitle(validatedData);
            
            // Step 7: Show modal
            console.log('🔍 [FinalizeModal] Step 7: Showing modal...');
            if (this.modalInstance) {
                this.modalInstance.show();
            } else {
                const modal = new bootstrap.Modal(this.modalElement);
                modal.show();
                this.modalInstance = modal;
            }
            
            console.log('✅ [FinalizeModal] Modal shown successfully');
        } catch (error) {
            console.error('❌ [FinalizeModal] Error showing modal:', error);
            alert('Error loading cost summary: ' + error.message);
        }
    }

    hide() {
        console.log('🔍 [FinalizeModal] hide() method called');
        if (this.modalInstance) {
            this.modalInstance.hide();
            console.log('✅ [FinalizeModal] Modal hidden');
        } else {
            console.error('❌ Modal instance not available for hiding');
            const modal = bootstrap.Modal.getInstance(this.modalElement);
            if (modal) {
                modal.hide();
            }
        }
    }

    async fetchFinalizedCosts(results) {
        console.log('🔍 [FinalizeModal] fetchFinalizedCosts() called');
        console.log('🔍 [FinalizeModal] Sending data to backend:', results);
        
        try {
            const response = await fetch('/api/finalize-cost', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ results })
            });

            console.log('🔍 [FinalizeModal] Response status:', response.status);
            console.log('🔍 [FinalizeModal] Response ok:', response.ok);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('🔍 [FinalizeModal] Raw response data:', data);

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch finalized costs');
            }

            console.log('✅ [FinalizeModal] Finalized costs fetched successfully:', data);
            return data;
        } catch (error) {
            console.error('❌ [FinalizeModal] Error fetching finalized costs:', error);
            return this.generateMockFinalizedData(results);
        }
    }

    validateBackendData(finalizedData, originalResults) {
        console.log('🔍 [FinalizeModal] Validating backend data...');
        
        if (!finalizedData.finalized_costs || Object.keys(finalizedData.finalized_costs).length === 0) {
            console.log('⚠️ [FinalizeModal] Backend data empty, using client-side calculation');
            return this.generateMockFinalizedData(originalResults);
        }
        
        const totalMonthly = finalizedData.raw_total_monthly || 0;
        const expectedMonthly = originalResults.reduce((sum, ns) => sum + (ns.monthlyCost || 0), 0);
        
        if (totalMonthly < expectedMonthly * 0.9) {
            console.log('⚠️ [FinalizeModal] Backend costs seem incorrect, using client-side calculation');
            return this.generateMockFinalizedData(originalResults);
        }
        
        return finalizedData;
    }

    getCurrentResultsData() {
        console.log('🔍 [FinalizeModal] Getting current results data...');
        
        if (window.getCurrentResults && typeof window.getCurrentResults === 'function') {
            const results = window.getCurrentResults();
            console.log('✅ [FinalizeModal] Using data from getCurrentResults():', results);
            return this.formatResultsForBackend(results);
        }
        else if (window.results && Array.isArray(window.results)) {
            const results = window.results;
            console.log('✅ [FinalizeModal] Using data from window.results:', results);
            return this.formatResultsForBackend(results);
        }
        else {
            console.log('⚠️ [FinalizeModal] Using fallback table parsing');
            const results = this.parseResultsFromTable();
            return this.formatResultsForBackend(results);
        }
    }

    formatResultsForBackend(results) {
        console.log('🔍 [FinalizeModal] Formatting results for backend...');
        
        return results.map(ns => {
            const totalCpu = ns.pods * ns.cpu_req;
            
            return {
                id: ns.id,
                env: ns.env,
                cluster: ns.cluster,
                namespace: ns.namespace,
                pods: ns.pods,
                cpu_req: ns.cpu_req,
                mem_req: ns.mem_req,
                monthlyCost: ns.monthlyCost || 0,
                annualCost: ns.annualCost || 0,
                total_cpu: totalCpu
            };
        });
    }

    parseResultsFromTable() {
        console.log('🔍 [FinalizeModal] Parsing results from table...');
        const table = document.getElementById('resultsTable');
        if (!table) {
            console.error('❌ Results table not found');
            return [];
        }

        const rows = table.querySelectorAll('tbody tr');
        console.log('🔍 [FinalizeModal] Found', rows.length, 'table rows');

        const results = [];
        
        rows.forEach((row, index) => {
            const cells = row.querySelectorAll('td');
            if (cells.length < 10) {
                console.log('🔍 [FinalizeModal] Skipping row', index, '- appears to be summary row');
                return;
            }

            try {
                const result = {
                    id: parseInt(cells[0].textContent) || index + 1,
                    env: cells[1].textContent.trim(),
                    cluster: cells[2].textContent.trim(),
                    namespace: cells[3].textContent.trim(),
                    pods: parseInt(cells[4].textContent) || 0,
                    cpu_req: parseInt(cells[5].textContent) || 0,
                    mem_req: parseInt(cells[6].textContent) || 0,
                    monthlyCost: this.parseCurrency(cells[7].textContent),
                    annualCost: this.parseCurrency(cells[8].textContent)
                };
                
                console.log('✅ [FinalizeModal] Parsed row:', result);
                results.push(result);
            } catch (error) {
                console.error('❌ [FinalizeModal] Error parsing row', index, ':', error);
            }
        });

        console.log('✅ [FinalizeModal] Parsed', results.length, 'namespaces from table');
        return results;
    }

    populateSummaryTable(finalizedData, originalResults) {
        console.log('🔍 [FinalizeModal] populateSummaryTable() called');
        
        if (!this.summaryTableBody) {
            console.log('⚠️ [FinalizeModal] Creating table body dynamically');
            this.createTableBody();
        }

        if (!this.summaryTableBody) {
            console.error('❌ Cannot create or find summary table body');
            this.showDataAsAlert(finalizedData, originalResults);
            return;
        }

        this.summaryTableBody.innerHTML = '';

        if (!finalizedData.finalized_costs || Object.keys(finalizedData.finalized_costs).length === 0) {
            console.log('⚠️ [FinalizeModal] No finalized costs data, showing original results');
            this.showOriginalResults(originalResults);
            return;
        }

        console.log('🔍 [FinalizeModal] Finalized data available:', finalizedData);

        let totalMonthly = 0;
        let totalAnnual = 0;

        Object.entries(finalizedData.finalized_costs).forEach(([env, envData]) => {
            console.log('🔍 [FinalizeModal] Processing environment:', env, envData);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${env}</td>
                <td>${envData.cluster_name || 'N/A'}</td>
                <td>${envData.provisioner || 'Tier1'}</td>
                <td>${envData.namespace_count || 0}</td>
                <td>${envData.total_cpu || '0m'}</td>
                <td>${envData.total_cpu_buffered || '0m'}</td>
                <td>${envData.node_count || 0}</td>
                <td>${this.formatCurrency(envData.raw_monthly || 0)}</td>
                <td>${this.formatCurrency(envData.raw_annual || 0)}</td>
            `;
            this.summaryTableBody.appendChild(row);

            totalMonthly += envData.raw_monthly || 0;
            totalAnnual += envData.raw_annual || 0;
        });

        this.addTotalRow(totalMonthly, totalAnnual);
        console.log('✅ [FinalizeModal] Summary table populated');
    }

    populateOrganizedTagsAndMetadata() {
        console.log('🔍 [FinalizeModal] populateOrganizedTagsAndMetadata() called');
        
        // Request Information Section
        this.updateRequestInformation();
        
        // Tags Section
        this.updateTagsSection();
        
        console.log('✅ [FinalizeModal] Organized tags and metadata populated');
    }

    updateRequestInformation() {
        console.log('🔍 [FinalizeModal] Updating request information...');
        
        // Cost Estimate - FIXED: Now using formatCurrency for proper comma formatting
        const costElement = document.getElementById('tagCostEstimates');
        if (costElement && this.lastFinalizedData) {
            const monthly = this.lastFinalizedData.raw_total_monthly || 0;
            const annual = this.lastFinalizedData.raw_total_annual || (monthly * 12);
            costElement.textContent = `${this.formatCurrency(monthly)}/monthly | ${this.formatCurrency(annual)}/yearly`;
            console.log('✅ [FinalizeModal] Cost estimate formatted with commas:', costElement.textContent);
        } else if (costElement) {
            // Fallback if no finalized data available
            const results = this.getCurrentResultsData();
            const monthly = results.reduce((sum, ns) => sum + (ns.monthlyCost || 0), 0);
            const annual = results.reduce((sum, ns) => sum + (ns.annualCost || 0), 0);
            costElement.textContent = `${this.formatCurrency(monthly)}/monthly | ${this.formatCurrency(annual)}/yearly`;
            console.log('✅ [FinalizeModal] Cost estimate (fallback) formatted with commas:', costElement.textContent);
        }
        
        // Request Form
        const requestFormElement = document.getElementById('tagRequestForm');
        if (requestFormElement) {
            const requestFormValue = this.getFormValue('requestForm');
            requestFormElement.textContent = requestFormValue || 'Not specified';
        }
        
        // MTS-ID
        const mtsIdElement = document.getElementById('tagMtsId');
        if (mtsIdElement) {
            const mtsIdValue = this.getFormValue('mtsId');
            mtsIdElement.textContent = mtsIdValue || 'Not specified';
        }
        
        // Target Fire-up Date
        const fireupDateElement = document.getElementById('tagFireupDate');
        if (fireupDateElement) {
            const targetDateValue = this.getFormValue('targetDate');
            fireupDateElement.textContent = targetDateValue ? this.formatDate(targetDateValue) : 'Not selected';
        }
        
        // Duration
        const durationElement = document.getElementById('tagDuration');
        if (durationElement) {
            const durationValue = this.getFormValue('duration');
            durationElement.textContent = durationValue ? `${durationValue} months` : 'Not specified';
        }
    }

    updateTagsSection() {
        console.log('🔍 [FinalizeModal] Updating tags section...');
        
        // Project (from Project Code)
        const projectElement = document.getElementById('tagProject');
        if (projectElement) {
            const projectValue = this.getFormValue('projectCode');
            projectElement.textContent = projectValue || '-';
        }
        
        // Environment (from metaEnv dropdown)
        const environmentElement = document.getElementById('tagEnvironment');
        if (environmentElement) {
            const environmentValue = this.getFormValue('metaEnv');
            environmentElement.textContent = environmentValue || '-';
        }
        
        // Environment Group (from envGroup input)
        const envGroupElement = document.getElementById('tagEnvGroup');
        if (envGroupElement) {
            const envGroupValue = this.getFormValue('envGroup');
            envGroupElement.textContent = envGroupValue || '-';
        }
        
        // Tribe
        const tribeElement = document.getElementById('tagTribe');
        if (tribeElement) {
            const tribeValue = this.getFormValue('tribe');
            tribeElement.textContent = tribeValue || '-';
        }
        
        // Squad
        const squadElement = document.getElementById('tagSquad');
        if (squadElement) {
            const squadValue = this.getFormValue('squad');
            squadElement.textContent = squadValue || '-';
        }
        
        // Platform Owner (from platform input)
        const platformElement = document.getElementById('tagPlatform');
        if (platformElement) {
            const platformValue = this.getFormValue('platform');
            platformElement.textContent = platformValue || '-';
        }
        
        // System Owner (from systemOwner input)
        const systemOwnerElement = document.getElementById('tagSystemOwner');
        if (systemOwnerElement) {
            const systemOwnerValue = this.getFormValue('systemOwner');
            systemOwnerElement.textContent = systemOwnerValue || '-';
        }
        
        // Approver
        const approverElement = document.getElementById('tagApprover');
        if (approverElement) {
            const approverValue = this.getFormValue('approver');
            approverElement.textContent = approverValue || '-';
        }
        
        // SR Tag
        const srTagElement = document.getElementById('tagSR');
        if (srTagElement) {
            const srTagValue = this.getFormValue('srTag');
            srTagElement.textContent = srTagValue || '-';
        }
        
        // Description
        const descElement = document.getElementById('tagDesc');
        if (descElement) {
            const descValue = this.getFormValue('description');
            descElement.textContent = descValue || '-';
        }
    }

    formatDate(dateString) {
        if (!dateString) return 'Not selected';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
            });
        } catch (error) {
            return dateString;
        }
    }

    // Add the missing getFormValue method
    getFormValue(fieldName) {
        console.log(`🔍 [FinalizeModal] Getting form value for: ${fieldName}`);
        const element = document.getElementById(fieldName);
        if (!element) {
            console.warn(`⚠️ [FinalizeModal] Form element '${fieldName}' not found`);
            return 'Not specified';
        }
        
        let value = '';
        if (element.tagName === 'SELECT') {
            value = element.options[element.selectedIndex].text;
        } else {
            value = element.value ? element.value.trim() : '';
        }
        
        if (!value) {
            return 'Not specified';
        }
        
        console.log(`✅ [FinalizeModal] Got value for ${fieldName}: ${value}`);
        return value;
    }

    createTableBody() {
        const table = document.querySelector('#finalizeModal table');
        if (table) {
            let tbody = table.querySelector('tbody');
            if (!tbody) {
                tbody = document.createElement('tbody');
                table.appendChild(tbody);
            }
            tbody.id = 'finalizedCostsTableBody';
            this.summaryTableBody = tbody;
            console.log('✅ [FinalizeModal] Created table body');
        }
    }

    showOriginalResults(results) {
        console.log('🔍 [FinalizeModal] Showing original results');
        
        const grouped = {};
        results.forEach(ns => {
            const key = `${ns.env}-${ns.cluster}`;
            if (!grouped[key]) {
                grouped[key] = {
                    env: ns.env,
                    cluster: ns.cluster,
                    namespace_count: 0,
                    total_cpu: 0,
                    monthly_cost: 0,
                    annual_cost: 0
                };
            }
            
            grouped[key].namespace_count++;
            
            const cpuPerNamespace = ns.cpu_core_ns || (ns.env === 'prod' ? 128 : 6);
            grouped[key].total_cpu += cpuPerNamespace;
            grouped[key].monthly_cost += ns.monthlyCost || 0;
            grouped[key].annual_cost += ns.annualCost || 0;
        });

        Object.values(grouped).forEach(group => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${group.env}</td>
                <td>${group.cluster}</td>
                <td>Tier1</td>
                <td>${group.namespace_count}</td>
                <td>${group.total_cpu}</td>
                <td>${Math.round(group.total_cpu * 1.3)}</td>
                <td>${Math.ceil((group.total_cpu * 1.3) / 2.67)}</td>
                <td>${this.formatCurrency(group.monthly_cost)}</td>
                <td>${this.formatCurrency(group.annual_cost)}</td>
            `;
            this.summaryTableBody.appendChild(row);
        });

        const totalMonthly = results.reduce((sum, ns) => sum + (ns.monthlyCost || 0), 0);
        const totalAnnual = results.reduce((sum, ns) => sum + (ns.annualCost || 0), 0);
        this.addTotalRow(totalMonthly, totalAnnual);
    }

    showDataAsAlert(finalizedData, results) {
        const totalMonthly = results.reduce((sum, ns) => sum + (ns.monthlyCost || 0), 0);
        const totalAnnual = results.reduce((sum, ns) => sum + (ns.annualCost || 0), 0);
        
        alert(`Cost Summary:\nMonthly: ${this.formatCurrency(totalMonthly)}\nAnnual: ${this.formatCurrency(totalAnnual)}\n\nCheck console for detailed data.`);
    }

    addTotalRow(monthly, annual) {
        console.log('🔍 [FinalizeModal] addTotalRow() called');
        
        const totalRow = document.createElement('tr');
        totalRow.className = 'table-success fw-bold';
        totalRow.innerHTML = `
            <td colspan="7" class="text-end"><strong>Total</strong></td>
            <td><strong>${this.formatCurrency(monthly)}</strong></td>
            <td><strong>${this.formatCurrency(annual)}</strong></td>
        `;
        this.summaryTableBody.appendChild(totalRow);
        
        console.log('✅ [FinalizeModal] Total row added');
    }

    updateModalTitle(finalizedData) {
        console.log('🔍 [FinalizeModal] updateModalTitle() called');
        
        const modalTitle = document.getElementById('finalizeModalLabel');
        if (modalTitle) {
            if (finalizedData.total_annual_cost) {
                modalTitle.textContent = `Cost Summary - ${finalizedData.total_annual_cost}/year`;
            } else {
                const results = this.getCurrentResultsData();
                const totalAnnual = results.reduce((sum, ns) => sum + (ns.annualCost || 0), 0);
                modalTitle.textContent = `Cost Summary - ${this.formatCurrency(totalAnnual)}/year`;
            }
            console.log('✅ [FinalizeModal] Modal title updated:', modalTitle.textContent);
        }
    }

    generateMockFinalizedData(results) {
        console.log('🔍 [FinalizeModal] Generating mock finalized data');
        
        const grouped = {};
        results.forEach(ns => {
            if (!grouped[ns.env]) {
                grouped[ns.env] = {
                    cluster_name: ns.cluster,
                    provisioner: 'Tier1',
                    namespace_count: 0,
                    total_cpu: 0,
                    total_cpu_buffered: 0,
                    node_count: 0,
                    monthly_cost: 0,
                    annual_cost: 0,
                    raw_monthly: 0,
                    raw_annual: 0
                };
            }
            
            grouped[ns.env].namespace_count++;
            
            const cpuPerNamespace = ns.cpu_core_ns || (ns.env === 'prod' ? 128 : 6);
            grouped[ns.env].total_cpu += cpuPerNamespace;
            grouped[ns.env].monthly_cost += ns.monthlyCost || 0;
            grouped[ns.env].annual_cost += ns.annualCost || 0;
            grouped[ns.env].raw_monthly += ns.monthlyCost || 0;
            grouped[ns.env].raw_annual += ns.annualCost || 0;
        });

        Object.values(grouped).forEach(env => {
            env.total_cpu_buffered = Math.round(env.total_cpu * 1.3);
            env.node_count = Math.ceil(env.total_cpu_buffered / 2.67);
            
            env.monthly_cost = this.formatCurrency(env.raw_monthly);
            env.annual_cost = this.formatCurrency(env.raw_annual);
        });

        const totalMonthly = results.reduce((sum, ns) => sum + (ns.monthlyCost || 0), 0);
        const totalAnnual = results.reduce((sum, ns) => sum + (ns.annualCost || 0), 0);

        return {
            success: true,
            finalized_costs: grouped,
            raw_total_monthly: totalMonthly,
            raw_total_annual: totalAnnual,
            total_monthly_cost: this.formatCurrency(totalMonthly),
            total_annual_cost: this.formatCurrency(totalAnnual)
        };
    }

    cleanup() {
        console.log('🔍 [FinalizeModal] cleanup() called');
        if (this.summaryTableBody) {
            this.summaryTableBody.innerHTML = '';
            console.log('✅ [FinalizeModal] Table body cleared');
        }
        console.log('✅ [FinalizeModal] Cleanup completed');
    }
}

// Initialize and expose globally
const finalizeModalManager = new FinalizeModalManager();
window.finalizeModalManager = finalizeModalManager;

console.log('✅ Finalize Modal Manager ready');