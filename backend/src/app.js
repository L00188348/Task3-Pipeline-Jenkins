const express = require('express');
const taskRoutes = require('./routes/tasks');
const path = require('path');

const app = express();

// Middleware
app.use(express.json({
    strict: true
}));

app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend
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

// Middleware de 404 para APIs
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Servir frontend para rotas não-API
app.get('*', (req, res, next) => {
    if (!req.path.startsWith('/api') && req.path !== '/health') {
        return res.sendFile(path.join(__dirname, '../../frontend/index.html'));
    }
    next();
});

// Middleware 404 global (fallback) - SIMPLIFICADO
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});


const PORT = process.env.PORT || 3000;

// Exportar app SEM iniciar servidor nos testes
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

module.exports = app;