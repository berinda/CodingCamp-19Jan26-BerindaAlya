// DOM Elements
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
const sidebarMenuItems = document.querySelectorAll('.sidebar-menu-item');
const taskDetailPanel = document.getElementById('taskDetailPanel');
const closeDetailBtn = document.getElementById('closeDetailBtn');
const detailName = document.getElementById('detailName');
const detailDate = document.getElementById('detailDate');
const detailStatus = document.getElementById('detailStatus');
let selectedTaskId = null;


// Tasks array
let tasks = [];
let currentFilter = 'all';
let currentDate = new Date();
let viewMode = 'list'; // 'list' or 'calendar'

// Load tasks from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderTasks();
    
    // Set first menu item (List) as active by default
    if (sidebarMenuItems.length > 0) {
        sidebarMenuItems[0].classList.add('active');
    }
    
    // Add click event to sidebar menu items
    sidebarMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active from all items
            sidebarMenuItems.forEach(i => i.classList.remove('active'));
            // Add active to clicked item
            item.classList.add('active');
        });
    });
});

// Filter change event
filterSelect.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    renderTasks();
});

// Calendar button click
calendarBtn.addEventListener('click', () => {
    if (viewMode === 'list') {
        viewMode = 'calendar';
        tasksList.style.display = 'none';
        calendarView.classList.add('active');
        calendarBtn.classList.add('active');
        calendarBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Calendar
        `;
        renderCalendar();
    } else {
        viewMode = 'list';
        tasksList.style.display = 'grid';
        calendarView.classList.remove('active');
        calendarBtn.classList.remove('active');
        calendarBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Calendar
        `;
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
if (typeof closeDetailBtn !== 'undefined' && closeDetailBtn) {
    closeDetailBtn.addEventListener('click', () => {
        taskDetailPanel.classList.remove('active');
        formOverlay.classList.remove('active');
        selectedTaskId = null;
    });
}

// Delete from detail panel
if (typeof deleteTaskBtn !== 'undefined' && deleteTaskBtn) {
    deleteTaskBtn.addEventListener('click', () => {
        if (selectedTaskId && confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
            tasks = tasks.filter(t => t.id !== selectedTaskId);
            saveTasks();
            renderTasks();
            taskDetailPanel.classList.remove('active');
            formOverlay.classList.remove('active');
            selectedTaskId = null;
        }
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
    // Filter tasks based on current filter
    let filteredTasks = tasks;
    
    if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    } else if (currentFilter === 'uncompleted') {
        filteredTasks = tasks.filter(task => !task.completed);
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
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
            
            <div class="task-details">
                <div class="task-name">${task.name}</div>
                ${task.description ? `<div class="task-desc">${task.description}</div>` : ''}
                
                <div class="task-meta">
                    ${task.category ? `<span class="task-type">${task.category}</span>` : ''}
                    ${task.dueDate ? `<span>📅 ${formatDate(task.dueDate)}</span>` : ''}
                </div>
            </div>
            
            <div class="task-actions">
                <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        </div>
    `).join('');
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

function openTaskDetail(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    selectedTaskId = id;

    detailName.textContent = task.name;
    detailDate.textContent = task.dueDate
        ? formatDate(task.dueDate)
        : '-';

    detailStatus.textContent = task.completed
        ? 'Completed'
        : 'Uncompleted';

    taskDetailPanel.classList.add('active');
    formOverlay.classList.add('active');
}
