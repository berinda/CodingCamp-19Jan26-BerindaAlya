// DOM Elements
const homeBtn = document.getElementById('homeBtn');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskForm = document.getElementById('taskForm');
const todoForm = document.getElementById('todoForm');
const tasksList = document.getElementById('tasksList');
const filterSelect = document.getElementById('filterSelect');
const calendarBtn = document.getElementById('calendarBtn');
const calendarView = document.getElementById('calendarView');
const calendarDays = document.getElementById('calendarDays');
const calendarTitle = document.getElementById('calendarTitle');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const formOverlay = document.getElementById('formOverlay');
const workBtn = document.getElementById('workBtn');
const personalBtn = document.getElementById('personalBtn');
const taskDetailPanel = document.getElementById('taskDetailPanel');
const closeDetailBtn = document.getElementById('closeDetailBtn');

// Tasks array
let tasks = [];
let currentFilter = 'all';
let currentDate = new Date();
let viewMode = 'list'; // 'list' or 'calendar'
let currentCategory = 'all'; // all | Work | Personal
let selectedTaskId = null;

// Load tasks from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderTasks();
});

// Home button - reset to default view
homeBtn.addEventListener('click', () => {
    currentCategory = 'all';
    currentFilter = 'all';
    viewMode = 'list';
    filterSelect.value = 'all';
    calendarView.classList.remove('active');
    tasksList.style.display = 'grid';
    
    // Show navbar again
    document.querySelector('.navbar').style.display = 'flex';
    document.querySelector('.main-content').classList.remove('calendar-mode');
    
    closeAllPanels();
    renderTasks();
});

// Work category button
workBtn.addEventListener('click', () => {
    currentCategory = 'Work';
    viewMode = 'list';
    tasksList.style.display = 'grid';
    calendarView.classList.remove('active');
    renderTasks();
});

// Personal category button
personalBtn.addEventListener('click', () => {
    currentCategory = 'Personal';
    viewMode = 'list';
    tasksList.style.display = 'grid';
    calendarView.classList.remove('active');
    renderTasks();
});

// Filter change event
filterSelect.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    renderTasks();
});

// Calendar button click
calendarBtn.addEventListener('click', () => {
    closeAllPanels();

    if (viewMode === 'list') {
        viewMode = 'calendar';
        tasksList.style.display = 'none';
        calendarView.classList.add('active');
        
        // Hide navbar
        document.querySelector('.navbar').style.display = 'none';
        // Add class to main-content
        document.querySelector('.main-content').classList.add('calendar-mode');
        
        renderCalendar();
    } else {
        viewMode = 'list';
        tasksList.style.display = 'grid';
        calendarView.classList.remove('active');
        
        // Show navbar again
        document.querySelector('.navbar').style.display = 'flex';
        // Remove class from main-content
        document.querySelector('.main-content').classList.remove('calendar-mode');
    }
});

// Calendar navigation
prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Toggle task form
addTaskBtn.addEventListener('click', () => {
    taskForm.classList.add('active');
    formOverlay.classList.add('active');
});

// Close all panels
function closeAllPanels() {
    taskForm.classList.remove('active');
    formOverlay.classList.remove('active');
    
    if (taskDetailPanel) {
        taskDetailPanel.classList.remove('active');
    }
    
    selectedTaskId = null;
}

// Close form when clicking overlay
formOverlay.addEventListener('click', () => {
    closeAllPanels();
    todoForm.reset();
});

// Close detail panel
if (closeDetailBtn) {
    closeDetailBtn.addEventListener('click', () => {
        taskDetailPanel.classList.remove('active');
        formOverlay.classList.remove('active');
        selectedTaskId = null;
    });
}

// Handle form submission
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form values
    const taskName = document.getElementById('taskName').value;
    const taskDesc = document.getElementById('taskDesc').value;
    const taskType = document.getElementById('taskType').value;
    const dueDate = document.getElementById('dueDate').value;
    
    // Create task object
    const task = {
        id: Date.now(),
        name: taskName,
        description: taskDesc,
        category: taskType,
        dueDate: dueDate,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    // Add task to array
    tasks.push(task);
    
    // Save to localStorage
    saveTasks();
    
    // Render tasks
    renderTasks();
    
    // Reset form and hide
    todoForm.reset();
    closeAllPanels();
});

