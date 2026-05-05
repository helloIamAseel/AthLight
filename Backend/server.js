const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import error handler
const { errorHandler } = require('./middleware/errorHandler');

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',  // Local development
    'https://athlight26.vercel.app',  // Production frontend URL
    /\.vercel\.app$/  // Any Vercel preview deployment
  ],
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));//edit by Sumayah
app.use(express.urlencoded({ extended: true, limit: "10mb" }));//edit by Sumayah

// Routes
const authRoutes = require('./routes/auth');
const otpRoutes = require('./routes/otp');  
const profileRoutes = require('./routes/profile');//edit by sumaya


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/profile', profileRoutes);//edit by Sumayah

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