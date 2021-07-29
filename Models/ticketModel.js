const mongoose = require("mongoose");
const crypto = require("crypto");
const stadiumModel = require("./stadiumModel");

const ticketSchema = new mongoose.Schema({
  match: {
    type: mongoose.Types.ObjectId,
    ref: "matches",
    required: [true, "a ticket must be associated with a match"],
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "users",
    required: [true, "a ticket must be associated with a user"],
  },
  stand: {
    type: String,
    required: [true, "a ticket must be associated with a stand"],
  },
  purchaseDate: {
    type: Date,
    required: [true, "a ticket must have a purchase date"],
  },
  price: {
    required: [true, "a ticket must have a price"],
    type: Number,
  },
});

//this method will check available capacity for the stand
ticketSchema.methods.checkCapacity = (standCapacity, soldTicketsCount) => {
  if (standCapacity <= soldTicketsCount) return false;
  else return true;
};

const ticketModel = mongoose.model("tickets", ticketSchema);

module.exports = ticketModel;
