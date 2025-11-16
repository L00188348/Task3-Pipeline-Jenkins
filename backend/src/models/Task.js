const db = require('../database');

class Task {
    // Criar nova tarefa
    static create(taskData, callback) {
        const { title, description, status, priority, due_date } = taskData;
        const sql = `INSERT INTO tasks (title, description, status, priority, due_date) 
                     VALUES (?, ?, ?, ?, ?)`;
        
        db.run(sql, [title, description, status, priority, due_date], function(err) {
            if (err) {
                callback(err, null);
            } else {
                // Retornar a tarefa criada
                Task.findById(this.lastID, callback);
            }
        });
    }

    // Buscar todas as tarefas
    static findAll(callback) {
        const sql = `SELECT * FROM tasks ORDER BY created_at DESC`;
        db.all(sql, [], callback);
    }

    // Buscar tarefa por ID
    static findById(id, callback) {
        const sql = `SELECT * FROM tasks WHERE id = ?`;
        db.get(sql, [id], callback);
    }

    // Atualizar tarefa
    static update(id, taskData, callback) {
        const { title, description, status, priority, due_date } = taskData;
        const sql = `UPDATE tasks 
                     SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, 
                         updated_at = CURRENT_TIMESTAMP 
                     WHERE id = ?`;
        
        db.run(sql, [title, description, status, priority, due_date, id], function(err) {
            if (err) {
                callback(err, null);
            } else {
                Task.findById(id, callback);
            }
        });
    }

    // Deletar tarefa
    static delete(id, callback) {
        const sql = `DELETE FROM tasks WHERE id = ?`;
        db.run(sql, [id], callback);
    }

    // Buscar tarefas por status
    static findByStatus(status, callback) {
        const sql = `SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC`;
        db.all(sql, [status], callback);
    }
}

module.exports = Task;