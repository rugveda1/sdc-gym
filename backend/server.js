const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Basic Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const workoutRoutes = require('./routes/workout');
const dietRoutes = require('./routes/diet');
const exerciseRoutes = require('./routes/exercises');

app.use('/api', authRoutes);
app.use('/api', profileRoutes);
app.use('/api/workout', workoutRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/exercises', exerciseRoutes);

mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('✅ Connected to MongoDB via Mongoose'))
    .catch(err => console.error('❌ MongoDB connection failed:', err));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
