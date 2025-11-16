const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Task3 API'
  });
});

// Basic root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Task3 - Pipeline and Jenkins API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      tasks: '/tasks'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
