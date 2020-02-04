const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = process.env.PORT || 5000;

const ROUTES = require("./route");
dotenv.config();

const app = express();
app.use(express.json());
app.use(ROUTES);
app.use(cors());
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true }, () =>
  console.log("connected to DB!")
);

app.listen(PORT, () => console.log("server up and running...."));
