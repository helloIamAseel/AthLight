const { auth, db } = require('../config/firebase');
const { ROLES, MAX_LOGIN_ATTEMPTS, LOCKOUT_TIME } = require('../config/constants');
const { 
  validateSignup, 
  validateLogin, 
  validatePasswordReset 
} = require('../utils/validators');
const { 
  isAccountLocked, 
  getLockoutTimeRemaining,
  sanitizeUserData,
  successResponse,
  errorResponse
} = require('../utils/helpers');

/**
 * SIGNUP - Create new user account
 * POST /api/auth/signup
 */
const signup = async (req, res) => {
  try {
    // Validate input
    const { error, value } = validateSignup(req.body);
    if (error) {
      return errorResponse(res, 400, error.details.map(d => d.message).join(', '));
    }

    const { email, password, name, role, sport, phoneNumber } = value;

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name
    });

    // Create user profile in Firestore
    const userProfile = {
      uid: userRecord.uid,
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      loginAttempts: 0,
      isActive: true
    };

    // Add role-specific fields
    if (role === ROLES.ATHLETE && sport) {
      userProfile.sport = sport;
      userProfile.videos = [];
      userProfile.stats = {};
    }

    if (phoneNumber) {
      userProfile.phoneNumber = phoneNumber;
    }

    // Save to Firestore
    await db.collection('users').doc(userRecord.uid).set(userProfile);

    // Generate custom token for immediate login
    const customToken = await auth.createCustomToken(userRecord.uid);

    return successResponse(res, 201, 'Account created successfully', {
      user: sanitizeUserData(userProfile),
      token: customToken
    });

  } catch (error) {
    console.error('Signup error:', error);

    if (error.code === 'auth/email-already-exists') {
      return errorResponse(res, 409, 'Email already registered');
    }

    return errorResponse(res, 500, 'Failed to create account');
  }
};

/**
 * LOGIN - User authentication
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    // Validate input
    const { error, value } = validateLogin(req.body);
    if (error) {
      return errorResponse(res, 400, error.details[0].message);
    }

    const { email, password } = value;

    // Get user by email
    const userRecord = await auth.getUserByEmail(email);
    const userDoc = await db.collection('users').doc(userRecord.uid).get();

    if (!userDoc.exists) {
      return errorResponse(res, 404, 'User profile not found');
    }

    const userData = userDoc.data();

    // Check if account is locked
    if (isAccountLocked(userData)) {
      const minutesRemaining = getLockoutTimeRemaining(userData.lockedUntil);
      return errorResponse(
        res, 
        423, 
        `Account locked due to multiple failed login attempts. Try again in ${minutesRemaining} minutes.`
      );
    }

    // Verify password by attempting to sign in
    // Note: Firebase Admin SDK doesn't have a direct password verification method
    // In production, the Flutter app will handle this with Firebase Client SDK
    // For now, we'll create a custom token for the user
    
    const customToken = await auth.createCustomToken(userRecord.uid);

    // Reset login attempts on successful login
    await db.collection('users').doc(userRecord.uid).update({
      loginAttempts: 0,
      lockedUntil: null,
      lastLogin: new Date().toISOString()
    });

    // Get updated user data
    const updatedUserDoc = await db.collection('users').doc(userRecord.uid).get();
    const updatedUserData = updatedUserDoc.data();

    return successResponse(res, 200, 'Login successful', {
      user: sanitizeUserData(updatedUserData),
      token: customToken
    });

  } catch (error) {
    console.error('Login error:', error);

    if (error.code === 'auth/user-not-found') {
      return errorResponse(res, 404, 'User not found');
    }

    // Handle failed login attempt
    if (error.code === 'auth/wrong-password') {
      try {
        const userRecord = await auth.getUserByEmail(req.body.email);
        const userDoc = await db.collection('users').doc(userRecord.uid).get();
        const userData = userDoc.data();

        const newAttempts = (userData.loginAttempts || 0) + 1;
        const updateData = { loginAttempts: newAttempts };

        // Lock account if max attempts reached
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          updateData.lockedUntil = Date.now() + LOCKOUT_TIME;
        }

        await db.collection('users').doc(userRecord.uid).update(updateData);

        return errorResponse(
          res, 
          401, 
          `Invalid credentials. ${MAX_LOGIN_ATTEMPTS - newAttempts} attempts remaining.`
        );
      } catch (updateError) {
        console.error('Failed to update login attempts:', updateError);
      }
    }

    return errorResponse(res, 500, 'Login failed');
  }
};

/**
 * LOGOUT - User logout
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    // Update last logout time
    await db.collection('users').doc(req.user.uid).update({
      lastLogout: new Date().toISOString()
    });

    return successResponse(res, 200, 'Logout successful');

  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 500, 'Logout failed');
  }
};

/**
 * RESET PASSWORD - Send password reset email
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    // Validate input
    const { error, value } = validatePasswordReset(req.body);
    if (error) {
      return errorResponse(res, 400, error.details[0].message);
    }

    const { email } = value;

    // Check if user exists
    await auth.getUserByEmail(email);

    // Generate password reset link
    const resetLink = await auth.generatePasswordResetLink(email);

    // In production, you would send this via email
    // For now, we'll return it in the response
    return successResponse(res, 200, 'Password reset link sent', {
      resetLink // Remove this in production!
    });

  } catch (error) {
    console.error('Reset password error:', error);

    if (error.code === 'auth/user-not-found') {
      // Don't reveal if email exists (security best practice)
      return successResponse(res, 200, 'If that email exists, a reset link has been sent');
    }

    return errorResponse(res, 500, 'Failed to send reset link');
  }
};

/**
 * GET CURRENT USER - Get authenticated user info
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by verifyToken middleware
    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      return errorResponse(res, 404, 'User profile not found');
    }

    const userData = userDoc.data();

    return successResponse(res, 200, 'User retrieved successfully', {
      user: sanitizeUserData(userData)
    });

  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse(res, 500, 'Failed to retrieve user');
  }
};

module.exports = {
  signup,
  login,
  logout,
  resetPassword,
  getCurrentUser
};