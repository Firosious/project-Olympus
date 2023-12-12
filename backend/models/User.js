// User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    sex: { type: String, required: true, default: 'male' }, // 'male' or 'female'
    heightInCm: { type: Number, required: true, default: 170.18 }, // Height in centimeters
    email: { type: String, required: true }
}, { versionKey: false });

module.exports = mongoose.model('User', userSchema);
