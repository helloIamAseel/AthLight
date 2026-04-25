const Joi = require('joi');
const { PASSWORD_MIN_LENGTH } = require('../config/constants');

/**
 * Validation schemas using Joi
 * These check if user input is correct before processing
 */

// Sign up validation
const validateSignup = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(PASSWORD_MIN_LENGTH).required().messages({
      'string.min': `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      'any.required': 'Password is required'
    }),
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Name must be at least 2 characters',
      'any.required': 'Name is required'
    }),
    role: Joi.string().valid('athlete', 'coach', 'scout').required().messages({
      'any.only': 'Role must be athlete, coach, or scout',
      'any.required': 'Role is required'
    }),
    sport: Joi.string().valid('football', 'swimming', 'running', 'padel').when('role', {
      is: 'athlete',
      then: Joi.required(),
      otherwise: Joi.optional()
    }).messages({
      'any.only': 'Sport must be football, swimming, running, or padel',
      'any.required': 'Sport is required for athletes'
    }),
    phoneNumber: Joi.string().pattern(/^[0-9]{10,15}$/).optional().messages({
      'string.pattern.base': 'Phone number must be 10-15 digits'
    })
  });

  return schema.validate(data, { abortEarly: false });
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
  validateSignup,
  validateLogin,
  validateProfileUpdate,
  validatePasswordReset,
  validateVideoUpload
};