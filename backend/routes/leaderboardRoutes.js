const express = require("express");
const router = express.Router();
const Leaderboard = require("../models/LeaderboardModel");
const User = require("../models/User");
const FitnessActivity = require("../models/FitnessActivity");
const {
  calculateCarbonEmissions,
} = require("../../src/utils/carbonCalculator.js");
const { calculateDistance } = require("../../src/utils/distanceCalculator.js");

async function updateLeaderboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  const todayString = today.toISOString().split("T")[0];

  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const users = await User.find({});

  for (const user of users) {
    const activities = await FitnessActivity.findOne({
      userId: user.googleId,
      year: today.getFullYear(),
    });
    if (activities) {
      let dailyTotal = getDailyTotal(activities, todayString);
      let weeklyTotal = getAggregatedTotal(activities, startOfWeek, today);
      let monthlyTotal = getAggregatedTotal(activities, startOfMonth, today);

      const dailyCarbonSaved = await calculateCarbonSaved(
        dailyTotal,
        user.googleId
      );
      const weeklyCarbonSaved = await calculateCarbonSaved(
        weeklyTotal,
        user.googleId
      );
      const monthlyCarbonSaved = await calculateCarbonSaved(
        monthlyTotal,
        user.googleId
      );

      await Leaderboard.findOneAndUpdate(
        { googleId: user.googleId },
        {
          "daily.steps": dailyTotal,
          "daily.carbonSaved": dailyCarbonSaved,
          "weekly.steps": weeklyTotal,
          "weekly.carbonSaved": weeklyCarbonSaved,
          "monthly.steps": monthlyTotal,
          "monthly.carbonSaved": monthlyCarbonSaved,
        },
        { upsert: true }
      );
    }
  }
}

function getWeekStartDate(date) {
  const startDate = new Date(date);
  startDate.setDate(
    startDate.getDate() -
      startDate.getDay() +
      (startDate.getDay() === 0 ? -6 : 1)
  );
  startDate.setHours(0, 0, 0, 0);
  return startDate;
}

function getDailyTotal(activities, dateString) {
  const dailyData = activities.monthlyData
    .get(String(new Date(dateString).getMonth() + 1))
    ?.find((d) => d.date === dateString);
  return dailyData?.steps || 0;
}

function getAggregatedTotal(activities, startDate, endDate) {
  let totalSteps = 0;
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const dayData = activities.monthlyData
      .get(String(d.getMonth() + 1))
      ?.find((data) => data.date === dateStr);
    totalSteps += dayData?.steps || 0;
  }
  return totalSteps;
}

async function calculateCarbonSaved(steps, userId) {
  // Fetch user details for height and sex
  const user = await User.findOne({ googleId: userId });
  if (!user) {
    throw new Error(`User not found for ID: ${userId}`);
  }

  const distanceInMeters = calculateDistance(steps, user.heightInCm, user.sex);
  const distanceInKm = distanceInMeters / 1000;

  const emissions = calculateCarbonEmissions(distanceInKm);
  return Math.max(emissions.car - emissions.walking, 0);
}

router.post("/update", async (req, res) => {
  try {
    await updateLeaderboardStats();
    res.status(200).json({ message: "Leaderboard updated successfully" });
  } catch (err) {
    console.error("Error updating leaderboard:", err);
    res.status(500).send("Server error");
  }
});

router.get("/", async (req, res) => {
  const { timeframe, type } = req.query;
  const sortField = type === "carbonSaved" ? "carbonSaved" : "steps";

  try {
    let leaderboardData = await Leaderboard.find({})
      .sort({ [`${timeframe}.${type}`]: -1 })
      .limit(10)
      .lean(); // Use lean() for faster read-only results

    // Manually populate user data
    leaderboardData = await Promise.all(
      leaderboardData.map(async (entry) => {
        const user = await User.findOne({ googleId: entry.googleId }).select(
          "firstName lastName"
        );
        return {
          ...entry,
          user: user
            ? { firstName: user.firstName, lastName: user.lastName }
            : null,
        };
      })
    );

    res.json(leaderboardData);
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).send("Server error");
  }
});

// New route for fetching daily data
router.get("/daily/:userId", async (req, res) => {
  const { userId } = req.params;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateString = today.toISOString().split("T")[0];

  try {
    const activity = await FitnessActivity.findOne({
      userId,
      year: today.getFullYear(),
    });
    if (!activity) {
      return res.status(404).json({ message: "No data found" });
    }

    const dailyData = getDailyTotal(activity, dateString);
    res.json({ date: dateString, steps: dailyData });
  } catch (err) {
    console.error("Error fetching daily data:", err);
    res.status(500).json({ error: err.message });
  }
});

// New route for fetching monthly data
router.get("/monthly/:userId", async (req, res) => {
  const { userId } = req.params;
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  try {
    const activity = await FitnessActivity.findOne({
      userId,
      year: today.getFullYear(),
    });
    if (!activity) {
      return res.status(404).json({ message: "No data found" });
    }

    const monthlyTotal = getAggregatedTotal(activity, startOfMonth, today);
    res.json({
      month: startOfMonth.getMonth() + 1,
      year: startOfMonth.getFullYear(),
      steps: monthlyTotal,
    });
  } catch (err) {
    console.error("Error fetching monthly data:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
