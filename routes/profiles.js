const route = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const verify = require("../middleware/verifyToken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

mongoose.set("useFindAndModify", false);

route.get("/:username", async (req, res) => {
  const user = await User.findOne({
    username: req.params.username
  });
  if (!user)
    return res.status(401).send({
      error: "userNotExists"
    });
  if (req.header("auth-token") === null) {
    return res.status(200).send({
      name: user.name,
      username: user.username,
      date: user.date,
      sameUser: false
    });
  }
  const decoded = jwt.decode(req.header("auth-token"), { complete: true });
  const usernameFromToken = decoded.payload.username;
  const checker = checkToken(req.header("auth-token"));
  if (user.username === usernameFromToken) {
    if (checker === "response") {
      return res.status(200).send({
        name: user.name,
        username: user.username,
        date: user.date,
        sameUser: true
      });
    } else {
      return res.status(401).send({
        error: checker
      });
    }
  } else {
    return res.status(200).send({
      name: user.name,
      username: user.username,
      date: user.date,
      sameUser: false
    });
  }
});

route.put("/:username", verify, async (req, res) => {
  try {
    const filter = { username: req.params.username };
    const user = req.body;
    if (user.oldPassword) {
      const tempUser = await User.findOne(filter);
      const validPassword = await bcrypt.compare(
        user.oldPassword,
        tempUser.password
      );
      if (!validPassword) {
        return res.status(401).send({
          error: "wrongPassword"
        });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.newPassword, salt);
      delete user.oldPassword;
      delete user.newPassword;
      user.password = hashedPassword;
    }
    await User.findOneAndUpdate(filter, user, { new: true });
    return res.status(200).send({
      message: "success"
    });
  } catch (err) {
    return res.status(500).send({
      error: "smthWentWrong"
    });
  }
});

function checkToken(token) {
  return jwt.verify(token, process.env.SECRET_TOKEN, function(err, decoded) {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return "tokenExp";
      } else {
        return "tokenNotValid";
      }
    } else {
      return "response";
    }
  });
}

module.exports = route;
