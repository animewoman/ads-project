const router = require("express").Router();
const Advertisement = require("../models/Advertisement");

router.post("/", async (req, res) => {
  let keys = req.body.keyWords;
  //console.log(keys);
  let regEx = new RegExp(keys.join("|"));

  let docs = await Advertisement.find({
    $or: [
      {
        keyWords: {
          $regex: regEx,
          $options: "gi"
        }
      },
      {
        description: {
          $regex: regEx,
          $options: "gi"
        }
      }
    ]
  });
  regEx = new RegExp(keys.join("|"), "gi");
  for (let i = 0; i < docs.length; i++) {
    docs[i].amount = 0;
    let tempKeyWords = docs[i].keyWords.match(regEx);
    tempKeyWords === null ? null : (docs[i].amount += tempKeyWords.length * 5);
    let tempDescription = docs[i].description.match(regEx);
    tempDescription === null
      ? null
      : (docs[i].amount += tempDescription.length * 2);
  }
  docs.sort(compare);
  return res.status(200).send(docs);
});

function compare(firstOne, secondOne) {
  if (firstOne.amount > secondOne.amount) return -1;
  if (firstOne.amount === secondOne.amount) {
    const dateOne = new Date(firstOne.date).getTime();
    const dateTwo = new Date(secondOne.date).getTime();
    return dateOne > dateTwo ? 1 : -1;
  }
  return 1;
}
module.exports = router;
