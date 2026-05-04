module.exports = {
  // User roles
  ROLES: {
    ATHLETE: 'athlete',
    COACH: 'coach',
    SCOUT: 'scout'
  },

  // Sports supported
  SPORTS: ["Football", "Running", "Padel", "Swimming"],

  // Athletes age range
  ATHLETE_SPORT_AGE_RANGES: {
    Football: { min: 16, max: 35 },
    Swimming: { min: 12, max: 40 },
    Padel: { min: 16, max: 60 },
    Running: { min: 15, max: 40 }
  },

  // Coach, Scout age range
  COACH_SCOUT_AGE_RANGE: {
    min: 18,
    max: 75
  },

  // Cities by country
  CITIES_BY_COUNTRY_CODE: {
    SA: ["Riyadh", "Jeddah", "Makkah", "Madinah", "Dammam", "Khobar", "Dhahran", "Taif", "Abha", "Tabuk", "Hail", "Yanbu", "Najran", "Jazan"],
    AE: ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Al Ain"],
    EG: ["Cairo", "Giza", "Alexandria", "Luxor", "Aswan", "Port Said", "Suez"],
    KW: ["Kuwait City", "Salmiya", "Jahra"],
    QA: ["Doha", "Al Rayyan", "Al Wakrah", "Al Khor"],
    BH: ["Manama", "Riffa", "Muharraq"],
    OM: ["Muscat", "Salalah", "Sohar", "Nizwa"],
    JO: ["Amman", "Irbid", "Zarqa", "Aqaba"],
    MA: ["Rabat", "Casablanca", "Marrakesh", "Tangier"],
    DZ: ["Algiers", "Oran", "Constantine", "Annaba"]
  },

  // Phone validation patterns
  PHONE_PATTERNS: {
    SA: /^[5][0-9]{8}$/,
    AE: /^[5][0-9]{8}$/,
    EG: /^1[0-9]{9}$/,
    KW: /^[569][0-9]{7}$/,
    QA: /^[3567][0-9]{7}$/,
    BH: /^[3679][0-9]{7}$/,
    OM: /^[79][0-9]{7}$/,
    JO: /^7[7-9][0-9]{7}$/,
    MA: /^[67][0-9]{8}$/,
    DZ: /^[567][0-9]{8}$/
  },

  NATIONALITIES: [
    "Saudi", "Emirati", "Egyptian", "Kuwaiti", "Qatari",
    "Bahraini", "Omani", "Jordanian", "Moroccan", "Algerian"
  ],

  FOOTBALL_POSITIONS: [
  { label: "Goalkeeper (GK)", value: "GK" },
  { label: "Right Back (RB)", value: "RB" },
  { label: "Left Back (LB)", value: "LB" },
  { label: "Center Back (CB)", value: "CB" },
  { label: "Sweeper (SW)", value: "SW" },
  { label: "Defensive Midfielder (CDM)", value: "CDM" },
  { label: "Central Midfielder (CM)", value: "CM" },
  { label: "Attacking Midfielder (CAM)", value: "CAM" },
  { label: "Right Winger (RW)", value: "RW" },
  { label: "Left Winger (LW)", value: "LW" },
  { label: "Striker (ST)", value: "ST" }
],

PADEL_SIDES: [
  { label: "Right Side", value: "RIGHT" },
  { label: "Left Side", value: "LEFT" }
],

// To store the user step in the progress bar
SIGNUP_STEPS: {
  ROLE_SELECTED: "role_selected",
  GENERAL_INFO: "general_info",
  ROLE_SPECIFIC: "role_specific",
  OTP_VERIFIED: "otp_verified",
  COMPLETED: "completed"
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