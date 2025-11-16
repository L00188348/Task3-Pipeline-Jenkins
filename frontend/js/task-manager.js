// Task Manager Frontend - Connecting with API
const API_BASE = '/api/tasks';

class TaskManager {
    constructor() {
        this.tasks = [];
        this.init();
    }

    init() {
        this.loadTasks();
        this.setupEventListeners();
    }

    // Load all tasks
    async loadTasks() {
        try {
            const response = await fetch(API_BASE);
            const result = await response.json();
            
            if (result.success) {
                this.tasks = result.data;
                this.updateDashboard();
                this.checkAndRenderTables();
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    // Check if we're on tables page and render
    checkAndRenderTables() {
        const tbody = document.getElementById('tasks-table-body');
        if (tbody) {
            this.renderTasks();
        }
    }

    // Update dashboard cards
    updateDashboard() {
        // Only update if on dashboard page
        const totalElement = document.getElementById('total-tasks');
        if (!totalElement) return; // Exit if not on dashboard
        
        const total = this.tasks.length;
        const pending = this.tasks.filter(task => task.status === 'pending').length;
        const progress = this.tasks.filter(task => task.status === 'in-progress').length;
        const completed = this.tasks.filter(task => task.status === 'completed').length;

        totalElement.textContent = total;
        document.getElementById('pending-tasks').textContent = pending;
        document.getElementById('progress-tasks').textContent = progress;
        document.getElementById('completed-tasks').textContent = completed;
    }

    // Render tasks in table
    renderTasks() {
        const tbody = document.getElementById('tasks-table-body');
        if (!tbody) {
            console.log('Table not found - not on tables page');
            return;
        }

        tbody.innerHTML = '';

        this.tasks.forEach(task => {
            const row = this.createTaskRow(task);
            tbody.appendChild(row);
        });

        // Setup event listeners for the new buttons
        this.setupEditListeners();
        this.setupDeleteListeners();
    }

    // Create table row for a task
    createTaskRow(task) {
        const row = document.createElement('tr');
        
        // Format date
        const createdDate = new Date(task.created_at).toLocaleDateString('en-US');
        
        // Status badge
        const statusBadge = this.getStatusBadge(task.status);
        const priorityBadge = this.getPriorityBadge(task.priority);

        row.innerHTML = `
            <td>${task.title}</td>
            <td>${task.description || '-'}</td>
            <td>${statusBadge}</td>
            <td>${priorityBadge}</td>
            <td>${createdDate}</td>
            <td>
                <button class="btn btn-sm btn-primary edit-task" data-id="${task.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-task" data-id="${task.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        return row;
    }

    // Badges for status
    getStatusBadge(status) {
        const badges = {
            'pending': '<span class="badge badge-warning">Pending</span>',
            'in-progress': '<span class="badge badge-info">In Progress</span>',
            'completed': '<span class="badge badge-success">Completed</span>'
        };
        return badges[status] || '<span class="badge badge-secondary">Unknown</span>';
    }

    // Badges for priority
    getPriorityBadge(priority) {
        const badges = {
            'low': '<span class="badge badge-success">Low</span>',
            'medium': '<span class="badge badge-warning">Medium</span>',
            'high': '<span class="badge badge-danger">High</span>'
        };
        return badges[priority] || '<span class="badge badge-secondary">Unknown</span>';
    }

    setupEventListeners() {
    // Save task
        const saveBtn = document.getElementById('saveTask');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.handleSaveTask());
        }

        // Enter in form
        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSaveTask();
            });
        }

        // Filter buttons
        const filterPending = document.getElementById('filter-pending');
        const filterProgress = document.getElementById('filter-progress');
        const filterCompleted = document.getElementById('filter-completed');

        if (filterPending) {
            filterPending.addEventListener('click', () => this.filterTasks('pending'));
        }
        if (filterProgress) {
            filterProgress.addEventListener('click', () => this.filterTasks('in-progress'));
        }
        if (filterCompleted) {
            filterCompleted.addEventListener('click', () => this.filterTasks('completed'));
        }
    }

    // Handle task saving
    handleSaveTask() {
        const taskId = document.getElementById('taskId').value;
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const status = document.getElementById('taskStatus').value;
        const priority = document.getElementById('taskPriority').value;

        if (!title) {
            this.showAlert('Title is required!', 'warning');
            return;
        }

        const taskData = {
            title: title,
            description: description,
            status: status,
            priority: priority
        };

        if (taskId) {
            // Update existing task
            this.updateTask(taskId, taskData);
        } else {
            // Create new task
            this.createTask(taskData);
        }
    }

    // Create new task
    async createTask(taskData) {
        try {
            const response = await fetch(API_BASE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData)
            });

            const result = await response.json();
            
            if (result.success) {
                // Close modal and clear form
                $('#taskModal').modal('hide');
                document.getElementById('taskForm').reset();
                
                // Reload tasks
                this.loadTasks();
                
                // Show success message
                this.showAlert('Task created successfully!', 'success');
            } else {
                this.showAlert('Error creating task: ' + result.message, 'danger');
            }
        } catch (error) {
            console.error('Error creating task:', error);
            this.showAlert('Error connecting to server', 'danger');
        }
    }

    // Delete task
    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/${taskId}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            
            if (result.success) {
                this.showAlert('Task deleted successfully!', 'success');
                this.loadTasks(); // Reload tasks
            } else {
                this.showAlert('Error deleting task: ' + result.message, 'danger');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            this.showAlert('Error connecting to server', 'danger');
        }
    }
    // Edit task - open modal with task data
    editTask(taskId) {
        const task = this.tasks.find(t => t.id == taskId);
        if (!task) return;

        // Fill modal with task data
        document.getElementById('taskId').value = task.id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskStatus').value = task.status;
        document.getElementById('taskPriority').value = task.priority;

        // Update modal title and button
        document.getElementById('taskModalLabel').textContent = 'Edit Task';
        document.getElementById('saveTask').textContent = 'Update Task';

        // Open modal
        $('#taskModal').modal('show');
    }

    // Update existing task
    async updateTask(taskId, taskData) {
        try {
            const response = await fetch(`${API_BASE}/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData)
            });

            const result = await response.json();
            
            if (result.success) {
                $('#taskModal').modal('hide');
                document.getElementById('taskForm').reset();
                this.loadTasks();
                this.showAlert('Task updated successfully!', 'success');
            } else {
                this.showAlert('Error updating task: ' + result.message, 'danger');
            }
        } catch (error) {
            console.error('Error updating task:', error);
            this.showAlert('Error connecting to server', 'danger');
        }
    }

    // Setup edit button listeners
    setupEditListeners() {
        const editButtons = document.querySelectorAll('.edit-task');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = e.target.closest('.edit-task').dataset.id;
                this.editTask(taskId);
            });
        });
    }
    // Setup delete button listeners
    setupDeleteListeners() {
        const deleteButtons = document.querySelectorAll('.delete-task');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = e.target.closest('.delete-task').dataset.id;
                this.deleteTask(taskId);
            });
        });
    }
    // Show alerts
    showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="close" data-dismiss="alert">
                <span>&times;</span>
            </button>
        `;
        
        // Add to top of page
        const content = document.querySelector('#content');
        content.insertBefore(alertDiv, content.firstChild);
        
        // Remove after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
    // Filter tasks by status
filterTasks(status) {
    const filteredTasks = this.tasks.filter(task => task.status === status);
    this.renderFilteredTasks(filteredTasks, status);
}

// Render filtered tasks
    renderFilteredTasks(filteredTasks, status) {
        const tbody = document.getElementById('tasks-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (filteredTasks.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        No ${status} tasks found
                    </td>
                </tr>
            `;
            return;
        }

        filteredTasks.forEach(task => {
            const row = this.createTaskRow(task);
            tbody.appendChild(row);
        });

        this.setupDeleteListeners();
    }
    
    // Reset modal when closed
    setupModalReset() {
        $('#taskModal').on('hidden.bs.modal', () => {
            document.getElementById('taskForm').reset();
            document.getElementById('taskId').value = '';
            document.getElementById('taskModalLabel').textContent = 'New Task';
            document.getElementById('saveTask').textContent = 'Save Task';
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.taskManager = new TaskManager();
});

