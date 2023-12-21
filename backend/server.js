// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');
const userRoutes = require('./routes/users');
const fitnessDataRoutes = require('./routes/fitnessData');
const { cleanupOldData } = require('./utils/fitnessDataUtils'); // Make sure this path is correct
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const Leaderboard = require('./models/LeaderboardModel');
const cron = require('node-cron'); // Import node-cron

// Connect to the Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/fitnessData', fitnessDataRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Function to clear leaderboard
async function clearLeaderboard(timeframe) {
    try {
        await Leaderboard.deleteMany({ timeframe });
        console.log(`Leaderboard for ${timeframe} cleared`);
    } catch (err) {
        console.error('Error clearing leaderboard:', err);
    }
}

// Function to reset leaderboards based on the current date
function resetLeaderboards() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const dateOfMonth = today.getDate();
    const month = today.getMonth();
    const year = today.getFullYear();

    // Check for leap year
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

    // Reset daily leaderboard
    clearLeaderboard('daily');

    // Reset weekly leaderboard on Sunday
    if (dayOfWeek === 0) {
        clearLeaderboard('weekly');
    }

    // Reset monthly leaderboard on the last day of the month
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    if (dateOfMonth === lastDayOfMonth || (month === 1 && dateOfMonth === 28 && !isLeapYear)) {
        clearLeaderboard('monthly');
    }
}

// Schedule daily tasks with node-cron
// This will run the task every day at midnight
cron.schedule('0 0 * * *', () => {
    resetLeaderboards();
    cleanupOldData();
    console.log('Daily tasks completed');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});