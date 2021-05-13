const mongoose = require("mongoose");

const competitionSchema = new mongoose.Schema({
  //this field represent the country that competition belongs to
  country: {
    type: String,
    required: [true, "each competition must have a country name"],
    minLength: [2, "competition country name must have at least 2 characters"],
    maxLength: [
      100,
      "competition country name could not have more than 100 characters",
    ], //this array contains competition details
  },
  name: {
    type: String,
    required: [true, "each competition must have  name"],
    minLength: [2, "competition  name must have at least 2 characters"],
    maxLength: [
      100,
      "competition  name could not have more than 100 characters",
    ],
  },
  logo: {
    type: String,
    required: [true, "each competition must have a logo"],
    maxLength: [
      300,
      "competition  logo string could not have more than 300 characters",
    ],
  },
  sport: {
    type: String,
    enum: {
      values: ["football", "volleyball", "basketball"],
      message:
        "a comptetition sport type must be either: football, basketball or volleyball",
    },
    required: [true, "a competition must have a sport type"],
  },
});

const competitionModel = mongoose.model("competitions", competitionSchema);

module.exports = competitionModel;
