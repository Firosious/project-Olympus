// fitnessData.js
const express = require('express');
const router = express.Router();
const FitnessActivity = require('../models/FitnessActivity.js');
const fetchGoogleFitData = require('../utils/fetchGoogleFitData');
const { addOrUpdateDailyRecord } = require('../utils/fitnessDataUtils');

router.post('/sync', async (req, res) => {
    const { userId, accessToken, startDate, endDate } = req.body;

    // Check if startDate and endDate are provided
    if (!startDate || !endDate) {
        return res.status(400).send('Start date and end date are required.');
    }

    console.log('Syncing data for user:', userId);

    try {
        const fitnessData = await fetchGoogleFitData(accessToken, new Date(startDate), new Date(endDate));
        console.log('Fetched data from Google Fit:', fitnessData);

        for (const activity of fitnessData) {
            const activityDate = new Date(activity.date);
            const year = activityDate.getFullYear();
            const month = String(activityDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed

            // Update activity object with correct date format
            activity.date = activityDate.toISOString().split('T')[0];

            await addOrUpdateDailyRecord(userId, year, month, activity);
        }

        res.status(200).json({ message: 'Data synced successfully' });
    } catch (err) {
        console.error('Error in fitnessData /sync:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;