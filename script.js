// Todo App State
let todos = [];
let currentFilter = 'all';

// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');
const todoCount = document.getElementById('todoCount');

// Initialize app
function init() {
    loadTodos();
    renderTodos();
    attachEventListeners();
}

// Event Listeners
function attachEventListeners() {
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTodos();
        });
    });

    clearCompletedBtn.addEventListener('click', clearCompleted);
}

// Load todos from localStorage
function loadTodos() {
    const stored = localStorage.getItem('todos');
    if (stored) {
        todos = JSON.parse(stored);
    }
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Add new todo
function addTodo() {
    const text = todoInput.value.trim();

    if (text === '') {
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        completed: false
    };

    todos.push(todo);
    saveTodos();
    renderTodos();
    todoInput.value = '';
}

// Toggle todo completion
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

// Delete todo
function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

// Start editing todo
function startEdit(id) {
    const todoItem = document.querySelector(`[data-id="${id}"]`);
    const todoText = todoItem.querySelector('.todo-text');
    const editInput = todoItem.querySelector('.edit-input');
    const editBtn = todoItem.querySelector('.btn-edit');
    const deleteBtn = todoItem.querySelector('.btn-delete');
    const saveBtn = todoItem.querySelector('.btn-save');
    const cancelBtn = todoItem.querySelector('.btn-cancel');

    todoText.style.display = 'none';
    editInput.style.display = 'block';
    editInput.value = todoText.textContent;
    editInput.focus();

    editBtn.style.display = 'none';
    deleteBtn.style.display = 'none';
    saveBtn.style.display = 'inline';
    cancelBtn.style.display = 'inline';
}

// Save edited todo
function saveEdit(id) {
    const todoItem = document.querySelector(`[data-id="${id}"]`);
    const editInput = todoItem.querySelector('.edit-input');
    const newText = editInput.value.trim();

    if (newText === '') {
        return;
    }

    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.text = newText;
        saveTodos();
        renderTodos();
    }
}

// Cancel editing
function cancelEdit(id) {
    renderTodos();
}

// Clear completed todos
function clearCompleted() {
    todos = todos.filter(t => !t.completed);
    saveTodos();
    renderTodos();
}

// Get filtered todos
function getFilteredTodos() {
    if (currentFilter === 'active') {
        return todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        return todos.filter(t => t.completed);
    }
    return todos;
}

// Render todos
function renderTodos() {
    const filteredTodos = getFilteredTodos();

    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<li class="empty-state">No tasks to show</li>';
    } else {
        todoList.innerHTML = filteredTodos.map(todo => `
            <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <input
                    type="checkbox"
                    class="todo-checkbox"
                    ${todo.completed ? 'checked' : ''}
                    onchange="toggleTodo(${todo.id})"
                >
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                <input
                    type="text"
                    class="edit-input"
                    style="display: none;"
                    onkeypress="if(event.key === 'Enter') saveEdit(${todo.id})"
                >
                <button class="btn-icon btn-edit" onclick="startEdit(${todo.id})" title="Edit">✏️</button>
                <button class="btn-icon btn-delete" onclick="deleteTodo(${todo.id})" title="Delete">🗑️</button>
                <button class="btn-icon btn-save" style="display: none;" onclick="saveEdit(${todo.id})" title="Save">✓</button>
                <button class="btn-icon btn-cancel" style="display: none;" onclick="cancelEdit(${todo.id})" title="Cancel">✕</button>
            </li>
        `).join('');
    }

    updateStats();
}

// Update stats
function updateStats() {
    const activeTodos = todos.filter(t => !t.completed).length;
    todoCount.textContent = `${activeTodos} task${activeTodos !== 1 ? 's' : ''} remaining`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
