//add to /routes

const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');

/**
 * OTP Routes
 * Base path: /api/otp
 */

// POST /api/otp/send - Send OTP to email
router.post('/send', otpController.sendOTP);

// POST /api/otp/verify - Verify OTP code
router.post('/verify', otpController.verifyOTPCode);

module.exports = router;