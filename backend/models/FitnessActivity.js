// FitnessActivity.js
const mongoose = require('mongoose');

// Schema for daily fitness activity data
const dailyActivitySchema = new mongoose.Schema({
    date: String, // Format: "YYYY-MM-DD"
    steps: Number,
    distance: Number, // e.g., in kilometers or miles
    duration: Number, // e.g., in minutes
    carbonFootprint: Number
    // Add other fields if needed
});

// Main schema for user's fitness activity
const fitnessActivitySchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: 'User',
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
