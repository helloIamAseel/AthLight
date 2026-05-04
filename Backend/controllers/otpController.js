const { 
  generateOTP, 
  sendOTPEmail, 
  storeOTP, 
  verifyOTP 
} = require('../services/otpService');
const { 
  validateSendOTP, 
  validateVerifyOTP 
} = require('../utils/validators');
const { 
  successResponse, 
  errorResponse 
} = require('../utils/helpers');

/**
 * SEND OTP - Generate and send OTP to email
 * POST /api/otp/send
 */
const sendOTP = async (req, res) => {
  try {
    // Validate input
    const { error, value } = validateSendOTP(req.body);
    if (error) {
      return errorResponse(res, 400, error.details[0].message);
    }

    const { email } = value;

    // Generate OTP
    const otp = generateOTP();

    // Send email
    await sendOTPEmail(email, otp);

    // Store in database
    await storeOTP(email, otp);

    return successResponse(res, 200, 'OTP sent successfully to your email', {
      email,
      expiresIn: '10 minutes'
    });

  } catch (error) {
    console.error('Send OTP error:', error);

    if (error.code === 403) {
      return errorResponse(res, 403, 'SendGrid API key invalid or email sending failed');
    }

    return errorResponse(res, 500, 'Failed to send OTP');
  }
};

/**
 * VERIFY OTP - Check if OTP code is valid
 * POST /api/otp/verify
 */
const verifyOTPCode = async (req, res) => {
  try {
    // Validate input
    const { error, value } = validateVerifyOTP(req.body);
    if (error) {
      return errorResponse(res, 400, error.details[0].message);
    }

    const { email, otp } = value;

    // Verify OTP
    const result = await verifyOTP(email, otp);

    if (!result.valid) {
      return errorResponse(res, 400, result.message);
    }

    return successResponse(res, 200, result.message, {
      email,
      verified: true
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return errorResponse(res, 500, 'Failed to verify OTP');
  }
};

module.exports = {
  sendOTP,
  verifyOTPCode
};