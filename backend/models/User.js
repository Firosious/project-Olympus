// User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    sex: { type: String, required: true, default: 'male' },
    heightInCm: { type: Number, required: true, default: 170.18 },
    email: { type: String, required: true },
    accountCreated: { type: Date, default: Date.now }, // New field for account creation date
    lastLogin: { type: Date }, // New field for last login date
    lastAllDataSync: { type: Date }, // New field for last "all data" sync
    last7DaySync: { type: Date } // New field for last "7 day" sync
}, { versionKey: false });

module.exports = mongoose.model('User', userSchema);
