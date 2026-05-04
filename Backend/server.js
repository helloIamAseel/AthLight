const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import error handler
const { errorHandler } = require('./middleware/errorHandler');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const otpRoutes = require('./routes/otp');  

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Athlight Backend API - Running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found' 
  });
});

// Error handler (must be last!)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api`);
});