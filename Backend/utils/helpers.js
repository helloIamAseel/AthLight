/**
 * Reusable helper functions
 */

/**
 * Calculate age from date of birth
 */
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Format date to readable string
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Generate unique filename for uploads
 */
const generateUniqueFilename = (userId, originalFilename) => {
  const timestamp = Date.now();
  const extension = originalFilename.split('.').pop();
  return `${userId}_${timestamp}.${extension}`;
};

/**
 * Check if user account is locked (too many failed login attempts)
 */
const isAccountLocked = (userData) => {
  if (!userData.loginAttempts || !userData.lockedUntil) {
    return false;
  }

  const now = Date.now();
  return userData.lockedUntil > now;
};

/**
 * Calculate time remaining for account lockout
 */
const getLockoutTimeRemaining = (lockedUntil) => {
  const now = Date.now();
  const remaining = lockedUntil - now;
  
  if (remaining <= 0) return 0;
  
  return Math.ceil(remaining / 60000); // Convert to minutes
};

/**
 * Sanitize user data before sending to frontend
 * Remove sensitive fields
 */
const sanitizeUserData = (userData) => {
  const { 
    loginAttempts, 
    lockedUntil, 
    ...sanitizedData 
  } = userData;
  
  return sanitizedData;
};

/**
 * Build Firestore query with filters
 */
const buildSearchQuery = (collection, filters) => {
  let query = collection;

  if (filters.role) {
    query = query.where('role', '==', filters.role);
  }

  if (filters.sport) {
    query = query.where('sport', '==', filters.sport);
  }

  if (filters.location) {
    query = query.where('location', '==', filters.location);
  }

  return query;
};

/**
 * Paginate results
 */
const paginateResults = (results, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  return {
    data: results.slice(startIndex, endIndex),
    currentPage: page,
    totalPages: Math.ceil(results.length / limit),
    totalResults: results.length,
    hasNextPage: endIndex < results.length,
    hasPrevPage: page > 1
  };
};

/**
 * Success response helper
 */
const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message
  };

  if (data) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Error response helper
 */
const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    error: message
  });
};

module.exports = {
  calculateAge, 
  formatDate,
  generateUniqueFilename,
  isAccountLocked,
  getLockoutTimeRemaining,
  sanitizeUserData,
  buildSearchQuery,
  paginateResults,
  successResponse,
  errorResponse
};