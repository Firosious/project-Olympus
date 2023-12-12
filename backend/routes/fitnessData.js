const express = require('express');
const router = express.Router();
const User = require('../models/User');
const FitnessActivity = require('../models/FitnessActivity');
const fetchGoogleFitData = require('../utils/fetchGoogleFitData');
const { addOrUpdateDailyRecord } = require('../utils/fitnessDataUtils');

const syncStatus = {};

async function getUserDetails(userId) {
    try {
        const user = await User.findOne({ googleId: userId });
        return user ? { sex: user.sex, heightInCm: user.heightInCm } : null;
    } catch (err) {
        console.error('Error fetching user details:', err);
        return null;
    }
}

router.post('/sync', async (req, res) => {
    const { userId, accessToken, startDate, endDate } = req.body;

    if (!startDate || !endDate) {
        return res.status(400).send('Start date and end date are required.');
    }

    console.log('Syncing data for user:', userId);
    syncStatus[userId] = { progress: 0 };

    try {
        const userDetails = await getUserDetails(userId);
        if (!userDetails) {
            return res.status(404).json({ error: 'User details not found' });
        }

        const fitnessData = await fetchGoogleFitData(
            accessToken,
            new Date(startDate),
            new Date(endDate),
            userDetails.sex,
            userDetails.heightInCm
        );
        console.log('Fetched data from Google Fit:', fitnessData);

        const totalActivities = fitnessData.length;
        let processedActivities = 0;

        for (const activity of fitnessData) {
            const activityDate = new Date(activity.date);
            const year = activityDate.getFullYear();
            const month = String(activityDate.getMonth() + 1).padStart(2, '0');
            activity.date = activityDate.toISOString().split('T')[0];

            await addOrUpdateDailyRecord(userId, year, month, activity);

            processedActivities++;
            syncStatus[userId].progress = Math.round((processedActivities / totalActivities) * 100);
        }

        res.status(200).json({ message: 'Data synced successfully' });
    } catch (err) {
        console.error('Error in fitnessData /sync:', err);
        res.status(500).json({ error: err.message });
        delete syncStatus[userId];
    }
});

router.get('/syncStatus/:userId', (req, res) => {
    const { userId } = req.params;
    req.socket.setTimeout(24 * 60 * 60 * 1000); // 24 hours in milliseconds
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    const sendProgress = () => {
        const progress = syncStatus[userId]?.progress || 0;
        res.write(`data: ${JSON.stringify({ progress })}\n\n`);
        if (progress === 100) {
            delete syncStatus[userId];
        }
    };

    sendProgress();
    const intervalId = setInterval(sendProgress, 1000);

    req.on('close', () => {
        clearInterval(intervalId);
        res.end();
    });
});

// GET /api/fitnessData/weekly/:userId
router.get('/weekly/:userId', async (req, res) => {
    const { userId } = req.params;
    const { start, end } = req.query;

    const startDate = new Date(start);
    const endDate = new Date(end);
    const monthKey = String(startDate.getMonth() + 1).padStart(2, '0');

    try {
        const fitnessActivity = await FitnessActivity.findOne({ userId });
        if (!fitnessActivity || !fitnessActivity.monthlyData.get(monthKey)) {
            return res.status(404).json({ message: 'No data found' });
        }

        let weeklyData = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            let date = d.toISOString().split('T')[0];
            let dailyData = fitnessActivity.monthlyData.get(monthKey).find(record => record.date === date);
            weeklyData.push({ date, steps: dailyData?.steps || 0, distance: dailyData?.distance || 0 });
        }

        res.json(weeklyData);
    } catch (err) {
        console.error('Error fetching weekly data:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
