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

function calculateStrideLength(heightInCm, sex) {
    if (sex === 'male') {
        return heightInCm * 0.415;
    } else {
        return heightInCm * 0.413;
    }
}

function calculateDistance(steps, strideLengthInCm) {
    if (steps > 0 && strideLengthInCm > 0) {
        const distance = (steps * strideLengthInCm) / 100; // Convert to meters
        return parseFloat(distance.toFixed(2)); // Round to 2 decimal places
    }
    return 0;
}

async function fetchMonthlyData(accessToken, startOfMonth, endOfMonth) {
    const googleFitURL = 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate';

    const requestBody = {
        aggregateBy: [
            { dataTypeName: "com.google.step_count.delta" }
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

async function fetchGoogleFitData(accessToken, startDate, endDate, userSex, userHeightCm) {
    let transformedData = [];

    let current = new Date(startDate);
    while (current <= endDate) {
        let startOfMonth = getStartOfMonthInMillis(current);
        let endOfMonth = getEndOfMonthInMillis(current);

        try {
            const monthlyData = await fetchMonthlyData(accessToken, startOfMonth, endOfMonth);
            const strideLengthInCm = calculateStrideLength(userHeightCm, userSex);
            const monthlyTransformedData = monthlyData.bucket.map(bucket => {
                const bucketStartTime = new Date(parseInt(bucket.startTimeMillis));
                let steps = 0;

                bucket.dataset.forEach(dataset => {
                    dataset.point.forEach(point => {
                        if (point.dataTypeName === 'com.google.step_count.delta') {
                            steps += point.value[0].intVal || 0;
                        }
                    });
                });

                return {
                    date: bucketStartTime.toISOString().split('T')[0],
                    steps: steps,
                    distance: calculateDistance(steps, strideLengthInCm)
                };
            });

            transformedData.push(...monthlyTransformedData);
        } catch (error) {
            console.error(`Error fetching data for month starting ${new Date(startOfMonth).toISOString()}:`, error);
        }

        current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }

    return transformedData;
}

module.exports = fetchGoogleFitData;
