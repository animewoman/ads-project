const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 5000;

const ROUTES = require("./route");
dotenv.config();

const app = express();

app.use("/uploads", express.static("uploads"));

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(ROUTES);

mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true }, () =>
  console.log("connected to DB!")
);

app.listen(PORT, () => console.log("server up and running...."));
