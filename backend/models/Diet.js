const mongoose = require('mongoose');

const dietSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planData: { type: String, required: true }, // Storing JSON string as per original design
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DietPlan', dietSchema);
