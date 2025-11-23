const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database');

let server;

// Iniciar servidor antes de todos os testes
beforeAll((done) => {
    server = app.listen(3001, done); // Usar porta diferente para testes
});

// Limpar banco de dados antes de cada teste
beforeEach((done) => {
    db.run('DELETE FROM tasks', (err) => {
        if (err) {
            console.error('Error cleaning database:', err);
        }
        done();
    });
});

// Fechar servidor e conexão com o banco após todos os testes
afterAll(async () => {
    return new Promise((resolve) => {
        // Fechar servidor primeiro
        if (server) {
            server.close(() => {
                console.log('✅ Test server closed');
                // Depois fechar banco de dados
                db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err);
                    } else {
                        console.log('✅ Database connection closed');
                    }
                    resolve();
                });
            });
        } else {
            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                }
                resolve();
            });
        }
    });
});

describe('API Health Check', () => {
    test('GET /health - should return API status', async () => {
        const response = await request(app).get('/health');
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('API Task Manager is running');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('environment');
    });
});

describe('Task CRUD Operations', () => {
    let createdTaskId;

    // Teste: Criar uma nova tarefa
    test('POST /api/tasks - should create a new task', async () => {
        const newTask = {
            title: 'Test Task',
            description: 'Test Description',
            priority: 'high'
        };

        const response = await request(app)
            .post('/api/tasks')
            .send(newTask);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Tarefa criada com sucesso');
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.title).toBe(newTask.title);
        expect(response.body.data.description).toBe(newTask.description);
        expect(response.body.data.status).toBe('pending'); // valor padrão
        expect(response.body.data.priority).toBe('high');

        // Salvar ID para usar em outros testes
        createdTaskId = response.body.data.id;
    });

    // Teste: Validação ao criar tarefa sem título
    test('POST /api/tasks - should return error for missing title', async () => {
        const invalidTask = {
            description: 'Task without title'
        };

        const response = await request(app)
            .post('/api/tasks')
            .send(invalidTask);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Título é obrigatório');
    });

    // Teste: Buscar todas as tarefas
    test('GET /api/tasks - should return all tasks', async () => {
        // Primeiro criar algumas tarefas
        await request(app).post('/api/tasks').send({ title: 'Task 1' });
        await request(app).post('/api/tasks').send({ title: 'Task 2' });

        const response = await request(app).get('/api/tasks');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.count).toBe(2);
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    // Teste: Buscar tarefa por ID
    test('GET /api/tasks/:id - should return specific task', async () => {
        // Criar uma tarefa primeiro
        const createResponse = await request(app)
            .post('/api/tasks')
            .send({ title: 'Specific Task' });

        const taskId = createResponse.body.data.id;

        const response = await request(app).get(`/api/tasks/${taskId}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(taskId);
        expect(response.body.data.title).toBe('Specific Task');
    });

    // Teste: Buscar tarefa inexistente
    test('GET /api/tasks/:id - should return 404 for non-existent task', async () => {
        const response = await request(app).get('/api/tasks/9999');

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Tarefa não encontrada');
    });

    // Teste: Atualizar tarefa
    test('PUT /api/tasks/:id - should update existing task', async () => {
        // Criar tarefa primeiro
        const createResponse = await request(app)
            .post('/api/tasks')
            .send({ title: 'Original Task' });

        const taskId = createResponse.body.data.id;

        const updatedData = {
            title: 'Updated Task Title',
            description: 'Updated description',
            status: 'in-progress',
            priority: 'low'
        };

        const response = await request(app)
            .put(`/api/tasks/${taskId}`)
            .send(updatedData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Tarefa atualizada com sucesso');
        expect(response.body.data.title).toBe(updatedData.title);
        expect(response.body.data.description).toBe(updatedData.description);
        expect(response.body.data.status).toBe(updatedData.status);
        expect(response.body.data.priority).toBe(updatedData.priority);
    });

    // Teste: Atualizar tarefa inexistente
    test('PUT /api/tasks/:id - should return 404 for non-existent task', async () => {
        const response = await request(app)
            .put('/api/tasks/9999')
            .send({ title: 'Updated Title' });

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Tarefa não encontrada');
    });

    // Teste: Deletar tarefa
    test('DELETE /api/tasks/:id - should delete existing task', async () => {
        // Criar tarefa primeiro
        const createResponse = await request(app)
            .post('/api/tasks')
            .send({ title: 'Task to Delete' });

        const taskId = createResponse.body.data.id;

        // Deletar a tarefa
        const deleteResponse = await request(app).delete(`/api/tasks/${taskId}`);

        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body.success).toBe(true);
        expect(deleteResponse.body.message).toBe('Tarefa deletada com sucesso');

        // Verificar que a tarefa não existe mais
        const getResponse = await request(app).get(`/api/tasks/${taskId}`);
        expect(getResponse.status).toBe(404);
    });

    // Teste: Deletar tarefa inexistente
    test('DELETE /api/tasks/:id - should return 404 for non-existent task', async () => {
        const response = await request(app).delete('/api/tasks/9999');

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Tarefa não encontrada');
    });
});

describe('Task Filtering by Status', () => {
    beforeEach(async () => {
        // Criar tarefas com diferentes status para testes
        await request(app).post('/api/tasks').send({ 
            title: 'Pending Task', 
            status: 'pending' 
        });
        await request(app).post('/api/tasks').send({ 
            title: 'In Progress Task', 
            status: 'in-progress' 
        });
        await request(app).post('/api/tasks').send({ 
            title: 'Completed Task', 
            status: 'completed' 
        });
        await request(app).post('/api/tasks').send({ 
            title: 'Another Pending Task', 
            status: 'pending' 
        });
    });

    // Teste: Filtrar tarefas por status válido
    test('GET /api/tasks/status/:status - should return tasks filtered by status', async () => {
        const response = await request(app).get('/api/tasks/status/pending');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.count).toBe(2);
        expect(response.body.data.every(task => task.status === 'pending')).toBe(true);
    });

    // Teste: Status inválido
    test('GET /api/tasks/status/:status - should return error for invalid status', async () => {
        const response = await request(app).get('/api/tasks/status/invalid-status');

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Status inválido');
    });
});

describe('Route Not Found', () => {
    test('Should return 404 for non-existent routes', async () => {
        const response = await request(app).get('/api/non-existent-route');

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Route not found');
    }, 10000); // Timeout de 10 segundos para este teste específico
});