// ==================== WIDGET RENDERING FUNCTIONS ====================

// Utility function for time ago
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'Just now';
}

// ==================== CONVERSION RATES WIDGET ====================

function renderConversionRates() {
    const container = document.getElementById('conversion-metrics');
    if (!container || !window.APP_DATA) return;

    const pipelines = window.APP_DATA.pipelines || [];
    const stages = ["FOUND", "CONTACTED", "SCREENING_CALL", "ON_SITE_INTERVIEW", "OFFER_EXTENDED", "PLACED"];
    const counts = {};
    
    stages.forEach(stage => {
        counts[stage] = pipelines.filter(p => p.stages.some(s => s.name === stage)).length;
    });

    const metrics = [
        {
            label: 'Found',
            value: counts.FOUND || 0,
            rate: null
        },
        {
            label: 'Contacted',
            value: counts.CONTACTED || 0,
            rate: counts.FOUND ? ((counts.CONTACTED / counts.FOUND) * 100).toFixed(1) : 0
        },
        {
            label: 'Screened',
            value: counts.SCREENING_CALL || 0,
            rate: counts.CONTACTED ? ((counts.SCREENING_CALL / counts.CONTACTED) * 100).toFixed(1) : 0
        },
        {
            label: 'Interviewed',
            value: counts.ON_SITE_INTERVIEW || 0,
            rate: counts.SCREENING_CALL ? ((counts.ON_SITE_INTERVIEW / counts.SCREENING_CALL) * 100).toFixed(1) : 0
        }
    ];

    container.innerHTML = metrics.map(metric => `
        <div class="conversion-item">
            <div class="conversion-label">${metric.label}</div>
            <div class="conversion-value">
                ${metric.value}
                ${metric.rate ? `<span class="conversion-rate">(${metric.rate}%)</span>` : ''}
            </div>
        </div>
    `).join('');
}

// ==================== RECENT PLACEMENTS WIDGET ====================

function renderRecentPlacements() {
    const container = document.getElementById('placements-list');
    if (!container || !window.APP_DATA) return;

    const pipelines = window.APP_DATA.pipelines || [];
    const placements = pipelines.filter(p => p.stages.some(s => s.name === "PLACED"));

    if (placements.length === 0) {
        container.innerHTML = '<div class="empty-state">No recent placements</div>';
        return;
    }

    // Sort by most recent placement
    placements.sort((a, b) => {
        const aPlaced = a.stages.find(s => s.name === "PLACED");
        const bPlaced = b.stages.find(s => s.name === "PLACED");
        return new Date(bPlaced.enteredAt) - new Date(aPlaced.enteredAt);
    });

    container.innerHTML = placements.slice(0, 5).map(p => {
        const candidate = window.APP_DATA.candidates.find(c => c.id === p.candidateId);
        const role = window.APP_DATA.roles.find(r => r.id === p.roleId);
        const client = window.APP_DATA.clients.find(c => c.id === role?.clientId);
        const placedStage = p.stages.find(s => s.name === "PLACED");
        
        return `
            <div class="placement-item">
                <div class="placement-candidate">${candidate?.name || 'Unknown Candidate'}</div>
                <div class="placement-role">${role?.title || 'Unknown Role'}</div>
                <div class="placement-client">${client?.name || 'Unknown Client'}</div>
                <div class="placement-date">${new Date(placedStage.enteredAt).toLocaleDateString()}</div>
            </div>
        `;
    }).join('');
}

// ==================== NOTIFICATIONS WIDGET ====================

