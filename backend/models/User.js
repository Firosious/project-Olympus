// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    
    lastName: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true
    },

    // Add any other fields you might need
    // profilePicture: String,
    // etc.
});

module.exports = mongoose.model('User', userSchema);