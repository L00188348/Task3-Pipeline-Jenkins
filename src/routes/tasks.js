const express = require('express');
const router = express.Router();
const {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    getTasksByStatus
} = require('../controllers/taskController');

// @route   GET /api/tasks
// @desc    Get all tasks
router.get('/', getAllTasks);

// @route   GET /api/tasks/status/:status
// @desc    Get tasks by status
router.get('/status/:status', getTasksByStatus);

// @route   GET /api/tasks/:id
// @desc    Get task by ID
router.get('/:id', getTaskById);

// @route   POST /api/tasks
// @desc    Create new task
router.post('/', createTask);

// @route   PUT /api/tasks/:id
// @desc    Update task
router.put('/:id', updateTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete task
router.delete('/:id', deleteTask);

module.exports = router;