const router = require("express").Router();
const verify = require("../middleware/verifyToken");
const jwt = require("jsonwebtoken");
const Advertisement = require("../models/Advertisement");
const multer = require("multer");
const mongoose = require("mongoose");

mongoose.set("useFindAndModify", false);

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function(req, file, cb) {
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

router.post("/create", verify, upload.single("image"), async (req, res) => {
  const decoded = jwt.decode(req.header("auth-token"), { complete: true });
  const usernameFromToken = decoded.payload.username;
  //console.log(req.body);
  const ads = new Advertisement({
    price: req.body.price,
    description: req.body.description,
    adsOwner: usernameFromToken,
    image: req.file.path
  });
  ads
    .save()
    .then(result => {
      //console.log(result);
      return res.status(200).send({
        message: "success"
      });
    })
    .catch(err => {
      // console.log(err);
      return res.status(500).json({
        error: err
      });
    });
});

router.put("/update/:_id", verify, upload.single("image"), async (req, res) => {
  const filter = {
    _id: req.params._id
  };
  const nextStep = checkUser(req.header("auth-token"), filter, res);

  nextStep.then(async function(result) {
    if (result !== "next") return;
    const adsToUpdate = req.body;
    console.log(req.body);
    if (req.file) {
      adsToUpdate.image = req.file.path;
    }
    console.log(filter);
    try {
      const resultingDoc = await Advertisement.findOneAndUpdate(
        filter,
        adsToUpdate,
        { new: true }
      );
      return res.status(200).send({
        message: "success"
      });
    } catch (err) {
      return res.status(500).send({
        error: err
      });
    }
  });
});

router.delete("/delete/:_id", verify, async (req, res) => {
  const filter = {
    _id: req.params._id
  };
  const nextStep = checkUser(req.header("auth-token"), filter, res);

  nextStep.then(async function(result) {
    try {
      await Advertisement.findOneAndDelete(filter);
      return res.status(200).send({
        message: "success"
      });
    } catch (err) {
      return res.send(500).send({
        error: err
      });
    }
  });
});

function checkUser(accessToken, filter, res) {
  const decoded = jwt.decode(accessToken, { complete: true });
  const usernameFromToken = decoded.payload.username;
  return Advertisement.findOne(filter)
    .then(function(obj) {
      if (!obj) {
        return res.status(403).send({
          error: "NoPage"
        });
      }
      if (usernameFromToken !== obj.adsOwner) {
        // console.log(usernameFromToken);
        // console.log(obj);
        return res.status(401).send({
          error: "AccessDenied"
        });
      }
      return "next";
    })
    .catch(function(err) {
      return res.status(500).send({
        error: "smthWentWrong"
      });
    });
}

module.exports = router;
