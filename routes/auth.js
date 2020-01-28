const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TokenDB = require('../models/refreshTokens');

router.post('/register', async(req, res) => {

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
        lastName: req.body.lastName,
        username: req.body.username,
        password: hashedPassword,
    });
    try {
        await user.save();
        return res.status(200).send({
            message: 'success',
        });
    }catch(err){
        res.status(500).send({
            error: 'smthWentWrong',
        });
    }
});

router.post('/login', async(req, res) => {

    const user = await User.findOne({
        username: req.body.username,
    });

    if(!user) {
        return res.status(401).send({
             error: 'usernameOrPasswordIsWrong'
        });
    }
    const validPassword = await bcrypt.compare(req.body.password, user.password);

    if(!validPassword){
        return res.status(401).send({
            error: 'usernameOrPasswordIsWrong'
       });
    }

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const tokenToSaveInDB = new TokenDB({
        token_save: refreshToken, 
    });
    res.header('auth-token', token);
    res.header('ref-token', refreshToken)
    try{
        await tokenToSaveInDB.save();
        return res.status(200).send({ message: 'success'});
    }catch(err){
        return res.status(500).send({
            error: 'smthWentWrong',
        });
    }
});


router.post('/refresh-token', async(req, res) => {
    const token = req.header('ref-token');
    const tokenFromDB = TokenDB.findOne({
        token_save: token,
    });
    if(!token || !tokenFromDB){
        return res.status(401).send({
            error: 'refTokenNotValid',
        });
    }
    jwt.verify(token, process.env.REFRESH_TOKEN, function(err, decoded){
        if(err){
            if(err.name === 'TokenExpiredError'){
                TokenDB.deleteOne({
                    token_save: token,
                });
                return res.status(401).send({
                    error: 'refTokenExp',
                });
            } else {
                return res.status(401).send({
                    error: 'refTokenNotValid',
                });
            }
        }else {
            res.user = decoded;
            res.header('auth-token', generateAccessToken(res.user));
            const newRefreshToken = generateRefreshToken(res.user);
            TokenDB.deleteOne({
                token_save: req.header('ref-token'),
            });
            const refreshTokenToDB = new TokenDB({
                token_save: newRefreshToken,
            });
            res.header('ref-token', newRefreshToken);
            
            try{
                refreshTokenToDB.save();
                return res.status(200).send({
                    message: 'success'
                });
            } catch(err) {
                return res.status(500).send({
                    error: 'smthWentWrong',
                });
            }
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
    token = res.header('ref-token');
    try{
        await TokenDB.deleteOne({
            token_save: token,
        });
        return res.status(200).send({ message: 'success'});
    } catch(err){
        return res.status(500).send({
            error: 'smthWentWrong',
        });
    }
});


module.exports = router;