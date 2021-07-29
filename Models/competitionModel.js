const mongoose = require("mongoose");

const competitionSchema = new mongoose.Schema({
  //this field represent the country that competition belongs to
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
});

const competitionModel = mongoose.model("competitions", competitionSchema);

module.exports = competitionModel;
