const Task = require('../models/Task');

// @desc    Get all tasks
// @route   GET /api/tasks
const getAllTasks = (req, res) => {
    Task.findAll((err, tasks) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao buscar tarefas',
                error: err.message
            });
        }
        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    });
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
const getTaskById = (req, res) => {
    const taskId = req.params.id;

    Task.findById(taskId, (err, task) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao buscar tarefa',
                error: err.message
            });
        }

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Tarefa não encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    });
};

// @desc    Create new task
// @route   POST /api/tasks
const createTask = (req, res) => {
    const { title, description, status, priority, due_date } = req.body;

    // Validação básica
    if (!title) {
        return res.status(400).json({
            success: false,
            message: 'Título é obrigatório'
        });
    }

    const taskData = {
        title,
        description: description || '',
        status: status || 'pending',
        priority: priority || 'medium',
        due_date: due_date || null
    };

    Task.create(taskData, (err, task) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao criar tarefa',
                error: err.message
            });
        }

        res.status(201).json({
            success: true,
            message: 'Tarefa criada com sucesso',
            data: task
        });
    });
};

// @desc    Update task
// @route   PUT /api/tasks/:id
const updateTask = (req, res) => {
    const taskId = req.params.id;
    const { title, description, status, priority, due_date } = req.body;

    // Verificar se a tarefa existe
    Task.findById(taskId, (err, existingTask) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao buscar tarefa',
                error: err.message
            });
        }

        if (!existingTask) {
            return res.status(404).json({
                success: false,
                message: 'Tarefa não encontrada'
            });
        }

        const taskData = {
            title: title || existingTask.title,
            description: description !== undefined ? description : existingTask.description,
            status: status || existingTask.status,
            priority: priority || existingTask.priority,
            due_date: due_date !== undefined ? due_date : existingTask.due_date
        };

        Task.update(taskId, taskData, (err, task) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao atualizar tarefa',
                    error: err.message
                });
            }

            res.status(200).json({
                success: true,
                message: 'Tarefa atualizada com sucesso',
                data: task
            });
        });
    });
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
const deleteTask = (req, res) => {
    const taskId = req.params.id;

    // Verificar se a tarefa existe
    Task.findById(taskId, (err, existingTask) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao buscar tarefa',
                error: err.message
            });
        }

        if (!existingTask) {
            return res.status(404).json({
                success: false,
                message: 'Tarefa não encontrada'
            });
        }

        Task.delete(taskId, (err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao deletar tarefa',
                    error: err.message
                });
            }

            res.status(200).json({
                success: true,
                message: 'Tarefa deletada com sucesso'
            });
        });
    });
};

// @desc    Get tasks by status
// @route   GET /api/tasks/status/:status
const getTasksByStatus = (req, res) => {
    const status = req.params.status;
    const validStatuses = ['pending', 'in-progress', 'completed'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Status inválido. Valores permitidos: pending, in-progress, completed'
        });
    }

    Task.findByStatus(status, (err, tasks) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao buscar tarefas por status',
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    });
};

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    getTasksByStatus
};