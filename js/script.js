// DOM Elements
const addTaskBtn = document.getElementById('addTaskBtn');
const taskForm = document.getElementById('taskForm');
const todoForm = document.getElementById('todoForm');
const tasksList = document.getElementById('tasksList');

// Tasks array
let tasks = [];

// Load tasks from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderTasks();
});

// Toggle task form
addTaskBtn.addEventListener('click', () => {
    taskForm.classList.toggle('active');
    
    // Reset form if closing
    if (!taskForm.classList.contains('active')) {
        todoForm.reset();
    }
});

// Handle form submission
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form values
    const taskName = document.getElementById('taskName').value;
    const taskDesc = document.getElementById('taskDesc').value;
    // const taskType = document.getElementById('taskType').value;
    const dueDate = document.getElementById('dueDate').value;
    
    // Create task object
    const task = {
        id: Date.now(),
        name: taskName,
        description: taskDesc,
        type: taskType,
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
    taskForm.classList.remove('active');
});

// Render tasks
function renderTasks() {
    if (tasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <p>Belum ada tugas. Klik "Add New Tasks" untuk menambahkan.</p>
            </div>
        `;
        return;
    }
    
    tasksList.innerHTML = tasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
            
            <div class="task-details">
                <div class="task-name">${task.name}</div>
                ${task.description ? `<div class="task-desc">${task.description}</div>` : ''}
                
                <div class="task-meta">
                    ${task.type ? `<span class="task-type">${task.type}</span>` : ''}
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