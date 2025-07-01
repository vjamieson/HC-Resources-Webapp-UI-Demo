// ==================== DATA LOADING ====================

async function loadData() {
    try {
        const [dataRes, requestsRes] = await Promise.all([
            fetch('./data/data.json'),
            fetch('./data/requests.json')
        ]);
        
        if (!dataRes.ok || !requestsRes.ok) {
            throw new Error('Failed to load data files');
        }
        
        const [data, requests] = await Promise.all([
            dataRes.json(),
            requestsRes.json()
        ]);
        
        return { data, requests };
    } catch (error) {
        console.error('Data loading failed, using fallback data:', error);
        return getFallbackData();
    }
}

function getFallbackData() {
    return {
        data: {
            clients: [
                { id: "cli_001", name: "Acme Corp", industry: "Manufacturing", location: "New York, NY" },
                { id: "cli_002", name: "BetaTech Solutions", industry: "Software", location: "San Francisco, CA" },
                { id: "cli_003", name: "GreenHealth Inc", industry: "Healthcare", location: "Chicago, IL" }
            ],
            roles: [
                { id: "cli001_role001", clientId: "cli_001", title: "Mechanical Engineer", status: "OPEN", openDate: "2025-06-01" },
                { id: "cli001_role002", clientId: "cli_001", title: "Operations Manager", status: "FILLED", openDate: "2025-05-15", closeDate: "2025-06-20" },
                { id: "cli002_role001", clientId: "cli_002", title: "Frontend Engineer", status: "OPEN", openDate: "2025-06-05" },
                { id: "cli003_role001", clientId: "cli_003", title: "Clinical Data Analyst", status: "FILLED", openDate: "2025-05-20", closeDate: "2025-06-18" }
            ],
            candidates: [
                { id: "cli001_role001_cand001", name: "Candidate 001", email: "candidate.001@example.com", skills: ["JavaScript", "AWS", "Excel"] },
                { id: "cli001_role001_cand002", name: "Candidate 002", email: "candidate.002@example.com", skills: ["R", "JavaScript", "SQL"] },
                { id: "cli002_role001_cand001", name: "Candidate 003", email: "candidate.003@example.com", skills: ["Python", "React", "R"] }
            ],
            pipelines: [
                {
                    pipelineId: "pipe_cli001_role001_1",
                    candidateId: "cli001_role001_cand001",
                    roleId: "cli001_role001",
                    stages: [
                        { name: "FOUND", enteredAt: "2025-06-16T02:51:25Z" },
                        { name: "CONTACTED", enteredAt: "2025-06-19T02:51:25Z" },
                        { name: "SCREENING_CALL", enteredAt: "2025-06-21T02:51:25Z" }
                    ]
                },
                {
                    pipelineId: "pipe_cli001_role001_2",
                    candidateId: "cli001_role001_cand002",
                    roleId: "cli001_role001",
                    stages: [
                        { name: "FOUND", enteredAt: "2025-06-24T01:59:09Z" },
                        { name: "CONTACTED", enteredAt: "2025-06-27T01:59:09Z" }
                    ]
                }
            ]
        },
        requests: {
            requests: [
                { id: "req_cli001_role001_1", clientId: "cli_001", roleId: "cli001_role001", status: "COMPLETED", submittedAt: "2025-06-02T09:15:00Z", numCandidatesScraped: 3 },
                { id: "req_cli002_role001_1", clientId: "cli_002", roleId: "cli002_role001", status: "IN_PROGRESS", submittedAt: "2025-06-25T09:45:00Z", numCandidatesScraped: 1 }
            ]
        }
    };
}

// ==================== WIDGET CONFIGURATION ====================