// Render tasks
function renderTasks() {
    let filteredTasks = tasks;
    
    // Filter by category (Work / Personal)
    if (currentCategory !== 'all') {
        filteredTasks = filteredTasks.filter(
            task => task.category === currentCategory
        );
    }
    
    // Filter by status
    if (currentFilter === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
    } else if (currentFilter === 'uncompleted') {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    }
    
    if (filteredTasks.length === 0) {
        let emptyMessage = 'Belum ada tugas. Klik "Add New Tasks" untuk menambahkan.';
        
        if (currentFilter === 'completed') {
            emptyMessage = 'Belum ada tugas yang diselesaikan.';
        } else if (currentFilter === 'uncompleted') {
            emptyMessage = 'Tidak ada tugas yang belum diselesaikan.';
        }
        
        tasksList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <p>${emptyMessage}</p>
            </div>
        `;
        return;
    }
    
    tasksList.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}"
             data-id="${task.id}"
             onclick="openTaskDetail(${task.id})">
            <input type="checkbox" 
                   class="task-checkbox" 
                   ${task.completed ? 'checked' : ''} 
                   onclick="event.stopPropagation()" 
                   onchange="toggleTask(${task.id})">
            
            <div class="task-details">
                <div class="task-name">${task.name}</div>
                ${task.description ? `<div class="task-desc">${task.description}</div>` : ''}
                
                <div class="task-meta">
                    ${task.category ? `<span class="task-type">${task.category}</span>` : ''}
                    ${task.dueDate ? `<span>📅 ${formatDate(task.dueDate)}</span>` : ''}
                </div>
            </div>
            
            <div class="task-actions">
                <button class="delete-btn" onclick="event.stopPropagation(); deleteTask(${task.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Open task detail panel
function openTaskDetail(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    selectedTaskId = id;

    document.getElementById('detailName').textContent = task.name;
    document.getElementById('detailDesc').textContent = task.description || '-';
    document.getElementById('detailCategory').textContent = task.category || '-';
    document.getElementById('detailDate').textContent = task.dueDate ? formatDate(task.dueDate) : '-';
    document.getElementById('detailStatus').textContent = task.completed ? 'Completed' : 'Uncompleted';
    document.getElementById('detailCreated').textContent = formatDateTime(task.createdAt);

    taskDetailPanel.classList.add('active');
    formOverlay.classList.add('active');
}

// Toggle task completion
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// Delete task
function deleteTask(id) {
    if (confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
}

// Format date time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    const options = { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('id-ID', options);
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load tasks from localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
}

// Render Calendar
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Set calendar title
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    calendarTitle.textContent = `${monthNames[month]} ${year}`;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // Clear calendar
    calendarDays.innerHTML = '';
    
    // Add previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayElement = createDayElement(day, true, year, month - 1);
        calendarDays.appendChild(dayElement);
    }
    
    // Add current month's days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === today.getDate() && 
                       month === today.getMonth() && 
                       year === today.getFullYear();
        const dayElement = createDayElement(day, false, year, month, isToday);
        calendarDays.appendChild(dayElement);
    }
    
    // Add next month's days
    const totalCells = calendarDays.children.length;
    const remainingCells = 42 - totalCells; // 6 rows x 7 days
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, true, year, month + 1);
        calendarDays.appendChild(dayElement);
    }
}

// Create day element
function createDayElement(day, isOtherMonth, year, month, isToday = false) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }
    
    if (isToday) {
        dayElement.classList.add('today');
    }
    
    // Check if there are tasks for this date
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const tasksForDay = tasks.filter(task => task.dueDate === dateString);
    
    if (tasksForDay.length > 0) {
        dayElement.classList.add('has-tasks');
    }
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);
    
    if (tasksForDay.length > 0) {
        const taskCount = document.createElement('div');
        taskCount.className = 'task-count';
        taskCount.textContent = `${tasksForDay.length} task${tasksForDay.length > 1 ? 's' : ''}`;
        dayElement.appendChild(taskCount);
    }
    
    // Add click event to show tasks for that day
    dayElement.addEventListener('click', () => {
        showTasksForDate(dateString, tasksForDay);
    });
    
    return dayElement;
}

// Show tasks for specific date
function showTasksForDate(dateString, tasksForDay) {
    if (tasksForDay.length === 0) {
        alert(`No tasks for ${formatDate(dateString)}`);
        return;
    }
    
    const taskList = tasksForDay.map(task => 
        `• ${task.name}${task.completed ? ' ✓' : ''}`
    ).join('\n');
    
    alert(`Tasks for ${formatDate(dateString)}:\n\n${taskList}`);
}