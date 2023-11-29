// GoogleFitService.js

const fetchStepData = async (accessToken) => {
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  const body = JSON.stringify({
    aggregateBy: [{ dataTypeName: "com.google.step_count.delta" }],
    bucketByTime: { durationMillis: 86400000 },
    startTimeMillis: startOfDay.getTime(),
    endTimeMillis: endOfDay.getTime()
  });

  try {
    const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: body
    });

    const data = await response.json();
    const steps = data.bucket[0]?.dataset[0]?.point[0]?.value[0]?.intVal || 0;
    return steps;
  } catch (error) {
    console.error('Error fetching step data:', error);
    return 0; // or handle the error as you see fit
  }
};

export { fetchStepData };