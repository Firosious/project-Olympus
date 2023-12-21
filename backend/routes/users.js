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
        } else {
            // Optionally update user data if it already exists
            user.firstName = firstName;
            user.lastName = lastName;
            user.email = email;
        }

        user.lastLogin = new Date(); // Update last login time
        await user.save();

        res.status(200).json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// POST /api/users/updateSettings
router.post('/updateSettings', async (req, res) => {
    const { userId, sex, heightInCm } = req.body;

    try {
        // Find the user by googleId instead of _id
        let user = await User.findOne({ googleId: userId });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Update the user's sex and height
        user.sex = sex;
        user.heightInCm = heightInCm;
        await user.save();

        res.json({ msg: 'User updated successfully', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// GET /api/users/syncTimes/:userId
router.get('/syncTimes/:googleId', async (req, res) => {
    try {
        const user = await User.findOne({ googleId: req.params.googleId });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({
            lastAllDataSync: user.lastAllDataSync,
            last7DaySync: user.last7DaySync
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// GET /api/users/details/:googleId
router.get('/details/:googleId', async (req, res) => {
    try {
        const user = await User.findOne({ googleId: req.params.googleId });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const userDetails = {
            sex: user.sex,
            heightInCm: user.heightInCm
        };

        res.json(userDetails);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;