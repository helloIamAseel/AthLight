//add to /service

const sgMail = require('@sendgrid/mail');
const { db } = require('../config/firebase');

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Generate random 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via SendGrid email
 */
const sendOTPEmail = async (email, otp) => {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@athlight.com',
    subject: 'Your AthLight Verification Code',
    text: `Your verification code is: ${otp}. This code expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">AthLight Email Verification</h2>
        <p>Your verification code is:</p>
        <h1 style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 5px;">
          ${otp}
        </h1>
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">AthLight - Athlete Networking Platform</p>
      </div>
    `
  };

  await sgMail.send(msg);
};

/**
 * Store OTP in Firestore with expiry
 */
const storeOTP = async (email, otp) => {
  const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes from now

  await db.collection('otp_codes').doc(email).set({
    otp,
    email,
    expiryTime,
    verified: false,
    createdAt: new Date().toISOString()
  });
};

/**
 * Verify OTP code
 */
const verifyOTP = async (email, otp) => {
  const otpDoc = await db.collection('otp_codes').doc(email).get();

  if (!otpDoc.exists) {
    return { valid: false, message: 'No OTP found for this email' };
  }

  const otpData = otpDoc.data();

  // Check if expired
  if (Date.now() > otpData.expiryTime) {
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }

  // Check if OTP matches
  if (otpData.otp !== otp) {
    return { valid: false, message: 'Invalid OTP code' };
  }

  // Check if already verified
  if (otpData.verified) {
    return { valid: false, message: 'OTP already used' };
  }

  // Mark as verified
  await db.collection('otp_codes').doc(email).update({
    verified: true,
    verifiedAt: new Date().toISOString()
  });

  return { valid: true, message: 'Email verified successfully' };
};

/**
 * Delete expired OTPs (cleanup function)
 */
const cleanupExpiredOTPs = async () => {
  const now = Date.now();
  const expiredDocs = await db.collection('otp_codes')
    .where('expiryTime', '<', now)
    .get();

  const batch = db.batch();
  expiredDocs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`Cleaned up ${expiredDocs.size} expired OTPs`);
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  storeOTP,
  verifyOTP,
  cleanupExpiredOTPs
};