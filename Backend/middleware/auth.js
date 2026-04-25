const { auth } = require('../config/firebase');

/**
 * Middleware to verify Firebase authentication token
 * Checks if user is logged in
 */
async function verifyToken(req, res, next) {
  try {
    // Get token from Authorization header
    // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6..."
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No authentication token provided' 
      });
    }

    // Extract the token (remove "Bearer " prefix)
    const token = authHeader.split('Bearer ')[1];

    // Verify token with Firebase
    const decodedToken = await auth.verifyIdToken(token);
    
    // Attach user info to request object
    // Now other middleware/controllers can access req.user
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };

    // Continue to next middleware/controller
    next();
    
  } catch (error) {
    console.error('Token verification failed:', error.message);
    
    // Different error messages for different scenarios
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        error: 'Token expired. Please login again.' 
      });
    }
    
    return res.status(401).json({ 
      error: 'Invalid authentication token' 
    });
  }
}

module.exports = { verifyToken };