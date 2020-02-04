const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = process.env.PORT || 5000;

const ROUTES = require("./route");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(ROUTES);

mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true }, () =>
  console.log("connected to DB!")
);

app.listen(PORT, () => console.log("server up and running...."));
