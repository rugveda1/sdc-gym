const express = require('express');
const mongoose = require('mongoose');
const Profile = require('../models/Profile');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user.userId });
        res.json(profile);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

router.post('/profile', authenticateToken, async (req, res) => {
    const { weightKg, heightCm, region, eatingHabits, goal } = req.body;
    try {
        // Convert userId string to ObjectId
        const userObjectId = new mongoose.Types.ObjectId(req.user.userId);

        const profile = await Profile.findOneAndUpdate(
            { userId: userObjectId },
            {
                userId: userObjectId,
                weightKg,
                heightCm,
                region,
                eatingHabits,
                goal
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.json(profile);
    } catch (error) {
        console.error('Save profile error:', error);
        res.status(400).json({ error: 'Failed to update profile', details: error.message });
    }
});

module.exports = router;
