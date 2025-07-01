# HC Resources Demo Webapp UI

## **Project Overview**

This is a comprehensive demonstrative **Single Page Application (SPA)** recruitment management dashboard built with vanilla HTML, CSS, and JavaScript, with supportive demo data written in json.
This readme describes the intended functions of the demo, as well as the functions that non-functioning sections will have.

## **Project Structure**

### **Core Files:**
- **`home.html`** - Main SPA with all views and widget structure
- **`style.css`** - Complete styling system with CSS custom properties
- **`app.js`** - Main application logic, navigation, and widget management
- **`widget_renderer.js`** - Widget rendering functions and data visualization
- **`data/data.json`** - Sample recruitment data (clients, roles, candidates, pipelines)
- **`data/requests.json`** - Request workflow data

### **Key Technologies:**
- **GridStack.js** - Drag-and-drop dashboard grid system
- **BoxIcons** - Icon library for UI elements
- **Inter Font** - Typography system
- **Vanilla JavaScript** - No frameworks, pure JS implementation

## **Architecture & Design Patterns**

### **Single Page Application (SPA):**
- **View-based navigation** - Each "page" is a hidden/shown `.view` element
- **Hash-based routing** - URL hash determines active view
- **Consistent sidebar** - Navigation persists across all views
- **Shared data layer** - Global `window.APP_DATA` and `window.APP_REQUESTS`

### **Widget System:**
- **Draggable & resizable widgets** using GridStack.js
- **Persistent layouts** saved to localStorage
- **Add/remove widgets dynamically** with modal interface
- **Widget configuration system** with metadata for each widget type

### **Data Flow:**
```
JSON Files → loadData() → Global Variables → Widget Renderers → UI Updates
```

## **Dashboard Features**

### **Default Widgets:**
1. **Conversion Rates** - Pipeline stage conversion analytics
2. **Recent Placements** - Latest successful candidate placements
3. **Notifications** - Activity feed from pipeline and requests
4. **Calendar Preview** - Upcoming events and interviews
5. **Clients** - Client statistics and role summaries
6. **Requests** - Request status overview
7. **AI Chat Preview** - Quick AI assistant interface

### **Optional Widgets:**
1. **Role Fill Progress** - Progress bars for open positions
2. **Pipeline Funnel** - Visual funnel of candidate stages
3. **Time to Fill** - Analytics on placement speed
4. **Custom Chart** - Configurable data visualization

## 🔗 **Complete Page System**

### **1. Reports & Analytics Page**
- **Executive Summary** with key KPIs
- **Pipeline Analytics** with funnel visualization
- **Time-to-Fill Analysis** by role and client
- **Client Performance Metrics** with success rates
- **Recruiter Performance** dashboards
- **Market Analysis** including skills demand and salary trends
- **Custom Report Builder** with saved templates

### **2. Calendar Page**
- **Multi-view calendar** (Month, Week, Day, Timeline)
- **Event management** for interviews, meetings, deadlines
- **Resource scheduling** with room booking
- **Candidate timeline view** showing progression
- **Batch scheduling tools** for efficiency
- **Integration capabilities** for external calendars

### **3. AI Chat Assistant Page**
- **Natural language querying** of recruitment data
- **Intelligent insights generation** with bottleneck detection
- **Candidate matching** with AI-powered success predictions
- **Predictive analytics** for forecasting
- **Report generation** in conversational format
- **Knowledge base access** for best practices
- **Conversation history** with search capabilities

### **4. Requests Management Page**
- **Request dashboard** with SLA tracking
- **Multi-view interface** (List and Kanban)
- **4-step request creation wizard**
- **Progress tracking** with real-time updates
- **Client communication hub**
- **Advanced filtering and sorting**
- **Detailed sidebar** for request management

## **Design System**

### **CSS Custom Properties:**
```css
--primary-color: #121F36
--info-color: #3B82F6
--success-color: #22C55E
--warning-color: #F59E0B
--error-color: #EF4444
```

### **Theme Support:**
- **Light/Dark mode toggle** in sidebar
- **Automatic theme switching** with CSS custom properties
- **Consistent color palette** across all components

## **Data Model**

### **Core Entities:**
```javascript
// Clients - Companies using recruitment services
clients: [{ id, name, industry, location }]

// Roles - Job positions to fill
roles: [{ id, clientId, title, status, openDate, closeDate }]

// Candidates - People in the recruitment pipeline
candidates: [{ id, name, email, skills, currentEmployer }]

// Pipelines - Candidate progression through stages
pipelines: [{ 
  pipelineId, candidateId, roleId,
  stages: [{ name, enteredAt, completedAt, outcome }]
}]

// Requests - Sourcing workflow management
requests: [{ 
  id, clientId, roleId, status, submittedAt,
  numCandidatesScraped, parameters
}]
```

### **Pipeline Stages:**
1. **FOUND** - Candidate identified
2. **CONTACTED** - Initial outreach completed
3. **SCREENING_CALL** - Phone/video screening done
4. **ON_SITE_INTERVIEW** - In-person/final interview
5. **OFFER_EXTENDED** - Job offer made
6. **PLACED** - Candidate successfully hired

## **Technical Implementation Details**

### **Navigation System:**
```javascript
// View switching via data attributes
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        const targetView = link.dataset.view;
        // Hide all views, show target
    });
});
```

### **Widget Management:**
```javascript
// Dynamic widget addition/removal
function addWidget(widgetId) {
    widget.classList.remove('widget-hidden');
    dashboardGrid.makeWidget(widget, config.size);
    renderWidget(widgetId);
}
```

### **Data Loading:**
```javascript
// Async data loading with fallback
async function loadData() {
    try {
        const [data, requests] = await Promise.all([
            fetch('./data/data.json'),
            fetch('./data/requests.json')
        ]);
        return { data: await data.json(), requests: await requests.json() };
    } catch (error) {
        return getFallbackData(); // Hardcoded sample data
    }
}
```

## **Current State & Functionality**

The demo is **partially functional** with:
- ✅ **Working dashboard** with draggable widgets
- ✅ **Complete navigation system** between all pages
- ✅ **Data integration** with JSON files
- ✅ **Responsive design** for all screen sizes
- ✅ **Fixed widget controls** with proper button behavior
- ✅ **Comprehensive styling** with theme support
- ✅ **Mock data** for demonstration purposes
