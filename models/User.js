const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6,
    },
    lastName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        max: 255,
        min: 6,
    },
    password: {
        type: String,
        required: true,
        max: 1000,
        min: 6.
    },
    date: {
        type: Date, 
        default: Date.now,
    }
});

module.exports = mongoose.model('User', userSchema);