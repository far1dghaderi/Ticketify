const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A team must have a name"],
    minLength: [2, "team name must have at least 2 characters"],
    maxLength: [40, "team name must have less than 40 characters"],
    trim: true,
    toLower: true,
  },
  sport: {
    type: String,
    enum: {
      values: ["football", "volleyball", "basketball"],
      message: "a team type must be either: football, basketball or volleyball",
    },
    required: [true, "a team must have a type"],
  },
  logo: {
    type: String,
    required: [true, "a team must have a logo"],
  },
  bgImage: {
    type: String,
    required: [true, "a team must have a background image"],
  },
});

const teamModel = mongoose.model("teams", teamSchema);
module.exports = teamModel;
