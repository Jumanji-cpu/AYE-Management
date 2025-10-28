// Enhanced Programme Management System - Fixed JavaScript

// Safe localStorage wrapper
const storage = {
    get: function(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultValue;
        }
    },
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error writing to localStorage:', e);
            return false;
        }
    }
};

// Global Data Management
let systemData = {
    participants: storage.get('participants', []),
    budgetItems: storage.get('budgetItems', []),
    expenses: storage.get('expenses', []),
    settings: storage.get('settings', {
        theme: 'light'
    })
};

// Initialize systemData with current localStorage data
function initializeSystemData() {
    systemData.participants = storage.get('participants', []);
    systemData.budgetItems = storage.get('budgetItems', []);
    systemData.expenses = storage.get('expenses', []);
    systemData.settings = storage.get('settings', { theme: 'light' });
}

// Core Utility Functions
function saveData() {
    storage.set('participants', systemData.participants);
    storage.set('budgetItems', systemData.budgetItems);
    storage.set('expenses', systemData.expenses);
    storage.set('settings', systemData.settings);
}

function getParticipants() {
    // Always get fresh data from localStorage
    return storage.get('participants', []);
}

function saveParticipants(participants) {
    systemData.participants = participants;
    storage.set('participants', participants);
}

function getBudgetItems() {
    // Always get fresh data from localStorage
    return storage.get('budgetItems', []);
}

function saveBudgetItems(budgetItems) {
    systemData.budgetItems = budgetItems;
    storage.set('budgetItems', budgetItems);
}

function getExpenses() {
    // Always get fresh data from localStorage
    return storage.get('expenses', []);
}

function saveExpenses(expenses) {
    systemData.expenses = expenses;
    storage.set('expenses', expenses);
}

// Theme Management - FIXED
function loadTheme() {
    const savedTheme = systemData.settings.theme;
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    updateThemeIcon();
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    systemData.settings.theme = isDark ? 'dark' : 'light';
    saveData();
    updateThemeIcon();
}

function updateThemeIcon() {
    const icons = document.querySelectorAll('.theme-icon');
    icons.forEach(function(icon) {
        const isDark = document.body.classList.contains('dark-mode');
        icon.textContent = isDark ? '◑' : '◐';
    });
}

