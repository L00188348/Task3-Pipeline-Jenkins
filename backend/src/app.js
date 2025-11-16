const express = require('express');
const taskRoutes = require('./routes/tasks');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend (CSS, JS, imagens)
app.use(express.static(path.join(__dirname, '../../frontend')));

// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API Task Manager is running!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes
app.use('/api/tasks', taskRoutes);

// Rota para servir o index.html do frontend para qualquer rota não-API
app.get('*', (req, res) => {
    // Verificar se a rota não começa com /api ou /health
    if (!req.path.startsWith('/api') && req.path !== '/health') {
        res.sendFile(path.join(__dirname, '../../frontend/index.html'));
    }
});

// 404 Handler para rotas API
app.use('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        res.status(404).json({
            success: false,
            message: 'Route not found'
        });
    }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'production' ? {} : err.message
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🎨 Frontend: http://localhost:${PORT}`);
    console.log(`📋 API Tasks: http://localhost:${PORT}/api/tasks`);
});

module.exports = app;