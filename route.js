const express = require('express');

const authRoute = require('./routes/auth');
const mainMenu = require('./routes/mainMenu');
const profiles = require('./routes/profiles');

const app = express();

app.use('', mainMenu);
app.use('/auth', authRoute);
app.use('/profile', profiles);

module.exports = app;