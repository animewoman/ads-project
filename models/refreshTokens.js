const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    token_save: {
        type: String,
    }
});

module.exports = mongoose.model('Token', tokenSchema);