const WIDGET_CONFIG = {
    'widget-conversion-rates': {
        title: 'Conversion Rates',
        description: 'Shows conversion rates through pipeline stages',
        icon: 'bx-trending-up',
        isDefault: true,
        size: { w: 4, h: 2 }
    },
    'widget-recent-placements': {
        title: 'Recent Placements',
        description: 'Latest successful placements',
        icon: 'bx-user-check',
        isDefault: true,
        size: { w: 3, h: 2 }
    },
    'widget-notifications': {
        title: 'Notifications',
        description: 'Recent activity notifications',
        icon: 'bx-bell',
        isDefault: true,
        size: { w: 3, h: 2 }
    },
    'widget-calendar': {
        title: 'Calendar',
        description: 'Calendar overview and upcoming events',
        icon: 'bx-calendar',
        isDefault: true,
        size: { w: 6, h: 4 }
    },
    'widget-clients': {
        title: 'Clients',
        description: 'Client information and statistics',
        icon: 'bx-buildings',
        isDefault: true,
        size: { w: 3, h: 2 }
    },
    'widget-requests': {
        title: 'Requests',
        description: 'Request status and management',
        icon: 'bx-task',
        isDefault: true,
        size: { w: 3, h: 2 }
    },
    'widget-ai-chat': {
        title: 'AI Chat',
        description: 'AI-powered chat assistance',
        icon: 'bx-bot',
        isDefault: true,
        size: { w: 4, h: 3 }
    },
    'widget-role-progress': {
        title: 'Role Fill Progress',
        description: 'Progress on filling open roles',
        icon: 'bx-bar-chart',
        isDefault: false,
        size: { w: 4, h: 2 }
    },
    'widget-pipeline-funnel': {
        title: 'Pipeline Funnel',
        description: 'Visualization of candidate pipeline',
        icon: 'bx-stats',
        isDefault: false,
        size: { w: 4, h: 3 }
    },
    'widget-time-to-fill': {
        title: 'Time to Fill',
        description: 'Average time to fill positions',
        icon: 'bx-time',
        isDefault: false,
        size: { w: 4, h: 2 }
    },
    'widget-custom-chart': {
        title: 'Custom Chart',
        description: 'Customizable data visualization',
        icon: 'bx-line-chart',
        isDefault: false,
        size: { w: 6, h: 4 }
    }
};

// ==================== DASHBOARD GRID MANAGEMENT ====================

let dashboardGrid = null;
let isRemoveMode = false;

function initializeDashboardGrid() {
    const gridContainer = document.getElementById('dashboard-grid');
    if (!gridContainer || dashboardGrid) return;

    // Initialize GridStack
    dashboardGrid = GridStack.init({
        column: 12,
        cellHeight: 80,
        margin: 15,
        float: false,
        animate: true,
        resizable: {
            handles: 'se'
        },
        draggable: {
            handle: '.widget-header'
        }
    }, gridContainer);

    // Load saved layout or use default
    loadDashboardLayout();

    // Save layout on changes
    dashboardGrid.on('change', saveDashboardLayout);
}

function loadDashboardLayout() {
    const saved = localStorage.getItem('dashboard-layout');
    if (saved) {
        try {
            const layout = JSON.parse(saved);
            layout.forEach(item => {
                const widget = document.getElementById(item.id);
                if (widget && !widget.classList.contains('widget-hidden')) {
                    dashboardGrid.update(widget, item);
                }
            });
        } catch (e) {
            console.warn('Could not restore saved layout');
        }
    }
}

function saveDashboardLayout() {
    if (!dashboardGrid) return;
    
    const layout = [];
    dashboardGrid.getGridItems().forEach(el => {
        const node = el.gridstackNode;
        layout.push({
            id: el.id,
            x: node.x,
            y: node.y,
            w: node.w,
            h: node.h
        });
    });
    
    localStorage.setItem('dashboard-layout', JSON.stringify(layout));
}

function resetDashboardLayout() {
    if (confirm('Are you sure you want to reset the dashboard layout to default?')) {
        localStorage.removeItem('dashboard-layout');
        location.reload();
    }
}

// ==================== WIDGET MANAGEMENT ====================

