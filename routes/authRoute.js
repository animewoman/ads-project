const router = require('express').Router();
const {registerValidation, loginValidation} = require('../validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TokenDB = require('../models/refreshTokens');

router.post('/register', async(req, res) => {
    
    const {error} = registerValidation(req.body);

    if(error){
        return res.status(400).send(error.details[0].message);
    }

    const usernameExists = await User.findOne({
        username: req.body.username,
    });

    if(usernameExists){
        return res.status(406).send({
            message: 'userExists',
        });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt); 
    const user = new User({
        name: req.body.name,
        username: req.body.username,
        password: hashedPassword,
    });
    try {
        await user.save();
        return res.status(200).send({
            message: 'success',
        });
    }catch(err){
        res.status(400).send(err);
    }
});

router.post('/login', async(req, res) => {
    const {error} = loginValidation(req.body);
    if(error){
        return res.status(400).send(error.details[0].message);
    }
    const user = await User.findOne({
        username: req.body.username,
    });

    if(!user) {
        return res.status(400).send({ error: 'invalidUsername'});
    }
    const validPassword = await bcrypt.compare(req.body.password, user.password);

    if(!validPassword){
        return res.status(400).send({ error: 'invalidPassword'});
    }

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const token_to_db = new TokenDB({
        token_save: refreshToken, 
    });
    await token_to_db.save();
    res.header('auth-token', token);
    res.header('ref-token', refreshToken)
    try{
        return res.status(200).send({ message: 'success'});
    }catch(err){
        return res.status(400).send(err);
    }
});


router.post('/refresh-token', async(req, res) => {
    const token = req.header('ref-token');
    const token_in_db = TokenDB.findOne({
        token_save: token,
    });
    if(!token || !token_in_db){
        return res.status(401).send({
            error: 'refTokenNotValid',
        });
    }
    jwt.verify(token, process.env.REFRESH_TOKEN, function(err, decoded){
        if(err){
            if(err.name === 'TokenExpiredError'){
                const token_in_db = TokenDB.deleteOne({
                    token_save: token,
                });
                return res.status(401).send({
                    error: 'refTokenExp',
                });
            } else if(err.name === 'JsonWebTokenError'){
                return res.status(401).send({
                    error: 'refTokenNotValid',
                });
            }
        }else {
            res.user = decoded;
            res.header('auth-token', generateAccessToken(res.user));
            const token_to_save = generateRefreshToken(res.user);
            TokenDB.deleteOne({
                token_save: req.header('ref-token'),
            });
            const token_to_db = new TokenDB({
                token_save: token_to_save,
            });
            token_to_db.save();
            res.header('ref-token', token_to_save);

            return res.status(200).send({
                message: 'success'
            });
        }
    });
});

function generateAccessToken(user) {
    return jwt.sign({username: user.username}, process.env.SECRET_TOKEN, {expiresIn: process.env.access_expires});
}

function generateRefreshToken(user){
    return jwt.sign({username: user.username}, process.env.REFRESH_TOKEN, {expiresIn: process.env.refresh_expires});
}

router.post('/logout', async(req, res) => {
    let token = req.header('auth-token');
    token = '';
    res.header('auth-token', token);
    token = res.header('ref-token');
    TokenDB.deleteOne({
        token_save: token,
    });
    return res.status(200).send({ message: 'success'});
});


module.exports = router;