function renderNotifications() {
    const container = document.getElementById('notifications-list');
    if (!container || !window.APP_DATA) return;

    let notifications = [];
    
    // Create notifications from pipeline activities
    window.APP_DATA.pipelines.forEach(p => {
        const candidate = window.APP_DATA.candidates.find(c => c.id === p.candidateId);
        const role = window.APP_DATA.roles.find(r => r.id === p.roleId);
        const client = window.APP_DATA.clients.find(c => c.id === role?.clientId);
        
        p.stages.forEach(stage => {
            if (stage.enteredAt) {
                const stageName = stage.name.replace(/_/g, ' ').toLowerCase();
                notifications.push({
                    text: `${candidate?.name || 'Unknown'} entered ${stageName} for ${role?.title || 'Unknown Role'} at ${client?.name || 'Unknown Client'}`,
                    time: stage.enteredAt,
                    type: stage.name
                });
            }
        });
    });

    // Add request notifications
    if (window.APP_REQUESTS?.requests) {
        window.APP_REQUESTS.requests.forEach(req => {
            const role = window.APP_DATA.roles.find(r => r.id === req.roleId);
            const client = window.APP_DATA.clients.find(c => c.id === req.clientId);
            
            notifications.push({
                text: `Request ${req.status.toLowerCase()} for ${role?.title || 'Unknown Role'} at ${client?.name || 'Unknown Client'}`,
                time: req.submittedAt,
                type: 'REQUEST'
            });
        });
    }

    // Sort by most recent
    notifications.sort((a, b) => new Date(b.time) - new Date(a.time));

    if (notifications.length === 0) {
        container.innerHTML = '<div class="empty-state">No recent notifications</div>';
        return;
    }

    container.innerHTML = notifications.slice(0, 8).map(n => `
        <div class="notification-item">
            <div class="notification-text">${n.text}</div>
            <div class="notification-time">${getTimeAgo(new Date(n.time))}</div>
        </div>
    `).join('');
}

// ==================== CALENDAR WIDGET ====================

function renderCalendarPreview() {
    const container = document.getElementById('calendar-preview');
    if (!container || !window.APP_DATA) return;

    // Generate upcoming events based on pipeline data
    const now = new Date();
    const upcomingEvents = [];
    
    window.APP_DATA.pipelines.forEach((pipeline, index) => {
        if (index < 5) { // Limit to 5 events for preview
            const candidate = window.APP_DATA.candidates.find(c => c.id === pipeline.candidateId);
            const role = window.APP_DATA.roles.find(r => r.id === pipeline.roleId);
            const lastStage = pipeline.stages[pipeline.stages.length - 1];
            
            if (lastStage && candidate && role) {
                const eventDate = new Date(now.getTime() + (index + 1) * 86400000); // Add days
                let eventType = 'Follow-up';
                
                switch (lastStage.name) {
                    case 'CONTACTED':
                        eventType = 'Schedule Screening';
                        break;
                    case 'SCREENING_CALL':
                        eventType = 'Interview Setup';
                        break;
                    case 'ON_SITE_INTERVIEW':
                        eventType = 'Follow-up';
                        break;
                }
                
                upcomingEvents.push({
                    time: eventDate.toLocaleDateString(),
                    title: `${eventType}: ${candidate.name}`,
                    type: lastStage.name
                });
            }
        }
    });

    container.innerHTML = `
        <div class="calendar-header">
            <div class="calendar-title">Upcoming Events</div>
        </div>
        <div class="calendar-events">
            ${upcomingEvents.length > 0 ? upcomingEvents.map(event => `
                <div class="calendar-event">
                    <div class="event-time">${event.time}</div>
                    <div class="event-title">${event.title}</div>
                    <div class="event-type"></div>
                </div>
            `).join('') : '<div class="empty-state">No upcoming events</div>'}
        </div>
    `;
}

// ==================== CLIENTS WIDGET ====================

