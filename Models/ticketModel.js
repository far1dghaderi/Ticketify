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
  finalPrice: {
    type: Number,
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
  ticketToken: {
    type: String,
    required: [
      true,
      "each ticket must have a ticket token in order to to authorize payments",
    ],
  },
});

//this method will check available capacity for the stand
ticketSchema.methods.checkCapacity = (standCapacity, soldTicketsCount) => {
  if (standCapacity <= soldTicketsCount) return false;
  else return true;
};
//create ticket verify token
ticketSchema.methods.createTicketToken = async function () {
  const ticketToken = await crypto.randomBytes(32).toString("hex");
  //encrypting reset token
  this.ticketToken = crypto
    .createHash("sha256")
    .update(ticketToken)
    .digest("hex");
  return ticketToken;
};
const ticketModel = mongoose.model("tickets", ticketSchema);

module.exports = ticketModel;
