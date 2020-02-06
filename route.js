const express = require("express");

const authRoute = require("./routes/auth");
const mainMenu = require("./routes/adsSee");
const profiles = require("./routes/profiles");
const adsCRUD = require("./routes/adsCRUD");

const app = express();

app.use("", mainMenu);
app.use("/auth", authRoute);
app.use("/profile", profiles);
app.use("/ads", adsCRUD);

module.exports = app;
