const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const DietPlan = require('./models/Diet');
const IORedis = require('ioredis');
const dotenv = require('dotenv');
const { generateDietPlan } = require('./agents/dietAgent');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('✅ Worker connected to MongoDB'))
    .catch(err => console.error('❌ Worker MongoDB connection failed:', err));

const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
});

console.log("Worker started, listening to 'diet' queue...");

const worker = new Worker('diet', async (job) => {
    console.log(`Processing job ${job.id} for user ${job.data.userId}`);

    const { userId, profile } = job.data;

    try {
        // 1. Generate Plan via Agent
        const dietPlan = await generateDietPlan(profile);

        // 2. Save to Database
        // Convert userId to ObjectId
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const dietPlanDoc = new DietPlan({
            userId: userObjectId,
            planData: JSON.stringify(dietPlan),
        });
        await dietPlanDoc.save();

        console.log(`Job ${job.id} completed.`);
        return dietPlan;

    } catch (error) {
        console.error(`Job ${job.id} failed:`, error);
        throw error;
    }
}, { connection });

worker.on('completed', job => {
    console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`${job.id} has failed with ${err.message}`);
});
