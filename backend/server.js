// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');
const userRoutes = require('./routes/users');
const fitnessDataRoutes = require('./routes/fitnessData');
const { cleanupOldData } = require('./utils/fitnessDataUtils'); // Make sure this path is correct

// Connect to the Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/fitnessData', fitnessDataRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

// Start the server and schedule cleanup
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    setInterval(cleanupOldData, 24 * 60 * 60 * 1000); // Schedule cleanup to run every 24 hours
});
