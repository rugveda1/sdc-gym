const express = require('express');
const { Queue } = require('bullmq');
const mongoose = require('mongoose');
const Profile = require('../models/Profile');
const DietPlan = require('../models/Diet');
const authenticateToken = require('../middleware/auth');
const IORedis = require('ioredis');

const router = express.Router();

// Redis connection for BullMQ
const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
});

const dietQueue = new Queue('diet', { connection });

router.post('/generate', authenticateToken, async (req, res) => {
    try {
        // Convert userId to ObjectId
        const userObjectId = new mongoose.Types.ObjectId(req.user.userId);

        const profile = await Profile.findOne({ userId: userObjectId });

        if (!profile) {
            return res.status(400).json({ error: 'Profile not found. Please complete profile first.' });
        }

        // Add job to queue
        const job = await dietQueue.add('generate-diet', {
            userId: req.user.userId,
            profile: profile.toObject(), // Convert mongoose doc to plain object
        });

        res.json({ jobId: job.id, message: 'Diet generation started' });
    } catch (error) {
        console.error('Generate diet error:', error);
        res.status(500).json({ error: 'Failed to queue diet generation' });
    }
});

router.get('/result', authenticateToken, async (req, res) => {
    const { jobId } = req.query;
    if (!jobId) return res.status(400).json({ error: 'Missing jobId' });

    try {
        const job = await dietQueue.getJob(jobId);

        if (!job) {
            // Convert userId to ObjectId
            const userObjectId = new mongoose.Types.ObjectId(req.user.userId);

            // Check if we have a stored plan if job is gone (TTL)
            const plan = await DietPlan.findOne({ userId: userObjectId })
                .sort({ createdAt: -1 })
                .exec();

            return res.json({ status: 'completed', result: plan ? JSON.parse(plan.planData) : null });
        }

        const state = await job.getState();
        const result = job.returnvalue;

        if (state === 'completed') {
            res.json({ status: 'completed', result });
        } else if (state === 'failed') {
            res.json({ status: 'failed', error: job.failedReason });
        } else {
            res.json({ status: 'pending' });
        }
    } catch (error) {
        console.error('Get diet result error:', error);
        res.status(500).json({ error: 'Failed to get job status' });
    }
});

module.exports = router;