// Notification System - FIXED
function showNotification(message, type, duration) {
    type = type || 'success';
    duration = duration || 4000;
    
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(function(notification) {
        notification.remove();
    });
    
    const notification = document.createElement('div');
    notification.className = 'notification ' + type;
    
    const icons = {
        success: 'SUCCESS:',
        error: 'ERROR:',
        warning: 'WARNING:',
        info: 'INFO:'
    };
    
    notification.textContent = icons[type] ? icons[type] + ' ' + message : message;
    document.body.appendChild(notification);
    
    setTimeout(function() {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(function() {
        notification.classList.remove('show');
        setTimeout(function() {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, duration);
}

// Validation Utilities
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Data Processing Utilities
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatCurrency(amount) {
    return 'R' + amount.toLocaleString('en-ZA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Export Utilities - FIXED
function downloadCSV(data, filename) {
    if (!data || data.length === 0) {
        showNotification('No data available for export', 'error');
        return;
    }
    
    try {
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(function(row) {
                return headers.map(function(header) {
                    const value = row[header] || '';
                    return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
                        ? '"' + value.replace(/"/g, '""') + '"'
                        : value;
                }).join(',');
            })
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification('CSV file downloaded successfully!', 'success');
    } catch (error) {
        console.error('Failed to download CSV:', error);
        showNotification('Failed to download CSV file', 'error');
    }
}

function downloadJSON(data, filename) {
    try {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification('Data exported successfully!', 'success');
    } catch (error) {
        console.error('Failed to download JSON:', error);
        showNotification('Failed to download file', 'error');
    }
}

// Animation Utilities
function animateValue(elementId, targetValue, prefix, suffix, duration) {
    prefix = prefix || '';
    suffix = suffix || '';
    duration = duration || 1500;
    
    const element = document.getElementById(elementId);
    if (!element) return;

    const startValue = 0;
    const startTime = performance.now();

    function updateValue(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + (targetValue - startValue) * easeOut);
        element.textContent = prefix + currentValue.toLocaleString() + suffix;

        if (progress < 1) {
            requestAnimationFrame(updateValue);
        }
    }

    requestAnimationFrame(updateValue);
}

// Clear all data and reset to 2025 sample data
function resetTo2025Data() {
    // Clear all existing data
    localStorage.clear();
    
    // Force reload the page to use the updated sample data
    window.location.reload();
}

// Clear all existing data and reset to clean state
function clearAllData() {
    // Clear all localStorage data
    localStorage.removeItem('participants');
    localStorage.removeItem('budgetItems');
    localStorage.removeItem('expenses');
    localStorage.removeItem('settings');
    localStorage.removeItem('financeSettings');
    
    // Reset systemData to empty arrays
    systemData.participants = [];
    systemData.budgetItems = [];
    systemData.expenses = [];
    systemData.settings = { theme: 'light' };
    
    console.log('All data cleared - system reset to clean state');
}

// Initialize system on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeSystemData();
    loadTheme();
});

// Participant Management Functions - FIXED
function addParticipant(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    let programme = formData.get('programme');
    const customProgramme = formData.get('customProgramme');
    const startDate = formData.get('startDate');
    const notes = formData.get('notes');
    
    // Handle custom programme
    if (programme === 'custom') {
        if (!customProgramme || customProgramme.trim() === '') {
            showNotification('Please enter a custom programme name', 'error');
            return;
        }
        programme = customProgramme.trim();
    }
    
    if (!name || !email || !programme || !startDate) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    const participants = getParticipants();
    
    if (participants.find(function(p) { return p.email === email; })) {
        showNotification('A participant with this email already exists', 'error');
        return;
    }
    
    const newParticipant = {
        id: generateParticipantId(),
        name: name,
        email: email,
        phone: phone || '',
        programme: programme,
        startDate: startDate,
        progress: 0,
        status: 'Active',
        notes: notes || '',
        attendance: 0,
        revenue: 0,
        jobs: 0,
        createdAt: new Date().toISOString()
    };
    
    participants.push(newParticipant);
    saveParticipants(participants);
    
    closeAddParticipantModal();
    form.reset();
    
    if (typeof loadParticipants === 'function') {
        loadParticipants();
    }
    
    showNotification('Participant ' + newParticipant.name + ' added successfully!', 'success');
}

function generateParticipantId() {
    const participants = getParticipants();
    let maxId = 0;
    
    participants.forEach(function(p) {
        const idNum = parseInt(p.id.replace('P', ''));
        if (idNum > maxId) maxId = idNum;
    });
    
    return 'P' + String(maxId + 1).padStart(3, '0');
}

function removeParticipant(id) {
    if (!confirm('Are you sure you want to remove this participant?')) {
        return;
    }
    
    const participants = getParticipants();
    const filteredParticipants = participants.filter(function(p) {
        return p.id !== id;
    });
    
    if (filteredParticipants.length === participants.length) {
        showNotification('Participant not found', 'error');
        return;
    }
    
    saveParticipants(filteredParticipants);
    
    if (typeof loadParticipants === 'function') {
        loadParticipants();
    }
    
    showNotification('Participant removed successfully', 'success');
}

// Financial Management Functions - FIXED
function addBudgetItem(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const category = formData.get('category');
    const amount = formData.get('amount');
    const priority = formData.get('priority');
    const description = formData.get('description');
    
    if (!category || !amount || !priority) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    const budgetItems = getBudgetItems();
    
    if (budgetItems.find(function(item) {
        return item.category.toLowerCase() === category.toLowerCase();
    })) {
        showNotification('A budget item with this category already exists', 'error');
        return;
    }
    
    const newBudgetItem = {
        category: category,
        amount: parseFloat(amount),
        priority: priority,
        description: description || '',
        dateAdded: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
    };
    
    budgetItems.push(newBudgetItem);
    saveBudgetItems(budgetItems);
    
    closeAddBudgetModal();
    form.reset();
    
    if (typeof loadFinancialData === 'function') {
        loadFinancialData();
    }
    
    showNotification('Budget item "' + category + '" added successfully!', 'success');
}

function removeBudgetItem(index) {
    if (!confirm('Are you sure you want to remove this budget item?')) {
        return;
    }
    
    const budgetItems = getBudgetItems();
    
    if (index < 0 || index >= budgetItems.length) {
        showNotification('Budget item not found', 'error');
        return;
    }
    
    budgetItems.splice(index, 1);
    saveBudgetItems(budgetItems);
    
    if (typeof loadFinancialData === 'function') {
        loadFinancialData();
    }
    
    showNotification('Budget item removed successfully', 'success');
}

function addExpense(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const category = formData.get('category');
    const amount = formData.get('amount');
    const date = formData.get('date');
    const description = formData.get('description');
    
    if (!category || !amount || !date || !description) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    const expenses = getExpenses();
    const newExpense = {
        id: generateExpenseId(),
        category: category,
        amount: parseFloat(amount),
        date: date,
        description: description,
        createdAt: new Date().toISOString()
    };
    
    expenses.push(newExpense);
    saveExpenses(expenses);
    
    closeAddExpenseModal();
    form.reset();
    
    if (typeof loadFinancialData === 'function') {
        loadFinancialData();
    }
    
    showNotification('Expense of ' + formatCurrency(newExpense.amount) + ' added successfully!', 'success');
}

function generateExpenseId() {
    const expenses = getExpenses();
    let maxId = 0;
    
    expenses.forEach(function(e) {
        const idNum = parseInt(e.id.replace('EXP', ''));
        if (idNum > maxId) maxId = idNum;
    });
    
    return 'EXP' + String(maxId + 1).padStart(3, '0');
}

// Add Funds Function - FIXED
function addFunds() {
    const amount = prompt('Enter the amount to add to total funds:');
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        showNotification('R' + parseFloat(amount).toLocaleString() + ' funds allocation noted', 'success');
    } else if (amount) {
        showNotification('Please enter a valid amount', 'error');
    }
}

// Report Generation Functions - FIXED
function generateReport(type) {
    type = type || 'comprehensive';
    showNotification('Generating report...', 'info');
    
    setTimeout(function() {
        const participants = getParticipants();
        const filename = type + '-report-' + new Date().toISOString().split('T')[0] + '.csv';
        downloadCSV(participants, filename);
    }, 500);
}

function generateMonthlyReport() {
    showNotification('Generating monthly budget report...', 'info');
    
    setTimeout(function() {
        const budgetItems = getBudgetItems();
        const expenses = getExpenses();
        
        const reportData = budgetItems.map(function(item) {
            const spent = expenses
                .filter(function(e) { return e.category === item.category; })
                .reduce(function(sum, e) { return sum + e.amount; }, 0);
            
            return {
                Category: item.category,
                Budget: item.amount,
                Spent: spent,
                Remaining: item.amount - spent,
                Utilization: Math.round((spent / item.amount) * 100) + '%'
            };
        });
        
        downloadCSV(reportData, 'monthly-budget-report-' + new Date().toISOString().split('T')[0] + '.csv');
    }, 500);
}

function generateForecastReport() {
    showNotification('Generating financial forecast...', 'info');
    
    setTimeout(function() {
        const budgetItems = getBudgetItems();
        const expenses = getExpenses();
        
        const totalBudget = budgetItems.reduce(function(sum, item) { return sum + item.amount; }, 0);
        const totalExpenses = expenses.reduce(function(sum, exp) { return sum + exp.amount; }, 0);
        const averageMonthlyExpense = totalExpenses / Math.max(expenses.length, 1);
        
        const forecastData = [
            { Metric: 'Total Budget', Value: totalBudget },
            { Metric: 'Total Expenses', Value: totalExpenses },
            { Metric: 'Remaining Budget', Value: totalBudget - totalExpenses },
            { Metric: 'Average Expense', Value: averageMonthlyExpense.toFixed(2) },
            { Metric: 'Projected Monthly Burn', Value: averageMonthlyExpense.toFixed(2) }
        ];
        
        downloadCSV(forecastData, 'financial-forecast-' + new Date().toISOString().split('T')[0] + '.csv');
    }, 500);
}

function generateROIReport() {
    showNotification('Generating ROI analysis...', 'info');
    
    setTimeout(function() {
        const participants = getParticipants();
        const budgetItems = getBudgetItems();
        
        const totalInvestment = budgetItems.reduce(function(sum, item) { return sum + item.amount; }, 0);
        const totalRevenue = participants.reduce(function(sum, p) { return sum + (p.revenue || 0); }, 0);
        const totalJobs = participants.reduce(function(sum, p) { return sum + (p.jobs || 0); }, 0);
        
        const roiData = [
            { Metric: 'Total Investment', Value: totalInvestment },
            { Metric: 'Total Revenue Generated', Value: totalRevenue },
            { Metric: 'Total Jobs Created', Value: totalJobs },
            { Metric: 'ROI Percentage', Value: totalInvestment > 0 ? ((totalRevenue / totalInvestment) * 100).toFixed(2) + '%' : 'N/A' },
            { Metric: 'Revenue per Participant', Value: participants.length > 0 ? (totalRevenue / participants.length).toFixed(2) : 0 },
            { Metric: 'Jobs per Participant', Value: participants.length > 0 ? (totalJobs / participants.length).toFixed(2) : 0 }
        ];
        
        downloadCSV(roiData, 'roi-analysis-' + new Date().toISOString().split('T')[0] + '.csv');
    }, 500);
}

// Export Data Function - FIXED
function exportAllData() {
    const exportData = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        participants: getParticipants(),
        budgetItems: getBudgetItems(),
        expenses: getExpenses(),
        settings: systemData.settings
    };
    
    const filename = 'programme-data-backup-' + new Date().toISOString().split('T')[0] + '.json';
    downloadJSON(exportData, filename);
}

// Refresh Data Function - FIXED
function refreshData() {
    showNotification('Refreshing dashboard data...', 'info');
    
    setTimeout(function() {
        if (typeof updateDashboardStats === 'function') {
            updateDashboardStats();
        }
        if (typeof updateProgramProgress === 'function') {
            updateProgramProgress();
        }
        if (typeof updatePerformanceGrid === 'function') {
            updatePerformanceGrid();
        }
        if (typeof updateAnalytics === 'function') {
            updateAnalytics();
        }
        showNotification('Dashboard refreshed successfully!', 'success');
    }, 1000);
}

// Global refresh function for success rate updates
function refreshAllPages() {
    console.log('refreshAllPages called');
    
    // Update success rate on all pages
    updateSuccessRate();
    
    // Refresh dashboard if it exists
    if (typeof updateDashboardStats === 'function') {
        console.log('Calling updateDashboardStats');
        updateDashboardStats();
    }
    
    // Refresh analytics if it exists
    if (typeof updateAnalytics === 'function') {
        console.log('Calling updateAnalytics');
        updateAnalytics();
    }
    
    // Refresh participants list if it exists
    if (typeof loadParticipants === 'function') {
        console.log('Calling loadParticipants');
        loadParticipants();
    }
}

// Modal Functions
function showAddParticipantModal() {
    const modal = document.getElementById('addParticipantModal');
    if (modal) {
        modal.classList.add('active');
        setTimeout(function() {
            const firstInput = modal.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

function closeAddParticipantModal() {
    const modal = document.getElementById('addParticipantModal');
    if (modal) {
        modal.classList.remove('active');
        const form = modal.querySelector('form');
        if (form) form.reset();
        
        // Reset custom programme input
        const customInput = document.getElementById('customProgrammeInput');
        if (customInput) {
            customInput.style.display = 'none';
            customInput.required = false;
        }
    }
}

function showAddBudgetModal() {
    const modal = document.getElementById('addBudgetModal');
    if (modal) {
        modal.classList.add('active');
        setTimeout(function() {
            const firstInput = modal.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

function closeAddBudgetModal() {
    const modal = document.getElementById('addBudgetModal');
    if (modal) {
        modal.classList.remove('active');
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

function showAddExpenseModal() {
    const modal = document.getElementById('addExpenseModal');
    if (modal) {
        const dateInput = modal.querySelector('#expenseDate');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
        modal.classList.add('active');
    }
}

function closeAddExpenseModal() {
    const modal = document.getElementById('addExpenseModal');
    if (modal) {
        modal.classList.remove('active');
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

// Success Rate Management Functions
function calculateSuccessRate() {
    const participants = getParticipants();
    if (participants.length === 0) return 0;
    
    const completedParticipants = participants.filter(p => p.status === 'Completed').length;
    return Math.round((completedParticipants / participants.length) * 100);
}

function updateSuccessRate() {
    const successRate = calculateSuccessRate();
    
    // Debug logging
    console.log('Success rate calculated:', successRate);
    console.log('Participants:', getParticipants());
    
    // Update success rate on index page
    const heroSuccessElement = document.getElementById('heroSuccess');
    if (heroSuccessElement) {
        console.log('Updating heroSuccess element with value:', successRate);
        animateValue('heroSuccess', successRate, '', '%');
    } else {
        console.log('heroSuccess element not found');
    }
    
    // Update success rate on dashboard if it exists
    const dashboardSuccessElement = document.getElementById('dashboardSuccessRate');
    if (dashboardSuccessElement) {
        console.log('Updating dashboardSuccessRate element with value:', successRate);
        animateValue('dashboardSuccessRate', successRate, '', '%');
    }
    
    // Update success rate on analytics page if it exists
    const analyticsSuccessElement = document.getElementById('analyticsSuccessRate');
    if (analyticsSuccessElement) {
        console.log('Updating analyticsSuccessRate element with value:', successRate);
        animateValue('analyticsSuccessRate', successRate, '', '%');
    }
    
    return successRate;
}

function updateAllStats() {
    console.log('updateAllStats called');
    const participants = getParticipants();
    const programs = new Set(participants.map(p => p.programme)).size;
    const successRate = calculateSuccessRate();
    
    console.log('Stats update:', {
        participants: participants.length,
        programs: programs,
        successRate: successRate
    });
    
    // Update all stat displays
    animateValue('heroParticipants', participants.length);
    animateValue('heroPrograms', programs);
    animateValue('heroSuccess', successRate, '', '%');
    
    // Update dashboard stats if they exist
    const dashboardParticipants = document.getElementById('dashboardParticipants');
    const dashboardPrograms = document.getElementById('dashboardPrograms');
    const dashboardSuccess = document.getElementById('dashboardSuccessRate');
    
    if (dashboardParticipants) animateValue('dashboardParticipants', participants.length);
    if (dashboardPrograms) animateValue('dashboardPrograms', programs);
    if (dashboardSuccess) animateValue('dashboardSuccessRate', successRate, '', '%');
}

// Utility functions
function formatProgrammeName(programme) {
    const names = {
        'entrepreneurship': 'Entrepreneurship Training',
        'skills': 'Skills Development', 
        'leadership': 'Leadership Programme'
    };
    return names[programme] || programme;
}

function getPerformanceClass(progress) {
    if (progress >= 80) return 'high-performance';
    if (progress >= 60) return 'medium-performance';
    return 'low-performance';
}

// Close modals when clicking outside
document.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(function(modal) {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });
});

// Test function for debugging success rate
function testSuccessRate() {
    console.log('=== Success Rate Test ===');
    const participants = getParticipants();
    console.log('Total participants:', participants.length);
    console.log('All participants:', participants);
    
    const completed = participants.filter(p => p.status === 'Completed');
    console.log('Completed participants:', completed);
    
    const successRate = calculateSuccessRate();
    console.log('Calculated success rate:', successRate + '%');
    
    // Test updating the display
    updateSuccessRate();
    
    return successRate;
}

// Function to add a test participant
function addTestParticipant() {
    const participants = getParticipants();
    const testParticipant = {
        id: 'TEST001',
        name: 'Test Participant',
        email: 'test@example.com',
        phone: '1234567890',
        programme: 'entrepreneurship',
        startDate: '2025-01-01',
        progress: 0,
        status: 'Active',
        notes: 'Test participant for debugging',
        attendance: 0,
        revenue: 0,
        jobs: 0,
        createdAt: new Date().toISOString()
    };
    
    participants.push(testParticipant);
    saveParticipants(participants);
    console.log('Test participant added:', testParticipant);
    return testParticipant;
}

// Function to mark a participant as completed
function markParticipantCompleted(participantId) {
    const participants = getParticipants();
    const participant = participants.find(p => p.id === participantId);
    
    if (participant) {
        participant.status = 'Completed';
        participant.updatedAt = new Date().toISOString();
        saveParticipants(participants);
        console.log('Participant marked as completed:', participant);
        
        // Update success rate
        refreshAllPages();
        return participant;
    } else {
        console.log('Participant not found:', participantId);
        return null;
    }
}

console.log('Programme Management System loaded successfully');
console.log('Test functions available:');
console.log('- testSuccessRate() - Test current success rate calculation');
console.log('- addTestParticipant() - Add a test participant');
console.log('- markParticipantCompleted("TEST001") - Mark test participant as completed'); 