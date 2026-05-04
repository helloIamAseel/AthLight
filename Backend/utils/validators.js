const Joi = require('joi');
const {
  PASSWORD_MIN_LENGTH,
  SPORTS,
  ROLES,
  ATHLETE_SPORT_AGE_RANGES,
  COACH_SCOUT_AGE_RANGE,
  PHONE_PATTERNS,
  CITIES_BY_COUNTRY_CODE,
  NATIONALITIES,
  FOOTBALL_POSITIONS,
  PADEL_SIDES,
  SIGNUP_STEPS
} = require("../config/constants");
const { calculateAge } = require("../utils/helpers");

/**
 * Validation schemas using Joi
 * These check if user input is correct before processing
 */

// Sign up validation
const validateGeneralInfo = (data) => {
  const schema = Joi.object({

    // Names
    firstName: Joi.string().max(75).required(), // Required + must not exceed 75 char
    middleName: Joi.string().allow("").optional(), // Not required
    lastName: Joi.string().max(75).required(), // Required + must not exceed 75 char

    // Email
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),

    // Password
    /*password: Joi.string()
      .min(PASSWORD_MIN_LENGTH)
      .pattern(/[A-Z]/)
      .pattern(/[0-9]/)
      .required()
      .messages({
        "string.min": `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
        "string.pattern.base": "Password must contain at least one uppercase letter and one number",
        "any.required": "Password is required"
      }),
      */


    // Birth date
    dateOfBirth: Joi.date().less("now").required(), // Ensure birth date is in the past (no future dates allowed)

    // Gender
    gender: Joi.string()
      .valid("male", "female") // Only allow specific values
      .required(),

    // Country
    country: Joi.string()
      .valid(...Object.keys(CITIES_BY_COUNTRY_CODE)) // Must match supported countries
      .required(),

    // City
    city: Joi.string().required(), // City name (cross-validated with country in Joi custom validation)

    // Nationality
    nationality: Joi.string()
      .valid(...NATIONALITIES) // Must be one of the supported nationalities
      .required(),

    // Phone Number
    phoneNumber: Joi.string().required(),

    // Role
    role: Joi.string()
      .valid(ROLES.ATHLETE, ROLES.COACH, ROLES.SCOUT)
      .required(),

    // Sport
    sport: Joi.string()
      .valid(...SPORTS)
      .required(),

    // User Club name
    clubName: Joi.string().required()
  }).custom((value, helpers) => {
    const { role, sport, dateOfBirth, country, city, phoneNumber } = value;

    const age = calculateAge(dateOfBirth);

    // Validate city belongs to selected country
    if (
      CITIES_BY_COUNTRY_CODE[country] &&
      !CITIES_BY_COUNTRY_CODE[country].includes(city)
    ) {
      return helpers.message("City is not valid for the selected country");
    }

    // Validate phone number format based on country
    if (PHONE_PATTERNS[country] && !PHONE_PATTERNS[country].test(phoneNumber)) {
      return helpers.message("Phone number is not valid for the selected country");
    }

    if (role === ROLES.ATHLETE) {
      const ageRange = ATHLETE_SPORT_AGE_RANGES[sport];

      // Ensure sport has defined age range
      if (!ageRange) {
        return helpers.message("Age range is not defined for this sport");
      }

      // Validate athlete age is within allowed range
      if (age < ageRange.min || age > ageRange.max) {
        return helpers.message(
          `Athlete age for ${sport} must be between ${ageRange.min} and ${ageRange.max}`
        );
      }
    }
    // Coach / Scout age validation
    if (role === ROLES.COACH || role === ROLES.SCOUT) {
      if (age < COACH_SCOUT_AGE_RANGE.min || age > COACH_SCOUT_AGE_RANGE.max) {
        return helpers.message(
          `Age for ${role} must be between ${COACH_SCOUT_AGE_RANGE.min} and ${COACH_SCOUT_AGE_RANGE.max}`
        );
      }
    }

    return value;
  });

  return schema.validate(data, { abortEarly: false });
};

const validateAthleteInfo = (data) => {
  const schema = Joi.object({
    draftId: Joi.string()
      .required()
      .messages({
        "any.required": "Draft ID is missing"
      }),

    sport: Joi.string()
      .valid(...SPORTS)
      .required()
      .messages({
        "any.only": "Invalid sport selected",
        "any.required": "Sport is required"
      }),

    position: Joi.string()
      .valid(...FOOTBALL_POSITIONS.map(p => p.value))
      .optional()
      .messages({
        "any.only": "Invalid football position selected"
      }),

    preferredSide: Joi.string()
      .valid(...PADEL_SIDES.map(p => p.value))
      .optional()
      .messages({
        "any.only": "Preferred side must be RIGHT or LEFT"
      }),

    heightCm: Joi.number()
      .min(100)
      .max(250)
      .required()
      .messages({
        "number.base": "Height must be a number",
        "number.min": "Height must be at least 100 cm",
        "number.max": "Height cannot exceed 250 cm",
        "any.required": "Height is required"
      }),

    weightKg: Joi.number()
      .min(30)
      .max(200)
      .required()
      .messages({
        "number.base": "Weight must be a number",
        "number.min": "Weight must be at least 30 kg",
        "number.max": "Weight cannot exceed 200 kg",
        "any.required": "Weight is required"
      }),

    injuryNotes: Joi.string()
      .allow("")
      .optional()
  })
    .custom((value, helpers) => {
      // Football
      if (value.sport === "Football" && !value.position) {
        return helpers.message("Position is required for football players");
      }

      // Padel
      if (value.sport === "Padel" && !value.preferredSide) {
        return helpers.message("Preferred side is required for padel players");
      }

      return value;
    });

  return schema.validate(data, { abortEarly: false });
};

// OTP
const validateSendOTP = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
  });
  return schema.validate(data);
};

const validateVerifyOTP = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
      'string.length': 'OTP must be exactly 6 digits',
      'string.pattern.base': 'OTP must contain only numbers',
      'any.required': 'OTP is required'
    })
  });
  return schema.validate(data);
};

// Login validation
const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  });

  return schema.validate(data);
};

// Profile update validation
const validateProfileUpdate = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    phoneNumber: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    bio: Joi.string().max(500).optional(),
    location: Joi.string().max(100).optional(),
    // Athlete-specific fields
    height: Joi.number().min(100).max(250).optional(), // cm
    weight: Joi.number().min(30).max(200).optional(), // kg
    position: Joi.string().max(50).optional(),
    // Coach/Scout-specific fields
    experience: Joi.number().min(0).max(50).optional(), // years
    specialization: Joi.string().max(100).optional()
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  });

  return schema.validate(data, { abortEarly: false });
};

// Password reset validation
const validatePasswordReset = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
  });

  return schema.validate(data);
};

// Video upload validation
const validateVideoUpload = (data) => {
  const schema = Joi.object({
    videoName: Joi.string().min(3).max(100).required().messages({
      'string.min': 'Video name must be at least 3 characters',
      'any.required': 'Video name is required'
    }),
    videoType: Joi.string().valid('match', 'training').required().messages({
      'any.only': 'Video type must be match or training',
      'any.required': 'Video type is required'
    }),
    description: Joi.string().max(500).optional()
  });

  return schema.validate(data);
};

module.exports = {
  //validateSignup,
  validateGeneralInfo,
  validateAthleteInfo,
  validateLogin,
  validateProfileUpdate,
  validatePasswordReset,
  validateVideoUpload,
  validateSendOTP,
  validateVerifyOTP
};