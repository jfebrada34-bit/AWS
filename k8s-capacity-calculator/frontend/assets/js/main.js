// main.js - Main application logic WITHOUT Tribe-Squad mapping
console.log('✅ main.js loaded');

import { calculateNamespaceCost } from "./calculatorCore.js";
import { renderResults, initializeModal, setResultsArray } from "./uiRenderer.js";

let results = [];
let currentId = 1;

/**
 * Generate unique ID for namespace tracking
 */
function generateId() {
  return currentId++;
}

/**
 * Get form data with proper numeric parsing
 */
function getFormData() {
  console.log('📝 Collecting form data...');
  
  const getValue = (id, isNumber = true) => {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`Element with id '${id}' not found`);
      return isNumber ? 0 : '';
    }
    
    const value = element.value.trim();
    
    if (isNumber) {
      const numValue = value === '' ? 0 : parseInt(value, 10);
      if (isNaN(numValue)) {
        console.warn(`Invalid number for ${id}: ${value}, using 0`);
        return 0;
      }
      return numValue;
    }
    return value;
  };

  const getSelectValue = (id) => {
    const element = document.getElementById(id);
    return element ? element.value : '';
  };

  const formData = {
    id: generateId(),
    env: getSelectValue('envMain'),
    cluster: getValue('cluster', false),
    namespace: getValue('namespace', false),
    pods: getValue('pods'),
    cpu_req: getValue('cpu_req'),
    mem_req: getValue('mem_req'),
    cpu_lim: getValue('cpu_lim'),
    mem_lim: getValue('mem_lim'),
    hpa_min: getValue('hpa_min'),
    hpa_max: getValue('hpa_max'),
    cpu_trigger: getValue('cpu_trigger', false),
    istio: getSelectValue('istio'),
    istio_cpu_req: getValue('istio_cpu_req'),
    istio_cpu_lim: getValue('istio_cpu_lim'),
    istio_mem_req: getValue('istio_mem_req'),
    istio_mem_lim: getValue('istio_mem_lim'),
    timestamp: new Date().toISOString()
  };

  console.log('📊 Form data collected:', formData);
  console.log('🔍 CPU Debug - Pods:', formData.pods, 'CPU Request:', formData.cpu_req);
  console.log('🔍 Expected Total CPU (millicores):', formData.pods * formData.cpu_req);
  console.log('🔍 Expected CPU Cores:', (formData.pods * formData.cpu_req) / 1000);
  
  return formData;
}

/**
 * Show validation errors to user
 */
function showValidationErrors(errors) {
  console.log('🔍 showValidationErrors called with:', errors);
  
  if (!errors || errors.length === 0) {
    console.log('🔍 No errors to display');
    return;
  }

  const errorHtml = errors.map(error => 
    `<div class="alert alert-warning alert-dismissible fade show" role="alert">
      ${error}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
     </div>`
  ).join('');

  let errorContainer = document.getElementById('errorContainer');
  
  if (!errorContainer) {
    console.log('🔍 Creating new errorContainer');
    errorContainer = document.createElement('div');
    errorContainer.id = 'errorContainer';
    errorContainer.className = 'error-container mb-3';
    
    const mainElement = document.querySelector('main');
    const formElement = document.querySelector('form');
    const firstCard = document.querySelector('.card');
    
    if (mainElement) {
      mainElement.prepend(errorContainer);
      console.log('✅ Error container added to main');
    } else if (formElement) {
      formElement.prepend(errorContainer);
      console.log('✅ Error container added to form');
    } else if (firstCard) {
      firstCard.parentNode.insertBefore(errorContainer, firstCard);
      console.log('✅ Error container added before first card');
    } else {
      document.body.prepend(errorContainer);
      console.log('✅ Error container added to body');
    }
  }
  
  errorContainer.innerHTML = errorHtml;
  console.log('✅ Validation errors displayed');
}

/**
 * Clear validation errors
 */
function clearValidationErrors() {
  const errorContainer = document.getElementById('errorContainer');
  if (errorContainer) {
    errorContainer.innerHTML = '';
    console.log('✅ Validation errors cleared');
  }
}

/**
 * Validate namespace form data
 */
