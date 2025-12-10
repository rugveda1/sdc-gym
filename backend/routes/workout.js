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

// GET /api/workout/history - Get workout dates for the year (for activity calendar)
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const userObjectId = new mongoose.Types.ObjectId(req.user.userId);

        // Get start of current year
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59);

        const workouts = await WorkoutLog.find({
            userId: userObjectId,
            date: { $gte: startOfYear, $lte: endOfYear }
        }).sort({ date: 1 });

        // Group by date (YYYY-MM-DD)
        const dateMap = {};
        workouts.forEach(w => {
            const dateKey = w.date.toISOString().split('T')[0];
            if (!dateMap[dateKey]) {
                dateMap[dateKey] = { count: 0, muscles: [] };
            }
            dateMap[dateKey].count++;
            dateMap[dateKey].muscles.push(w.muscle);
        });

        res.json(dateMap);
    } catch (error) {
        console.error('Workout history error:', error);
        res.status(500).json({ error: 'Failed to fetch workout history' });
    }
});

// GET /api/workout/stats - Get streak statistics
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const userObjectId = new mongoose.Types.ObjectId(req.user.userId);

        const workouts = await WorkoutLog.find({ userId: userObjectId })
            .sort({ date: -1 });

        if (workouts.length === 0) {
            return res.json({ currentStreak: 0, maxStreak: 0, totalWorkouts: 0 });
        }

        // Get unique workout dates (YYYY-MM-DD)
        const uniqueDates = [...new Set(workouts.map(w =>
            w.date.toISOString().split('T')[0]
        ))].sort().reverse(); // Most recent first

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // Calculate current streak
        let currentStreak = 0;
        let checkDate = uniqueDates[0] === today || uniqueDates[0] === yesterday ? uniqueDates[0] : null;

        if (checkDate) {
            for (let i = 0; i < uniqueDates.length; i++) {
                const expectedDate = new Date(checkDate);
                expectedDate.setDate(expectedDate.getDate() - i);
                const expected = expectedDate.toISOString().split('T')[0];

                if (uniqueDates[i] === expected) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }

        // Calculate max streak
        let maxStreak = 0;
        let tempStreak = 1;
        const sortedDates = [...uniqueDates].sort(); // Oldest first

        for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = new Date(sortedDates[i - 1]);
            const currDate = new Date(sortedDates[i]);
            const diffDays = Math.round((currDate - prevDate) / 86400000);

            if (diffDays === 1) {
                tempStreak++;
            } else {
                maxStreak = Math.max(maxStreak, tempStreak);
                tempStreak = 1;
            }
        }
        maxStreak = Math.max(maxStreak, tempStreak);

        res.json({
            currentStreak,
            maxStreak,
            totalWorkouts: workouts.length
        });
    } catch (error) {
        console.error('Workout stats error:', error);
        res.status(500).json({ error: 'Failed to fetch workout stats' });
    }
});

module.exports = router;
