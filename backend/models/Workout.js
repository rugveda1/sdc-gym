const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    muscle: { type: String, required: true },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('WorkoutLog', workoutSchema);
