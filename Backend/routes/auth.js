const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

/**
 * Auth Routes
 * All routes start with /api/auth
 */

// POST /api/auth/signup - Create new user account
router.post('/signup', authController.signup);

// POST /api/auth/login - User login
router.post('/login', authController.login);

// POST /api/auth/logout - User logout (requires auth)
router.post('/logout', verifyToken, authController.logout);

// POST /api/auth/reset-password - Send password reset email
router.post('/reset-password', authController.resetPassword);

// GET /api/auth/me - Get current user info (requires auth)
router.get('/me', verifyToken, authController.getCurrentUser);

module.exports = router;