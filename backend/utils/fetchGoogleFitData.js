const fetch = require('node-fetch');

function getStartOfMonthInMillis(date) {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    return startOfMonth.getTime();
}

function getEndOfMonthInMillis(date) {
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    return endOfMonth.getTime();
}

async function fetchMonthlyData(accessToken, startOfMonth, endOfMonth) {
    const googleFitURL = 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate';

    const requestBody = {
        aggregateBy: [
            { dataTypeName: "com.google.step_count.delta" },
            { dataTypeName: "com.google.distance.delta" }
        ],
        bucketByTime: { durationMillis: 86400000 }, // Daily aggregation
        startTimeMillis: startOfMonth,
        endTimeMillis: endOfMonth
    };

    const response = await fetch(googleFitURL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`Error fetching data from Google Fit: ${response.statusText}`);
    }

    return response.json();
}

async function fetchGoogleFitData(accessToken, startDate, endDate) {
    let transformedData = [];

    let current = new Date(startDate);
    while (current <= endDate) {
        let startOfMonth = getStartOfMonthInMillis(current);
        let endOfMonth = getEndOfMonthInMillis(current);

        try {
            const monthlyData = await fetchMonthlyData(accessToken, startOfMonth, endOfMonth);
            transformedData.push(...transformGoogleFitData(monthlyData));
        } catch (error) {
            console.error(`Error fetching data for month starting ${new Date(startOfMonth).toISOString()}:`, error);
        }

        // Move to the first day of the next month
        current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }

    return transformedData;
}

function transformGoogleFitData(data) {
    let transformedData = [];

    data.bucket.forEach(bucket => {
        const bucketStartTime = new Date(parseInt(bucket.startTimeMillis));
        let steps = 0;
        let distance = 0;

        bucket.dataset.forEach(dataset => {
            dataset.point.forEach(point => {
                if (point.dataTypeName === 'com.google.step_count.delta') {
                    steps += point.value[0].intVal || 0;
                }
                if (point.dataTypeName === 'com.google.distance.delta') {
                    distance += point.value[0].fpVal || 0;
                }
            });
        });

        transformedData.push({
            date: bucketStartTime,
            steps: steps,
            distance: distance
        });
    });

    return transformedData;
}

module.exports = fetchGoogleFitData;
