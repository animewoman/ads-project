const mongoose = require("mongoose");

const advertisementSchema = new mongoose.Schema({
  price: {
    type: String
  },
  description: {
    type: String
  },
  image: {
    type: Array
  },
  date: {
    type: Date,
    default: Date.now
  },
  adsOwner: {
    type: String
  },
  keyWords: {
    type: String
  }
});

module.exports = mongoose.model("Advertisement", advertisementSchema);
