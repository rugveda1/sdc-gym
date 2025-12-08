const express = require('express');
const mongoose = require('mongoose');
const WorkoutLog = require('../models/Workout');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs'];

// Local workout video paths
const VIDEOS = {
    'Chest': ['/workout/chest1.mp4', '/workout/chest2.mp4'],
    'Back': ['/workout/back1.mp4', '/workout/back2.mp4'],
    'Legs': ['/workout/legs1.mp4', '/workout/legs2.mp4'],
    'Shoulders': ['/workout/shoulder1.mp4', '/workout/shoulder2.mp4'],
    'Arms': ['/workout/arms1.mp4', '/workout/arms2.mp4'],
    'Abs': ['/workout/abs1.mp4', '/workout/abs2.mp4']
};

router.get('/allowed', authenticateToken, async (req, res) => {
    try {
        // Convert userId to ObjectId
        const userObjectId = new mongoose.Types.ObjectId(req.user.userId);

        // Find the most recent workout
        const lastWorkout = await WorkoutLog.findOne({ userId: userObjectId })
            .sort({ date: -1 })
            .exec();

        let allowed = MUSCLE_GROUPS;

        if (lastWorkout) {
            const lastDate = new Date(lastWorkout.date);
            const today = new Date();

            // Check if it was "yesterday" or today (simple 24h check or date comparison)
            // For simplicity, if it was within the last 24 hours, we exclude that muscle
            const diffTime = Math.abs(today - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 1) {
                allowed = MUSCLE_GROUPS.filter(m => m !== lastWorkout.muscle);
            }
        }

        res.json(allowed);
    } catch (error) {
        console.error('Allowed workouts error:', error);
        res.status(500).json({ error: 'Failed to fetch allowed workouts' });
    }
});

router.post('/start', authenticateToken, async (req, res) => {
    const { muscle } = req.body;
    try {
        // Convert userId to ObjectId
        const userObjectId = new mongoose.Types.ObjectId(req.user.userId);

        const workout = new WorkoutLog({
            userId: userObjectId,
            muscle,
        });
        await workout.save();

        // Return muscle-specific video URLs
        const videos = VIDEOS[muscle] || VIDEOS['Chest'];
        console.log(`Starting workout for ${muscle}. Videos:`, videos);
        res.json({ videos, muscle });
    } catch (error) {
        console.error('Start workout error:', error);
        res.status(400).json({ error: 'Failed to log workout' });
    }
});

module.exports = router;
