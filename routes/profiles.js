const route = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

route.get('/:username', async(req, res) => {
    const user = await User.findOne({
        username: req.params.username,
    });
    if(!user) return res.status(400).send({
        error: 'invalidUsername'
    });
    return checkToken(req.header('auth-token'), res);

});

function checkToken(token, res){
    jwt.verify(token, process.env.SECRET_TOKEN, function(err, decoded){
        if(err){
            if(err.name === 'TokenExpiredError'){
                return res.redirect('/myprofile');
            } else{
                return res.status(200).send({
                    name: user.name,
                    username: user.username,
                    date: user.date,
                });
            }
        } else{
            return res.redirect('/myprofile');
        }
    });
}

module.exports = route