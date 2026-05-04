const { auth, db } = require('../config/firebase');
const { ROLES, MAX_LOGIN_ATTEMPTS, LOCKOUT_TIME } = require('../config/constants');
const {
  validateGeneralInfo,
  validateAthleteInfo,
  //validateSignup, 
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

const saveGeneralInfo = async (req, res) => {
  try {
    const { error, value } = validateGeneralInfo(req.body);

    if (error) {
      return errorResponse(res, 400, error.details.map(d => d.message).join(', '));
    }

    const draftRef = await db.collection("registrationDrafts").add({
      ...value,
      signupStep: "general_info",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return successResponse(res, 201, "General info saved successfully", {
      draftId: draftRef.id,
      signupStep: "general_info"
    });

  } catch (error) {
    console.error("Save general info error:", error);
    return errorResponse(res, 500, "Failed to save general info");
  }
};

const saveAthleteInfo = async (req, res) => {
  try {
    const { draftId } = req.body;

    if (!draftId) {
      return res.status(400).json({
        error: "Draft ID is missing"
      });
    }

    // 1. Get draft from Firestore
    const draftRef = db.collection("registrationDrafts").doc(draftId);
    const draftDoc = await draftRef.get();

    if (!draftDoc.exists) {
      return res.status(404).json({
        error: "Draft not found"
      });
    }

    const draftData = draftDoc.data();

    // 2. Check role
    if (draftData.role !== ROLES.ATHLETE) {
      return res.status(403).json({
        error: "Only athletes can submit this step"
      });
    }

    // 3. Merge sport from draft with request body
    const dataToValidate = {
      ...req.body,
      sport: draftData.sport
    };

    // 4. Validate
    const { error, value } = validateAthleteInfo(dataToValidate);

    if (error) {
      return res.status(400).json({
        error: error.details.map(d => d.message).join(", ")
      });
    }

    // 5. Remove fields we don't want to save
    const { draftId: validatedDraftId, sport, ...athleteData } = value;

    // 6. Save to Firestore
    await draftRef.update({
      ...athleteData,
      signupStep: "role_specific",
      updatedAt: new Date().toISOString()
    });

    return res.status(200).json({
      message: "Athlete info saved successfully",
      draftId: validatedDraftId
    });

  } catch (err) {
    console.error("Error saving athlete info:", err);
    return res.status(500).json({
      error: "Server error"
    });
  }
};
const bcrypt = require("bcrypt");

/**
 * Complete signup from draft
 */
const completeSignup = async (req, res) => {
  try {
    const { draftId, password } = req.body;

    // 1. Get draft
    const draftRef = db.collection("registrationDrafts").doc(draftId);
    const draftDoc = await draftRef.get();

    if (!draftDoc.exists) {
      return errorResponse(res, 404, "Draft not found");
    }

    const draftData = draftDoc.data();

    // 2. Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: draftData.email,
      password: password,
      displayName: `${draftData.firstName} ${draftData.lastName}`
    });

    // 3. Hash password (optional)
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Create Firestore user
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: draftData.email,
      fullName: `${draftData.firstName} ${draftData.lastName}`,
      role: draftData.role,

      // fields from draft
      firstName: draftData.firstName,
      middleName: draftData.middleName,
      lastName: draftData.lastName,
      dateOfBirth: draftData.dateOfBirth,
      gender: draftData.gender,
      country: draftData.country,
      city: draftData.city,
      nationality: draftData.nationality,
      phoneNumber: draftData.phoneNumber,
      sport: draftData.sport,
      clubName: draftData.clubName,

      passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 5. Delete draft
    await draftRef.delete();

    return successResponse(res, 201, "Account created successfully", {
      userId: userRecord.uid,
    });

  } catch (error) {
    console.error("Complete signup error:", error);
    return errorResponse(res, 500, "Failed to complete signup");
  }
};

/**
 * 
 * POST /api/auth/signup
 */
const signup = async (req, res) => {
  try {
    // Validate input
    const { error, value } = validateSignup(req.body);
    if (error) {
      return errorResponse(res, 400, error.details.map(d => d.message).join(', '));
    }

    // General users info (consistent across the three roles)
    const {
      firstName,
      middleName,
      lastName,
      email,
      password,
      dateOfBirth,
      gender,
      country,
      city,
      nationality,
      phoneNumber,
      sport,
      clubName,
      role,
    } = value;

    const allowedRoles = [ROLES.ATHLETE, ROLES.COACH, ROLES.SCOUT]; // The three users within the Athlight system
    /** Checks if the role is one of the three, if not display an error */
    if (!allowedRoles.includes(role)) {
      return errorResponse(res, 400, "Invalid role");
    }
    const fullName = [firstName, middleName, lastName]
      .filter(Boolean) // Removes empty values (like missing middleName)
      .join(" "); // Join with spaces

    const finalRole = role;

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: fullName
    });

    // Create user profile in Firestore
    const userProfile = {
      uid: userRecord.uid,
      email,
      fullName: fullName,
      role: finalRole,
      dateOfBirth,
      gender,
      country,
      city,
      nationality,
      phoneNumber,
      sport,
      clubName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      loginAttempts: 0,
      isActive: true
    };

    // Add role-specific fields
    if (finalRole === ROLES.ATHLETE && sport) {
      userProfile.sport = sport;
      userProfile.videos = [];
      userProfile.stats = {};
    }

    /** if (phoneNumber) {
      userProfile.phoneNumber = phoneNumber;
    } */

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
  saveGeneralInfo,
  saveAthleteInfo,
  completeSignup,
  signup,
  login,
  logout,
  resetPassword,
  getCurrentUser
};