function showAddWidgetModal() {
    const modal = document.getElementById('add-widget-modal');
    const optionsContainer = document.getElementById('widget-options');
    
    // Get hidden widgets
    const hiddenWidgets = Object.entries(WIDGET_CONFIG).filter(([id, config]) => {
        const widget = document.getElementById(id);
        return widget && widget.classList.contains('widget-hidden');
    });
    
    if (hiddenWidgets.length === 0) {
        alert('All widgets are already on the dashboard!');
        return;
    }
    
    // Populate modal with available widgets
    optionsContainer.innerHTML = hiddenWidgets.map(([id, config]) => `
        <div class="widget-option" data-widget-id="${id}">
            <div class="widget-option-title">
                <i class='bx ${config.icon}'></i>
                ${config.title}
            </div>
            <div class="widget-option-desc">${config.description}</div>
        </div>
    `).join('');
    
    // Add click handlers
    optionsContainer.querySelectorAll('.widget-option').forEach(option => {
        option.addEventListener('click', () => {
            const widgetId = option.dataset.widgetId;
            addWidget(widgetId);
            hideAddWidgetModal();
        });
    });
    
    modal.classList.add('active');
}

function hideAddWidgetModal() {
    document.getElementById('add-widget-modal').classList.remove('active');
}

function addWidget(widgetId) {
    const widget = document.getElementById(widgetId);
    const config = WIDGET_CONFIG[widgetId];
    
    if (!widget || !config) return;
    
    // Show widget
    widget.classList.remove('widget-hidden');
    
    // Add to grid
    if (dashboardGrid) {
        dashboardGrid.makeWidget(widget, {
            w: config.size.w,
            h: config.size.h,
            autoPosition: true
        });
    }
    
    // Render widget content
    renderWidget(widgetId);
}

// ==================== FIXED WIDGET REMOVAL SYSTEM ====================

function toggleRemoveMode() {
    isRemoveMode = !isRemoveMode;
    const removeBtn = document.getElementById('remove-widget-btn');
    const doneBtn = document.getElementById('done-removing-btn');
    const gridContainer = document.getElementById('dashboard-grid');
    
    console.log('Toggle remove mode:', isRemoveMode);
    
    if (isRemoveMode) {
        // Enter remove mode
        if (removeBtn) removeBtn.style.display = 'none';
        if (doneBtn) doneBtn.style.display = 'flex';
        if (gridContainer) gridContainer.classList.add('remove-mode');
        
        // Add click handlers for removal
        if (gridContainer) {
            gridContainer.querySelectorAll('.grid-stack-item:not(.widget-hidden)').forEach(widget => {
                widget.addEventListener('click', handleWidgetRemoval);
            });
        }
    } else {
        // Exit remove mode
        if (removeBtn) removeBtn.style.display = 'flex';
        if (doneBtn) doneBtn.style.display = 'none';
        if (gridContainer) gridContainer.classList.remove('remove-mode');
        
        // Remove click handlers
        if (gridContainer) {
            gridContainer.querySelectorAll('.grid-stack-item').forEach(widget => {
                widget.removeEventListener('click', handleWidgetRemoval);
            });
        }
    }
}

