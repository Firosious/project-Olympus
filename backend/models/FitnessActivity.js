// FitnessActivity.js
const mongoose = require('mongoose');

// Schema for daily fitness activity data
const dailyActivitySchema = new mongoose.Schema({
    date: String, // Format: "YYYY-MM-DD"
    steps: Number,
    distance: Number, // e.g., in kilometers or miles
    pace: Number, // e.g., minutes per kilometer
    duration: Number, // e.g., in minutes
    carbonFootprint: Number
    // Add other fields if needed
});

// Main schema for user's fitness activity
const fitnessActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Assuming Google ID is stored as an ObjectId reference to a User model
        ref: 'User', // Replace 'User' with your User model name if different
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    // Use a Map for dynamic monthly data keys
    monthlyData: {
        type: Map,
        of: [dailyActivitySchema],
        default: {}
    }
});

module.exports = mongoose.model('FitnessActivity', fitnessActivitySchema);
