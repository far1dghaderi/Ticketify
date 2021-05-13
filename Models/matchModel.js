const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  //specifies match home and away teams
  homeTeam: {
    name: { type: String, required: [true, "Each team must have a name!"] },
    logo: { type: String, required: [true, "Each team must have a logo!"] },
    id: {
      type: mongoose.Types.ObjectId,
      ref: "teams",
      required: [true, "Each team must have a id!"],
    },
  },
  awayTeam: {
    name: { type: String, required: [true, "Each team must have a name!"] },
    logo: { type: String, required: [true, "Each team must have a logo!"] },
    id: {
      type: mongoose.Types.ObjectId,
      ref: "teams",
      required: [true, "Each team must have a id!"],
    },
  },
  stadium: {
    type: mongoose.Types.ObjectId,
    ref: "stadiums",
    required: [true, "a ticket must be associated with a stadium"],
  },
  //match date could not be lower than current date
  matchDate: {
    type: Date,
    required: [true, "a match must have date"],
    validate: {
      validator: function (value) {
        return new Date() < value;
      },
      message:
        "you cant sell tickets for a match in the past! time travel machine has not been invented yet",
    },
  },
  //this field specifies the time that users can see match info on website
  visibleDate: {
    type: Date,
    required: [true, "a match must have a visible date"],
    //visible date must be lower than start buy date
    validate: {
      validator: function (value) {
        return value < this.startBuyDate;
      },
      message: "visible date must be lower than start buy date",
    },
  },
  //buying tickets for this match will be start from this date
  startBuyDate: {
    type: Date,
    required: [true, "a match must have a start buy date"],
    //start buy date must be lower than both end buy date and match date
    validate: {
      validator: function (value) {
        return value < this.endBuyDate && value < this.matchDate;
      },
      message: "startBuyDate must be lower than both endBuyDate and matchDate",
    },
  },
  //buying tickets for this match will be possible till this date
  endBuyDate: {
    type: Date,
    required: [true, "a match must have a end buy date"],
  },
  matchType: {
    type: String,
    enum: {
      values: ["football", "volleyball", "basketball"],
      message: "a match must be either: football, basketball or volleyball",
    },
    required: [true, "a match must have a type"],
  },
  competition: {
    type: mongoose.Types.ObjectId,
    ref: "competitions",
    required: [true, "a match must have a competition"],
  },
  //price could not be lower than zero
  price: {
    type: Number,
    required: [true, "a match must have a price"],
    validate: {
      validator: function (value) {
        return value >= 0;
      },
      message: "price could not be lower than zero",
    },
  },
  //in some matches/countries, they have some limitation for diffrent ages and genders, this field will handle that
  limitation: {
    gender: {
      type: String,
      enum: {
        values: ["male", "female"],
        message:
          "a match gender limitation must be either: none, male or female",
      },
    },
    age: {
      type: Number,
      min: [4, "limited age could not be lower than  4 yo"],
      max: [100, "limited age could not be more than 100 yo"],
    },
  },
  matchCover: { type: String },
  slug: {
    type: String,
    unique: [true, "match slug must be unique"],
    required: [true, "each match must have a slug for better interface in url"],
  },
  //All tickets that have been purchased for this match will be placed in this array of tickets
  tickets: [
    {
      ticketID: {
        type: mongoose.Types.ObjectId,
      },
      stand: {
        type: String,
        required: [true, "each ticekt must have a  stand"],
      },
    },
  ],
});
matchSchema.index({ slug: 0 });
//check if stadium type is same with teams sport type
const matchModel = mongoose.model("matches", matchSchema);

module.exports = matchModel;
