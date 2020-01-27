const route = require('express').Router();
const verify = require('../middleware/verifyToken');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

route.get('/', verify, async(req, res) => {
    
    const decoded = jwt.decode(req.header('auth-token'), { complete: true });
    const user = await User.findOne({
        username: decoded.payload.username,
    });
    return res.status(200).send({
        name: user.name,
        username: user.username,
        date: user.date,
        message: 'you are here!',
    });
});

module.exports = route;