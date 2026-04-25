module.exports = {
  // User roles
  ROLES: {
    ATHLETE: 'athlete',
    COACH: 'coach',
    SCOUT: 'scout'
  },

  // Login attempt limits
  MAX_LOGIN_ATTEMPTS: 3,
  LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutes in milliseconds

  // Video limits
  MAX_VIDEO_SIZE: 500 * 1024 * 1024, // 500MB
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/avi', 'video/mov'],

  // Validation rules
  PASSWORD_MIN_LENGTH: 8,
  
  // Flask AI API URL
  FLASK_API_URL: process.env.FLASK_AI_URL || 'http://localhost:5000'
};