function validateFormData(formData) {
  const errors = [];

  // Check required fields
  const requiredFields = ['env', 'cluster', 'namespace'];
  requiredFields.forEach(field => {
    if (!formData[field] || formData[field].trim() === '') {
      errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
    }
  });

  if (formData.hpa_min > formData.hpa_max) {
    errors.push('HPA min cannot be greater than HPA max');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Update summary statistics
 */
function updateSummary() {
  const summaryElement = document.getElementById('summaryStats');
  if (!summaryElement) return;

  if (results.length === 0) {
    summaryElement.innerHTML = '<div class="alert alert-info">No namespaces added yet</div>';
    return;
  }

  const totalMonthly = results.reduce((sum, ns) => sum + (ns.monthlyCost || 0), 0);
  const totalAnnual = results.reduce((sum, ns) => sum + (ns.annualCost || 0), 0);
  const avgMonthly = totalMonthly / results.length;

  summaryElement.innerHTML = `
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">Summary</h5>
        <div class="row">
          <div class="col-md-3">
            <strong>Namespaces:</strong> ${results.length}
          </div>
          <div class="col-md-3">
            <strong>Monthly Total:</strong> $${totalMonthly.toFixed(2)}
          </div>
          <div class="col-md-3">
            <strong>Annual Total:</strong> $${totalAnnual.toFixed(2)}
          </div>
          <div class="col-md-3">
            <strong>Average Monthly:</strong> $${avgMonthly.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Fixed overrideSize function
window.overrideSize = function(selectEl) {
  const namespaceId = parseInt(selectEl.getAttribute("data-id"));
  const newSize = selectEl.value;

  const namespace = results.find(ns => ns.id === namespaceId);
  if (namespace) {
    namespace.override_size = newSize;
    
    // Recalculate cost with new size
    const updatedNs = calculateNamespaceCost(namespace);
    Object.assign(namespace, updatedNs);
    
    setResultsArray(results);
    renderResults();
    updateSummary();
  }
};

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
  console.log('🚀 main.js DOM Content Loaded');
  
  try {
    // Initialize UI components
    initializeModal();
    updateSummary();

    // REMOVED: initializeTribeSquadMapping(); - This was causing the conflict

    // Add namespace button
    const btnAdd = document.getElementById("btnAdd");
    if (btnAdd) {
      btnAdd.addEventListener("click", () => {
        console.log('➕ Add Namespace button clicked');
        clearValidationErrors();
        
        const formData = getFormData();
        
        const validation = validateFormData(formData);
        if (!validation.isValid) {
          showValidationErrors(validation.errors);
          return;
        }

        try {
          const calculatedNs = calculateNamespaceCost(formData);
          console.log('📈 Calculation result:', calculatedNs);
          
          results.push(calculatedNs);
          setResultsArray(results);
          renderResults();
          updateSummary();
          
          // Clear only cluster and namespace, keep other values
          document.getElementById("cluster").value = '';
          document.getElementById("namespace").value = '';
          
          console.log('✅ Namespace added successfully');
        } catch (error) {
          console.error('❌ Error in calculation:', error);
          showValidationErrors(['Calculation error: ' + error.message]);
        }
      });
    }

    // Reset button
    document.getElementById("btnReset").addEventListener("click", () => {
      if (results.length > 0 && !confirm('Are you sure you want to clear all namespaces?')) {
        return;
      }
      
      results = [];
      currentId = 1;
      setResultsArray(results);
      renderResults();
      updateSummary();
    });

    // Finalize button
    document.getElementById("btnFinalize").addEventListener("click", () => {
      if (!results.length) {
        showValidationErrors(['Please add at least one namespace before finalizing.']);
        return;
      }
      
      try {
        if (window.finalizeModalManager) {
          console.log('🎯 Calling finalizeModalManager.show()');
          window.finalizeModalManager.show();
        } else {
          console.error('❌ finalizeModalManager not found');
          showValidationErrors(['Finalize modal not available. Please refresh the page.']);
        }
      } catch (error) {
        console.error('❌ Error showing finalize modal:', error);
        showValidationErrors(['Error displaying summary. Please try again.']);
      }
    });

    console.log('🎉 main.js initialized successfully');

  } catch (error) {
    console.error('❌ Failed to initialize main.js:', error);
  }
});

// Make function available globally immediately
window.showValidationErrors = showValidationErrors;
window.getCurrentResults = () => [...results];
window.importResults = (newResults) => {
  if (!Array.isArray(newResults)) {
    throw new Error('Expected array of namespace results');
  }
  
  results = newResults.map(ns => ({
    ...ns,
    id: generateId()
  }));
  
  setResultsArray(results);
  renderResults();
  updateSummary();
};
console.log('✅ showValidationErrors function registered globally');