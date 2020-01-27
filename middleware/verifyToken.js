const jwt = require('jsonwebtoken');


module.exports = function (req, res, next) {
    const token = req.header('auth-token');
    jwt.verify(token, process.env.SECRET_TOKEN, function(err, decoded){
       if(err){
            if(err.name === 'TokenExpiredError'){
                return res.status(401).send({
                    error: 'tokenExp',
                });
            } else {
                return res.status(401).send({
                    error: 'tokenNotValid',
                })
            }
       } else {
            res.user = decoded;
            next();
        }
    });
}
