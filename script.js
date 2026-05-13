const taskInput = document.getElementById('task-input');
const dateInput = document.getElementById('date-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const clearAllBtn = document.getElementById('clear-all-btn');
const totalTasksEl = document.getElementById('total-tasks');
const completedTasksEl = document.getElementById('completed-tasks');
const pendingTasksEl = document.getElementById('pending-tasks');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let editId = null;

// Load tasks on page load
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    updateStats();
});

// Add or Update Task
addBtn.addEventListener('click', () => {
    const taskText = taskInput.value.trim();
    const taskDate = dateInput.value;

    if (taskText === '') {
        alert('Please enter a task');
        return;
    }

    if (editId !== null) {
        // Update existing task
        tasks = tasks.map(task => 
            task.id === editId 
                ? { ...task, text: taskText, date: taskDate } 
                : task
        );
        editId = null;
        addBtn.textContent = 'Add Task';
    } else {
        // Add new task
        const newTask = {
            id: Date.now(),
            text: taskText,
            date: taskDate,
            completed: false
        };
        tasks.push(newTask);
    }

    saveAndRender();
    taskInput.value = '';
    dateInput.value = '';
});

// Enter key to add task
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addBtn.click();
});

// Render all tasks
function renderTasks() {
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
        taskList.innerHTML = '<li class="empty-state">No tasks yet. Add one above! 📝</li>';
        clearAllBtn.classList.add('hide');
        return;
    }

    clearAllBtn.classList.remove('hide');

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        const formattedDate = task.date 
            ? new Date(task.date).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
            : 'No due date';

        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
            <div class="task-content">
                <div class="task-text">${task.text}</div>
                <div class="task-date">📅 ${formattedDate}</div>
            </div>
            <div class="task-actions">
                <button class="edit-btn" data-id="${task.id}">Edit</button>
                <button class="delete-btn" data-id="${task.id}">Delete</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// Event delegation for checkbox, edit, delete
taskList.addEventListener('click', (e) => {
    const id = Number(e.target.dataset.id);

    if (e.target.classList.contains('task-checkbox')) {
        tasks = tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveAndRender();
    }

    if (e.target.classList.contains('edit-btn')) {
        const task = tasks.find(t => t.id === id);
        taskInput.value = task.text;
        dateInput.value = task.date;
        editId = id;
        addBtn.textContent = 'Update Task';
        taskInput.focus();
    }

    if (e.target.classList.contains('delete-btn')) {
        if (confirm('Delete this task?')) {
            tasks = tasks.filter(task => task.id !== id);
            saveAndRender();
        }
    }
});

// Clear all tasks
clearAllBtn.addEventListener('click', () => {
    if (confirm('Delete all tasks? This cannot be undone.')) {
        tasks = [];
        saveAndRender();
    }
});

// Update stats
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;
}

// Save to localStorage and re-render
function saveAndRender() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    updateStats();
}