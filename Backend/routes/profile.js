const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/auth');
const {
    getMyProfile,
    getProfileById,
    updateMyProfile
} = require('../controllers/profileController');

router.get('/me', verifyToken, getMyProfile);

router.put('/me', verifyToken, updateMyProfile);

module.exports = router;