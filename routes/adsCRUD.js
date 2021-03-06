const router = require("express").Router();
const verify = require("../middleware/verifyToken");
const jwt = require("jsonwebtoken");
const Advertisement = require("../models/Advertisement");
const multer = require("multer");
const mongoose = require("mongoose");

mongoose.set("useFindAndModify", false);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    !file.mimetype.includes("jpeg") &&
    !file.mimetype.includes("jpg") &&
    !file.mimetype.includes("png") &&
    !file.mimetype.includes("gif")
  ) {
    return cb(null, false);
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

router.post("/create", verify, upload.array("image", 20), async (req, res) => {
  const decoded = jwt.decode(req.header("auth-token"), { complete: true });
  const usernameFromToken = decoded.payload.username;
  const ads = new Advertisement({
    price: req.body.price,
    description: req.body.description,
    adsOwner: usernameFromToken,
    keyWords: req.body.keyWords
  });
  ads.image = [];
  for (let i = 0; i < req.files.length; i++) {
    ads.image.push(req.files[i].path);
  }
  ads
    .save()
    .then(result => {
      return res.status(200).send({
        message: "success"
      });
    })
    .catch(err => {
      return res.status(500).json({
        error: "smthWentWrong"
      });
    });
});

router.put("/update/:_id", verify, upload.array("image", 20), async (req, res) => {
  const filter = {
    _id: req.params._id
  };
  const nextStep = checkUser(req.header("auth-token"), filter, res);

  nextStep.then(async function (result) {
    if (result !== "next") return;
    const adsToUpdate = req.body;
    adsToUpdate.image = [];
    if (req.files) {
      for (let i = 0; i < req.files.length; i++) {
        adsToUpdate.image.push(req.files.path);
      }
    }
    if (adsToUpdate.keyWords) delete adsToUpdate.keyWords;
    try {
      await Advertisement.findOneAndUpdate(filter, adsToUpdate, {
        new: true
      });
      return res.status(200).send({
        message: "success"
      });
    } catch (err) {
      return res.status(500).send({
        error: "smthWentWrong"
      });
    }
  });
}
);

router.delete("/delete/:_id", verify, async (req, res) => {
  const filter = {
    _id: req.params._id
  };
  const nextStep = checkUser(req.header("auth-token"), filter, res);

  nextStep.then(async function (result) {
    if (result !== "next") return;
    try {
      await Advertisement.findOneAndDelete(filter);
      return res.status(200).send({
        message: "success"
      });
    } catch (err) {
      return res.status(500).send({
        error: "smthWentWrong"
      });
    }
  });
});

function checkUser(accessToken, filter, res) {
  const decoded = jwt.decode(accessToken, { complete: true });
  const usernameFromToken = decoded.payload.username;
  return Advertisement.findOne(filter)
    .then(function (obj) {
      if (usernameFromToken !== obj.adsOwner) {
        return res.status(403).send({
          error: "forbidden"
        });
      }
      return "next";
    })
    .catch(function (err) {
      return res.status(404).send({
        error: "notFound"
      });
    });
}

module.exports = router;
