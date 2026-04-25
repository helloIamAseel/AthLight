const { db } = require('../config/firebase');
const { ROLES } = require('../config/constants');

/**
 * Middleware to check if user has a specific role
 * Must be used AFTER verifyToken middleware
 */
function checkRole(...allowedRoles) {
  return async (req, res, next) => {
    try {
      // Get user ID from previous middleware (verifyToken)
      const userId = req.user.uid;

      // Get user document from Firestore
      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        return res.status(404).json({ 
          error: 'User profile not found' 
        });
      }

      const userData = userDoc.data();
      const userRole = userData.role;

      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          error: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
        });
      }

      // Attach user data to request for controllers to use
      req.userData = userData;

      // Continue to next middleware/controller
      next();

    } catch (error) {
      console.error('Role check failed:', error.message);
      return res.status(500).json({ 
        error: 'Role verification failed' 
      });
    }
  };
}

/**
 * Convenience functions for specific roles
 */
const isAthlete = checkRole(ROLES.ATHLETE);
const isCoach = checkRole(ROLES.COACH);
const isScout = checkRole(ROLES.SCOUT);
const isCoachOrScout = checkRole(ROLES.COACH, ROLES.SCOUT);

module.exports = { 
  checkRole, 
  isAthlete, 
  isCoach, 
  isScout, 
  isCoachOrScout 
};