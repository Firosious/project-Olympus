const mongoose = require("mongoose");

const timeframeSchema = new mongoose.Schema({
  steps: { type: Number, default: 0 },
  carbonSaved: { type: Number, default: 0 }
});

const leaderboardSchema = new mongoose.Schema({
  googleId: { type: String, ref: "User", required: true },
  daily: { type: timeframeSchema, default: () => ({}) },
  weekly: { type: timeframeSchema, default: () => ({}) },
  monthly: { type: timeframeSchema, default: () => ({}) }
});

module.exports = mongoose.model("Leaderboard", leaderboardSchema);
