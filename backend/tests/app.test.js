const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database');

let server;

// Iniciar servidor antes de todos os testes
beforeAll((done) => {
    server = app.listen(0, () => {
        console.log('✅ Test server started on random port');
        done();
    });
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
        if (server) {
            server.close(() => {
                console.log('✅ Test server closed');
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

// Função helper para fazer requests
const makeRequest = () => {
    return request(server);
};

describe('API Health Check', () => {
    test('GET /health - should return API status', async () => {
        const response = await makeRequest().get('/health');
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('API Task Manager is running');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('environment');
    });
});

describe('Task CRUD Operations', () => {
    // Teste: Criar uma nova tarefa
    test('POST /api/tasks - should create a new task', async () => {
        const newTask = {
            title: 'Test Task',
            description: 'Test Description',
            priority: 'high'
        };

        const response = await makeRequest()
            .post('/api/tasks')
            .send(newTask);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Tarefa criada com sucesso');
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.title).toBe(newTask.title);
        expect(response.body.data.description).toBe(newTask.description);
        expect(response.body.data.status).toBe('pending');
        expect(response.body.data.priority).toBe('high');
    });

    // Teste: Validação ao criar tarefa sem título
    test('POST /api/tasks - should return error for missing title', async () => {
        const invalidTask = {
            description: 'Task without title'
        };

        const response = await makeRequest()
            .post('/api/tasks')
            .send(invalidTask);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Título é obrigatório');
    });

    // Teste: Buscar todas as tarefas
    test('GET /api/tasks - should return all tasks', async () => {
        await makeRequest().post('/api/tasks').send({ title: 'Task 1' });
        await makeRequest().post('/api/tasks').send({ title: 'Task 2' });

        const response = await makeRequest().get('/api/tasks');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.count).toBe(2);
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    // Teste: Buscar tarefa por ID
    test('GET /api/tasks/:id - should return specific task', async () => {
        const createResponse = await makeRequest()
            .post('/api/tasks')
            .send({ title: 'Specific Task' });

        const taskId = createResponse.body.data.id;
        const response = await makeRequest().get(`/api/tasks/${taskId}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(taskId);
        expect(response.body.data.title).toBe('Specific Task');
    });

    // Teste: Buscar tarefa inexistente
    test('GET /api/tasks/:id - should return 404 for non-existent task', async () => {
        const response = await makeRequest().get('/api/tasks/9999');
        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Tarefa não encontrada');
    });

    // Teste: Atualizar tarefa
    test('PUT /api/tasks/:id - should update existing task', async () => {
        const createResponse = await makeRequest()
            .post('/api/tasks')
            .send({ title: 'Original Task' });

        const taskId = createResponse.body.data.id;
        const updatedData = {
            title: 'Updated Task Title',
            description: 'Updated description',
            status: 'in-progress',
            priority: 'low'
        };

        const response = await makeRequest()
            .put(`/api/tasks/${taskId}`)
            .send(updatedData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe(updatedData.title);
        expect(response.body.data.description).toBe(updatedData.description);
        expect(response.body.data.status).toBe(updatedData.status);
        expect(response.body.data.priority).toBe(updatedData.priority);
    });

    // Teste: Deletar tarefa
    test('DELETE /api/tasks/:id - should delete existing task', async () => {
        const createResponse = await makeRequest()
            .post('/api/tasks')
            .send({ title: 'Task to Delete' });

        const taskId = createResponse.body.data.id;
        const deleteResponse = await makeRequest().delete(`/api/tasks/${taskId}`);

        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body.success).toBe(true);

        const getResponse = await makeRequest().get(`/api/tasks/${taskId}`);
        expect(getResponse.status).toBe(404);
    });
});

describe('Task Filtering by Status', () => {
    beforeEach(async () => {
        await makeRequest().post('/api/tasks').send({ title: 'Pending Task', status: 'pending' });
        await makeRequest().post('/api/tasks').send({ title: 'In Progress Task', status: 'in-progress' });
        await makeRequest().post('/api/tasks').send({ title: 'Completed Task', status: 'completed' });
        await makeRequest().post('/api/tasks').send({ title: 'Another Pending Task', status: 'pending' });
    });

    test('GET /api/tasks/status/:status - should return tasks filtered by status', async () => {
        const response = await makeRequest().get('/api/tasks/status/pending');
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.count).toBe(2);
        expect(response.body.data.every(task => task.status === 'pending')).toBe(true);
    });

    test('GET /api/tasks/status/:status - should return error for invalid status', async () => {
        const response = await makeRequest().get('/api/tasks/status/invalid-status');
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Status inválido');
    });
});

describe('Server Routing and Middleware', () => {
    test('Should handle all route types correctly', async () => {
        // Testar health route
        const healthResponse = await makeRequest().get('/health');
        expect(healthResponse.status).toBe(200);
        expect(healthResponse.body.success).toBe(true);

        // Testar API route existente
        const apiResponse = await makeRequest().get('/api/tasks');
        expect(apiResponse.status).toBe(200);
        expect(apiResponse.headers['content-type']).toMatch(/json/);

        // Testar API route inexistente
        const apiNotFound = await makeRequest().get('/api/non-existent-endpoint');
        expect(apiNotFound.status).toBe(404);
        expect(apiNotFound.body.success).toBe(false);

        // Testar non-API route (frontend)
        const frontendResponse = await makeRequest().get('/any-route');
        expect([200, 404]).toContain(frontendResponse.status);
    });

    test('Should handle different HTTP methods for non-existent API routes', async () => {
        const testData = { test: 'data' };
        
        const postResponse = await makeRequest().post('/api/non-existent-route').send(testData);
        const putResponse = await makeRequest().put('/api/non-existent-route').send(testData);
        const deleteResponse = await makeRequest().delete('/api/non-existent-route');

        expect(postResponse.status).toBe(404);
        expect(putResponse.status).toBe(404);
        expect(deleteResponse.status).toBe(404);
    });

    test('Should have proper middleware configuration', async () => {
        const jsonResponse = await makeRequest()
            .post('/api/tasks')
            .send({ title: 'Test JSON' })
            .set('Content-Type', 'application/json');
        expect([201, 400]).toContain(jsonResponse.status);

        const urlEncodedResponse = await makeRequest()
            .post('/api/tasks')
            .send('title=URL+Encoded')
            .set('Content-Type', 'application/x-www-form-urlencoded');
        expect([201, 400, 404]).toContain(urlEncodedResponse.status);
    });
});

describe('Route Not Found', () => {
    test('Should return 404 for non-existent API routes', async () => {
        const response = await makeRequest().get('/api/non-existent-route');
        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Route not found');
    }, 10000);
});
describe('Edge Cases and Branch Coverage', () => {
    test('Should cover all critical middleware branches', async () => {
        // Caso 1: Rota API que não existe
        const apiNotFound = await makeRequest().get('/api/non-existent-api-route');
        expect(apiNotFound.status).toBe(404);
        
        // Caso 2: Rota não-API que serve frontend
        const frontendRoute = await makeRequest().get('/any-frontend-route');
        expect([200, 404]).toContain(frontendRoute.status);
        
        // Caso 3: Rota health (não deve servir frontend)
        const healthRoute = await makeRequest().get('/health');
        expect(healthRoute.status).toBe(200);
        
        // Caso 4: Rota que quase é API mas não é
        const almostApi = await makeRequest().get('/apix/tasks');
        expect([200, 404]).toContain(almostApi.status);
    });

    test('Should handle task not found for update operations', async () => {
        const response = await makeRequest()
            .put('/api/tasks/9999')
            .send({ title: 'Updated Title' });
        expect(response.status).toBe(404);
    });
});