const router = require('express').Router();
const verify = require('../middleware/verifyToken');

router.get('/', verify, async (req, res) => {
    res.status(200).send({
        message: 'OK'
    })
});


module.exports = router;