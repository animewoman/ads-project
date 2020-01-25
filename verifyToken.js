const jwt = require('jsonwebtoken');


module.exports = function (req, res, next) {
    const token = req.header('auth-token');
    jwt.verify(token, process.env.SECRET_TOKEN, function(err, decoded){
       if(err){
            if(err.name === 'TokenExpiredError'){
                return res.status(401).send({
                    message: 'Token expaired',
                });
            } else if(err.name === 'JsonWebTokenError'){
                return res.status(401).send({
                    message: 'Invalid Token',
                })
            }
       } else {
            res.user = decoded;
            next();
        }
    });

    // jwt.verify(token, process.env.SECRET_TOKEN, function(err, decoded){
    //     if(err){
    //         const ref_token = req.header('ref-token');
    //         return jwt.verify(ref_token, process.env.REFRESH_TOKEN, function(err, decoded){
    //             if(err){
    //                 return res.status(401).send('Token Expired');
    //             }
    //             req.user = decoded;
    //             req.header('auth-token', generateAccessToken(req.user));
    //             req.header('ref-token', generateRefreshToken(req.user));
    //             next();
    //         });
    //     }

    //     req.user = decoded;
    //     next();
    // });
}
