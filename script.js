// LTU Moodle Tabs Component JavaScript
// Student: Ghanim Daif | Student Number: 20222582
// Course: CSE3CWA/CSE5006 Assignment 1

// Global variables
let currentActiveTab = 'tab1';
let tabHistory = [];

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('LTU Moodle Tabs Component initialized');
    
    // Initialize tabs
    initializeTabs();
    
    // Add accessibility features
    addAccessibilityFeatures();
    
    // Add keyboard navigation
    addKeyboardNavigation();
    
    // Load saved tab state from localStorage
    loadSavedTabState();
    
    // Add performance monitoring
    addPerformanceMonitoring();
});

/**
 * Initialize the tabs functionality
 */
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Set initial active tab
    if (tabButtons.length > 0) {
        showTab(currentActiveTab);
    }
    
    // Add click event listeners to all tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            showTab(tabId);
        });
    });
}

/**
 * Show the specified tab and hide others
 * @param {string} tabId - The ID of the tab to show
 */
function showTab(tabId) {
    // Validate tab ID
    if (!tabId || !document.getElementById(tabId)) {
        console.warn('Invalid tab ID:', tabId);
        return;
    }
    
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
        content.setAttribute('aria-hidden', 'true');
    });
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
        button.setAttribute('aria-selected', 'false');
    });
    
    // Show selected tab content
    const selectedContent = document.getElementById(tabId);
    if (selectedContent) {
        selectedContent.style.display = 'block';
        selectedContent.classList.add('active');
        selectedContent.setAttribute('aria-hidden', 'false');
        
        // Add fade-in animation
        selectedContent.style.animation = 'fadeIn 0.5s ease-in-out';
    }
    
    // Add active class to clicked button
    const activeButton = document.querySelector(`[onclick*="${tabId}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
        activeButton.setAttribute('aria-selected', 'true');
        activeButton.focus();
    }
    
    // Update current active tab
    currentActiveTab = tabId;
    
    // Save tab state to localStorage
    saveTabState(tabId);
    
    // Add to history
    addToHistory(tabId);
    
    // Trigger custom event for external listeners
    const event = new CustomEvent('tabChanged', {
        detail: { tabId: tabId, previousTab: tabHistory[tabHistory.length - 2] }
    });
    document.dispatchEvent(event);
    
    console.log('Tab changed to:', tabId);
}

/**
 * Add accessibility features to the tabs
 */
function addAccessibilityFeatures() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Add ARIA attributes to tab buttons
    tabButtons.forEach((button, index) => {
        const tabId = button.getAttribute('onclick').match(/'([^']+)'/)[1];
        const content = document.getElementById(tabId);
        
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        button.setAttribute('aria-controls', tabId);
        button.setAttribute('tabindex', index === 0 ? '0' : '-1');
        
        // Add ID to button if not present
        if (!button.id) {
            button.id = `tab-button-${tabId}`;
        }
    });
    
    // Add ARIA attributes to tab contents
    tabContents.forEach((content, index) => {
        content.setAttribute('role', 'tabpanel');
        content.setAttribute('aria-labelledby', `tab-button-${content.id}`);
        content.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
    });
    
    // Add skip link for screen readers
    addSkipLink();
}

/**
 * Add skip link for accessibility
 */
function addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.setAttribute('tabindex', '0');
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content ID if not present
    const mainContent = document.querySelector('.main-content');
    if (mainContent && !mainContent.id) {
        mainContent.id = 'main-content';
    }
}

/**
 * Add keyboard navigation support
 */
function addKeyboardNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('keydown', function(e) {
            const currentIndex = Array.from(tabButtons).indexOf(this);
            let targetIndex;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    targetIndex = currentIndex > 0 ? currentIndex - 1 : tabButtons.length - 1;
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    targetIndex = currentIndex < tabButtons.length - 1 ? currentIndex + 1 : 0;
                    break;
                case 'Home':
                    e.preventDefault();
                    targetIndex = 0;
                    break;
                case 'End':
                    e.preventDefault();
                    targetIndex = tabButtons.length - 1;
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    const tabId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
                    showTab(tabId);
                    return;
                default:
                    return;
            }
            
            // Focus the target tab
            tabButtons[targetIndex].focus();
        });
    });
}

/**
 * Save current tab state to localStorage
 * @param {string} tabId - The active tab ID
 */
function saveTabState(tabId) {
    try {
        const state = {
            activeTab: tabId,
            timestamp: Date.now()
        };
        localStorage.setItem('ltu-tabs-state', JSON.stringify(state));
    } catch (error) {
        console.warn('Could not save tab state:', error);
    }
}

/**
 * Load saved tab state from localStorage
 */
function loadSavedTabState() {
    try {
        const savedState = localStorage.getItem('ltu-tabs-state');
        if (savedState) {
            const state = JSON.parse(savedState);
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            
            // Only restore if saved within the last 24 hours
            if (now - state.timestamp < oneDay) {
                showTab(state.activeTab);
            }
        }
    } catch (error) {
        console.warn('Could not load saved tab state:', error);
    }
}

/**
 * Add tab to history
 * @param {string} tabId - The tab ID to add to history
 */
function addToHistory(tabId) {
    tabHistory.push(tabId);
    
    // Keep only last 10 entries
    if (tabHistory.length > 10) {
        tabHistory.shift();
    }
}

/**
 * Get tab history
 * @returns {Array} Array of tab IDs in order of access
 */
function getTabHistory() {
    return [...tabHistory];
}

/**
 * Go back to previous tab
 */
function goBack() {
    if (tabHistory.length > 1) {
        tabHistory.pop(); // Remove current tab
        const previousTab = tabHistory[tabHistory.length - 1];
        showTab(previousTab);
    }
}

/**
 * Add performance monitoring
 */
function addPerformanceMonitoring() {
    // Monitor tab switching performance
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.name === 'tab-switch') {
                console.log('Tab switch performance:', entry.duration + 'ms');
            }
        }
    });
    
    observer.observe({ entryTypes: ['measure'] });
    
    // Override showTab to include performance measurement
    const originalShowTab = showTab;
    showTab = function(tabId) {
        performance.mark('tab-switch-start');
        originalShowTab(tabId);
        performance.mark('tab-switch-end');
        performance.measure('tab-switch', 'tab-switch-start', 'tab-switch-end');
    };
}

/**
 * Utility function to get current tab information
 * @returns {Object} Current tab information
 */
function getCurrentTabInfo() {
    const activeButton = document.querySelector('.tab-button.active');
    const activeContent = document.querySelector('.tab-content.active');
    
    return {
        tabId: currentActiveTab,
        buttonText: activeButton ? activeButton.textContent : '',
        contentTitle: activeContent ? activeContent.querySelector('h3')?.textContent : '',
        history: getTabHistory()
    };
}

/**
 * Utility function to check if tabs are working properly
 * @returns {boolean} True if tabs are working correctly
 */
function validateTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Check if we have equal numbers of buttons and contents
    if (tabButtons.length !== tabContents.length) {
        console.error('Mismatch between tab buttons and contents');
        return false;
    }
    
    // Check if all tab contents have corresponding buttons
    let isValid = true;
    tabContents.forEach(content => {
        const button = document.querySelector(`[onclick*="${content.id}"]`);
        if (!button) {
            console.error('No button found for content:', content.id);
            isValid = false;
        }
    });
    
    return isValid;
}

// Export functions for external use (if needed)
if (typeof window !== 'undefined') {
    window.LTUTabs = {
        showTab,
        getCurrentTabInfo,
        getTabHistory,
        goBack,
        validateTabs
    };
}

// Add error handling for unexpected issues
window.addEventListener('error', function(e) {
    console.error('Tabs component error:', e.error);
});

// Add unload handler to save final state
window.addEventListener('beforeunload', function() {
    saveTabState(currentActiveTab);
});

console.log('LTU Moodle Tabs Component JavaScript loaded successfully'); 