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
  fixture: {
    type: String,
    required: [true, "each match must have a fixture"],
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
        return new Date(value) < new Date(this.startBuyDate);
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
        return (
          new Date(value) < new Date(this.endBuyDate) &&
          new Date(value) < new Date(this.matchDate)
        );
      },
      message: "startBuyDate must be lower than both endBuyDate and matchDate",
    },
  },
  //buying tickets for this match will be possible till this date
  endBuyDate: {
    type: Date,
    required: [true, "a match must have a end buy date"],
  },
  competition: {
    type: mongoose.Types.ObjectId,
    ref: "competitions",
    required: [true, "a match must have a competition"],
  },
  cover: { type: String },
  slug: {
    type: String,
    unique: [true, "match slug must be unique"],
    required: [true, "each match must have a slug for better interface in url"],
  },
  isDisabled: {
    type: Boolean,
    default: false,
  }, //This field specifies stadium type
  sport: {
    type: String,
    enum: {
      values: ["football", "volleyball", "basketball"],
      message:
        "a match sport  must be either: football, basketball or volleyball",
    },
    required: [true, "a match  must have a sport"],
  },
  //All tickets that have been purchased for this match will be placed in this array of tickets
  tickets: [
    {
      ticketID: {
        type: mongoose.Types.ObjectId,
      },
      stand: {
        type: String,
      },
      userID: {
        type: String,
      },
      userPassportNO: {
        type: String,
      },
      userMail: { type: String },
    },
  ],
});
matchSchema.index({ slug: 0 });
//check if stadium type is same with teams sport type
const matchModel = mongoose.model("matches", matchSchema);

module.exports = matchModel;
