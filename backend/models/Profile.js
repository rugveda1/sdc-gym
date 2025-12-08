const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    weightKg: { type: Number, required: true },
    heightCm: { type: Number, required: true },
    region: { type: String, required: true },
    eatingHabits: { type: String, required: true },
    goal: { type: String, required: true },
});

module.exports = mongoose.model('Profile', profileSchema);
