// users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust the path to your User model

// POST /api/users/authenticate
router.post('/authenticate', async (req, res) => {
    console.log('Received data:', req.body);
    const { googleId, firstName, lastName, email } = req.body;

    try {
        let user = await User.findOne({ googleId });

        if (!user) {
            // If the user doesn't exist, create a new one
            user = new User({ googleId, firstName, lastName, email });
            await user.save();
        } else {
            // Optionally update user data if it already exists
            user.firstName = firstName;
            user.lastName = lastName;
            user.email = email;
            await user.save();
        }

        res.status(200).json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