function renderClients() {
    const container = document.getElementById('clients-list');
    if (!container || !window.APP_DATA) return;

    const clients = window.APP_DATA.clients || [];
    
    if (clients.length === 0) {
        container.innerHTML = '<div class="empty-state">No clients found</div>';
        return;
    }

    container.innerHTML = clients.map(client => {
        const roles = window.APP_DATA.roles.filter(r => r.clientId === client.id);
        const openRoles = roles.filter(r => r.status === 'OPEN').length;
        const filledRoles = roles.filter(r => r.status === 'FILLED').length;
        const candidates = window.APP_DATA.pipelines.filter(p => {
            const role = window.APP_DATA.roles.find(r => r.id === p.roleId);
            return role && role.clientId === client.id;
        }).length;

        return `
            <div class="client-item">
                <div class="client-name">${client.name}</div>
                <div class="client-industry">${client.industry} • ${client.location}</div>
                <div class="client-stats">
                    <span class="client-stat total">${roles.length} roles</span>
                    <span class="client-stat open">${openRoles} open</span>
                    <span class="client-stat filled">${filledRoles} filled</span>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== REQUESTS WIDGET ====================

function renderRequests() {
    const container = document.getElementById('requests-list');
    if (!container || !window.APP_REQUESTS) return;

    const requests = window.APP_REQUESTS.requests || [];
    
    if (requests.length === 0) {
        container.innerHTML = '<div class="empty-state">No requests found</div>';
        return;
    }

    // Sort by most recent
    const sortedRequests = requests.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    container.innerHTML = sortedRequests.slice(0, 6).map(request => {
        const role = window.APP_DATA.roles.find(r => r.id === request.roleId);
        
        return `
            <div class="request-item">
                <div class="request-header">
                    <div class="request-id">${request.id.split('_').slice(-1)[0]}</div>
                    <div class="request-status ${request.status.toLowerCase().replace('_', '-')}">${request.status.replace('_', ' ')}</div>
                </div>
                <div class="request-role">${role?.title || 'Unknown Role'}</div>
                <div class="request-candidates">${request.numCandidatesScraped || 0} candidates found</div>
            </div>
        `;
    }).join('');
}

// ==================== AI CHAT WIDGET ====================

function renderAIChat() {
    const container = document.getElementById('chat-preview');
    if (!container) return;

    const openRoles = window.APP_DATA?.roles?.filter(r => r.status === 'OPEN').length || 0;
    const activeCandidates = window.APP_DATA?.pipelines?.length || 0;

    container.innerHTML = `
        <div class="chat-message">
            <div class="chat-sender">AI Assistant</div>
            <div class="chat-text">Hello! You have ${openRoles} open roles and ${activeCandidates} active candidates. How can I help you today?</div>
        </div>
        <div class="chat-input-area">
            <div class="chat-input">
                <input type="text" placeholder="Ask me anything about your recruitment data..." disabled>
                <button class="chat-send-btn" disabled>Send</button>
            </div>
        </div>
    `;
}

// ==================== ROLE PROGRESS WIDGET ====================

function renderRoleProgress() {
    const container = document.getElementById('role-progress-list');
    if (!container || !window.APP_DATA) return;

    const roles = window.APP_DATA.roles || [];
    
    if (roles.length === 0) {
        container.innerHTML = '<div class="empty-state">No roles found</div>';
        return;
    }

    container.innerHTML = roles.map(role => {
        const client = window.APP_DATA.clients.find(c => c.id === role.clientId);
        const rolePipelines = window.APP_DATA.pipelines.filter(p => p.roleId === role.id);
        
        // Calculate progress
        let maxStageReached = 0;
        const stageOrder = ["FOUND", "CONTACTED", "SCREENING_CALL", "ON_SITE_INTERVIEW", "OFFER_EXTENDED", "PLACED"];
        
        rolePipelines.forEach(pipeline => {
            pipeline.stages.forEach(stage => {
                const stageIndex = stageOrder.indexOf(stage.name);
                if (stageIndex > maxStageReached) {
                    maxStageReached = stageIndex;
                }
            });
        });
        
        const progress = role.status === 'FILLED' ? 100 : Math.min((maxStageReached / (stageOrder.length - 1)) * 100, 90);
        
        return `
            <div class="role-progress-item">
                <div class="role-title">${role.title}</div>
                <div class="role-client">${client?.name || 'Unknown Client'}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-text">${Math.round(progress)}% complete (${rolePipelines.length} candidates)</div>
            </div>
        `;
    }).join('');
}

// ==================== PIPELINE FUNNEL WIDGET ====================

function renderPipelineFunnel() {
    const container = document.getElementById('funnel-chart');
    if (!container || !window.APP_DATA) return;

    const stages = ["FOUND", "CONTACTED", "SCREENING_CALL", "ON_SITE_INTERVIEW", "OFFER_EXTENDED", "PLACED"];
    const counts = {};
    
    stages.forEach(stage => {
        counts[stage] = window.APP_DATA.pipelines.filter(p => 
            p.stages.some(s => s.name === stage)
        ).length;
    });

    const maxCount = Math.max(...Object.values(counts)) || 1;
    
    container.innerHTML = stages.map(stage => {
        const count = counts[stage] || 0;
        const percentage = (count / maxCount) * 100;
        const stageName = stage.replace(/_/g, ' ');
        
        return `
            <div class="funnel-stage">
                <div class="funnel-bar" style="width: ${Math.max(percentage, 15)}%">
                    <span class="funnel-label">${stageName}</span>
                    <span class="funnel-count">${count}</span>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== TIME TO FILL WIDGET ====================

function renderTimeToFill() {
    const container = document.getElementById('time-to-fill-list');
    if (!container || !window.APP_DATA) return;

    const filled = window.APP_DATA.roles.filter(r => r.status === "FILLED" && r.openDate && r.closeDate);
    
    if (filled.length === 0) {
        container.innerHTML = '<div class="empty-state">No completed roles with fill data</div>';
        return;
    }

    const times = filled.map(role => {
        const open = new Date(role.openDate);
        const close = new Date(role.closeDate);
        return Math.round((close - open) / (1000 * 60 * 60 * 24));
    });
    
    const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);

    container.innerHTML = `
        <div class="time-summary">
            <div class="time-average">${avgTime}</div>
            <div class="time-label">Average Days</div>
        </div>
        ${filled.map((role, index) => {
            const client = window.APP_DATA.clients.find(c => c.id === role.clientId);
            const days = times[index];
            
            return `
                <div class="time-item">
                    <div class="time-role-info">
                        <div class="time-role-title">${role.title}</div>
                        <div class="time-role-client">${client?.name || 'Unknown'}</div>
                    </div>
                    <div class="time-days ${days > avgTime ? 'slow' : 'fast'}">${days}d</div>
                </div>
            `;
        }).join('')}
    `;
}

// ==================== CUSTOM CHART WIDGET ====================

function renderCustomChart() {
    const container = document.getElementById('custom-chart');
    if (!container || !window.APP_DATA) return;

    // Create a simple chart showing candidates by client
    const clientData = {};
    
    window.APP_DATA.clients.forEach(client => {
        const clientPipelines = window.APP_DATA.pipelines.filter(p => {
            const role = window.APP_DATA.roles.find(r => r.id === p.roleId);
            return role && role.clientId === client.id;
        });
        
        clientData[client.name] = clientPipelines.length;
    });

    const maxValue = Math.max(...Object.values(clientData)) || 1;

    container.innerHTML = `
        <div class="chart-title">Candidates by Client</div>
        <div class="chart-container">
            ${Object.entries(clientData).map(([clientName, count]) => `
                <div class="chart-bar">
                    <div class="bar-fill" style="height: ${Math.max((count / maxValue) * 100, 10)}%"></div>
                    <div class="bar-value">${count}</div>
                    <div class="bar-label">${clientName.split(' ')[0]}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// ==================== MAIN RENDER FUNCTION ====================

function renderAllWidgets() {
    if (!window.APP_DATA || !window.APP_REQUESTS) {
        console.warn('Data not loaded yet');
        return;
    }

    // Render all visible widgets
    Object.keys(WIDGET_CONFIG || {}).forEach(widgetId => {
        const widget = document.getElementById(widgetId);
        if (widget && !widget.classList.contains('widget-hidden')) {
            renderWidget(widgetId);
        }
    });
}