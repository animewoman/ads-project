const router = require("express").Router();
const Advertisement = require("../models/Advertisement");

router.get("/", async (req, res) => {
  const allAds = Advertisement.find({})
    .sort({
      date: -1
    })
    .exec(function(err, docs) {
      if (err) {
        return res.status(500).send({
          error: "smthWentWrong"
        });
      } else {
        return res.status(200).send(docs);
      }
    });
});

module.exports = router;
