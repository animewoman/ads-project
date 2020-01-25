const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;

const authRoute = require('./routes/authRoute');
const mainMenu = require('./routes/mainMenu');
dotenv.config();

const app = express();
app.use(express.json());

app.use('/auth', authRoute);
app.use('', mainMenu);

mongoose.connect(
    process.env.DB_CONNECT,
    {useNewUrlParser: true},
    () => console.log('connected to DB!'),
);

app.listen(PORT, () => console.log('server up and running....'));

