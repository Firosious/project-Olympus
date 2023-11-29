// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User'); // Adjust the path as needed
require('dotenv').config();
const connectDB = require('./config/database'); // Import connectDB from database.js

// Connect to the Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// User login or register endpoint
app.post('/api/users/authenticate', async (req, res) => {
    try {
        const { googleId, firstName } = req.body;
        let user = await User.findOne({ googleId });
        if (!user) {
            user = new User({ googleId, firstName });
            await user.save();
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Add other API routes as needed...

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));