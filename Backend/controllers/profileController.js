const { db } = require('../config/firebase');

// =========================
// Get My Profile
// =========================
const getMyProfile = async (req, res) => {
    console.log("🚀 CONTROLLER IS RUNNING");
    try {
        const userId = req.user.uid;

        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({
                error: 'Profile not found'
            });
        }

        return res.json({
            id: userDoc.id,
            ...userDoc.data()
        });

    } catch (error) {
        console.error("FIREBASE ERROR:", error);
        return res.status(500).json({
            error: error.message
        });
    }
};

// =========================
// Get Profile By ID
// =========================
const getProfileById = async (req, res) => {
    try {
        const { userId } = req.params;

        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({
                error: 'Profile not found'
            });
        }

        return res.json({
            id: userDoc.id,
            ...userDoc.data()
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message
        });
    }
};

// =========================
// Update My Profile
// =========================
const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user.uid;

        const allowedFields = [
            'firstName',
            'middleName',
            'fullName',
            'lastName',
            'dateOfBirth',
            'gender',
            'country',
            'city',
            'phoneNumber',
            'nationality',
            'email',
            'sport',
            'clubName',
            'biography',
            'whatsapp',
            'twitter',
            'profileImage',

            // Athlete fields
            'playerPosition',
            'preferredSide',
            'height',
            'weight',
            'injuryHistory',
            'skills',

            // Coach fields
            //'clubAcademy',
            'yearsOfExperience',
            'specialties',

            // Scout fields
            'organization',
            'regionOfScoutingFocus',
            'preferredPosition',
            'preferredMinAge',
            'preferredMaxAge',
            'preferredAttributes'
        ];

        const updateData = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        updateData.updatedAt = new Date();

        await db.collection('users').doc(userId).update(updateData);
        if (req.body.sportType && !req.body.sport) {
            updateData.sport = req.body.sportType;
        }

        return res.json({
            message: 'Profile updated successfully',
            data: updateData
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message
        });
    }
};

module.exports = {
    getMyProfile,
    getProfileById,
    updateMyProfile
};