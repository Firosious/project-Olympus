const FitnessActivity = require('../models/FitnessActivity.js');

async function addOrUpdateDailyRecord(userId, year, month, dailyRecord) {
    try {
        let fitnessActivity = await FitnessActivity.findOne({ userId, year });
        if (!fitnessActivity) {
            fitnessActivity = new FitnessActivity({
                userId,
                year,
                monthlyData: new Map()
            });
        }

        const recordDateObj = new Date(dailyRecord.date);
        const recordDate = recordDateObj.toISOString().split('T')[0];
        const monthKey = String(recordDateObj.getUTCMonth() + 1).padStart(2, '0');

        if (!fitnessActivity.monthlyData.get(monthKey)) {
            fitnessActivity.monthlyData.set(monthKey, []);
        }

        let monthData = fitnessActivity.monthlyData.get(monthKey);
        let record = monthData.find(record => record.date === recordDate);

        // Check if record exists and if steps or distance need to be updated
        if (record) {
            const needsUpdate = record.steps !== dailyRecord.steps || record.distance !== dailyRecord.distance;
            if (needsUpdate) {
                Object.assign(record, dailyRecord);
                fitnessActivity.markModified('monthlyData');
                await fitnessActivity.save();
            }
        } else {
            // If the record doesn't exist, add it
            monthData.push({ ...dailyRecord, date: recordDate });
            fitnessActivity.markModified('monthlyData');
            await fitnessActivity.save();
        }
    } catch (err) {
        console.error('Error in addOrUpdateDailyRecord:', err);
        throw err;
    }
}

async function cleanupOldData() {
    const currentYear = new Date().getFullYear();
    try {
        const result = await FitnessActivity.deleteMany({ year: { $lt: currentYear } });
        console.log(`Data prior to the current year ${currentYear} has been removed. Deleted count: ${result.deletedCount}`);
    } catch (err) {
        console.error('Error during cleanup:', err);
    }
}

module.exports = {
    addOrUpdateDailyRecord,
    cleanupOldData
};