function handleWidgetRemoval(e) {
    if (!isRemoveMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const widget = e.currentTarget;
    const config = WIDGET_CONFIG[widget.id];
    
    if (confirm(`Remove ${config?.title || 'this'} widget?`)) {
        removeWidget(widget.id);
    }
}

function removeWidget(widgetId) {
    const widget = document.getElementById(widgetId);
    
    if (!widget) return;
    
    // Remove from grid
    if (dashboardGrid) {
        dashboardGrid.removeWidget(widget, false);
    }
    
    // Hide widget
    widget.classList.add('widget-hidden');
}

// ==================== WIDGET RENDERING ====================

function renderWidget(widgetId) {
    switch (widgetId) {
        case 'widget-conversion-rates':
            renderConversionRates();
            break;
        case 'widget-recent-placements':
            renderRecentPlacements();
            break;
        case 'widget-notifications':
            renderNotifications();
            break;
        case 'widget-calendar':
            renderCalendarPreview();
            break;
        case 'widget-clients':
            renderClients();
            break;
        case 'widget-requests':
            renderRequests();
            break;
        case 'widget-ai-chat':
            renderAIChat();
            break;
        case 'widget-role-progress':
            renderRoleProgress();
            break;
        case 'widget-pipeline-funnel':
            renderPipelineFunnel();
            break;
        case 'widget-time-to-fill':
            renderTimeToFill();
            break;
        case 'widget-custom-chart':
            renderCustomChart();
            break;
    }
}

function renderAllVisibleWidgets() {
    Object.keys(WIDGET_CONFIG).forEach(widgetId => {
        const widget = document.getElementById(widgetId);
        if (widget && !widget.classList.contains('widget-hidden')) {
            renderWidget(widgetId);
        }
    });
}

// ==================== NAVIGATION & APP INITIALIZATION ====================

function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const views = document.querySelectorAll('.view');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetView = link.dataset.view;
            
            // Hide all views
            views.forEach(view => {
                view.hidden = true;
                view.classList.remove('active');
            });
            
            // Show target view
            const view = document.getElementById(targetView);
            if (view) {
                view.hidden = false;
                view.classList.add('active');
                
                // Initialize dashboard grid if switching to dashboard
                if (targetView === 'dashboard') {
                    setTimeout(initializeDashboardGrid, 100);
                }
            }
        });
    });
    
    // Handle hash navigation
    const hash = location.hash.slice(1);
    if (hash) {
        const link = document.querySelector(`.nav-link[data-view="${hash}"]`);
        if (link) link.click();
    }
}

function initializeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggle = document.querySelector('.toggle');
    const searchBtn = document.querySelector('.search-box');
    const modeSwitch = document.querySelector('.toggle-switch');
    const modeText = document.querySelector('.mode-text');
    const body = document.body;
    
    // Sidebar toggle
    if (toggle) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('close');
        });
    }
    
    // Search box click
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            sidebar.classList.remove('close');
        });
    }
    
    // Dark mode toggle
    if (modeSwitch) {
        modeSwitch.addEventListener('click', () => {
            body.classList.toggle('dark');
            if (modeText) {
                modeText.textContent = body.classList.contains('dark') ? 'Light Mode' : 'Dark Mode';
            }
        });
    }
}

function initializeDrillDownButtons() {
    document.addEventListener('click', (e) => {
        const drillBtn = e.target.closest('.drill-btn');
        if (!drillBtn) return;
        
        const targetView = drillBtn.dataset.target;
        if (!targetView) return;
        
        // Switch to target view
        const views = document.querySelectorAll('.view');
        views.forEach(view => {
            view.hidden = true;
            view.classList.remove('active');
        });
        
        const view = document.getElementById(targetView);
        if (view) {
            view.hidden = false;
            view.classList.add('active');
            location.hash = targetView;
        }
    });
}

function initializeControls() {
    // Add widget button
    const addBtn = document.getElementById('add-widget-btn');
    if (addBtn) {
        addBtn.addEventListener('click', showAddWidgetModal);
    }
    
    // Remove widget button
    const removeBtn = document.getElementById('remove-widget-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', toggleRemoveMode);
    }
    
    // Done removing button - NEW
    const doneBtn = document.getElementById('done-removing-btn');
    if (doneBtn) {
        doneBtn.addEventListener('click', toggleRemoveMode);
    }
    
    // Reset layout button
    const resetBtn = document.getElementById('reset-layout-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetDashboardLayout);
    }
    
    // Modal close button
    const closeModalBtn = document.getElementById('close-add-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideAddWidgetModal);
    }
    
    // Modal overlay click
    const modalOverlay = document.getElementById('add-widget-modal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                hideAddWidgetModal();
            }
        });
    }
}

// ==================== APP INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', async () => {
    // Load data
    const { data, requests } = await loadData();
    window.APP_DATA = data;
    window.APP_REQUESTS = requests;
    
    // Initialize app components
    initializeNavigation();
    initializeSidebar();
    initializeDrillDownButtons();
    initializeControls();
    
    // Initialize dashboard
    setTimeout(() => {
        initializeDashboardGrid();
        renderAllVisibleWidgets();
    }, 200);
});