const express = require("express");
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  //This is a coupon code that user can use to get discounts
  code: {
    type: String,
    unique: [true, "this coupon code has been used before!"],
    required: [true, "each coupon must have a coupon code"],
    trim: true,
  },
  //This field will specify the matches that coupon can be used on them
  matches: [
    {
      type: mongoose.Types.ObjectId,
      ref: "matches",
    },
  ],
  //This field specifes teams that this coupon can be used on theire games
  teams: [
    {
      type: mongoose.Types.ObjectId,
      ref: "teams",
    },
  ],
  //This field will specify users that can use coupon
  users: [
    {
      type: mongoose.Types.ObjectId,
      ref: "users",
    },
  ],
  //This field will specify a condition based on match prices
  price: {
    //coupon can be used on matches that theire price is lower than this field
    lowerThan: {
      type: Number,
      validate: {
        validator: function (value) {
          if (this.price.higherThan != undefined)
            return this.price.higherThan < value;
        },
        message: "lowerThan value must be higher than higherThan field",
      },
    },
    //coupon can be used on matches that theire price is equal to this field
    //* if you pass value to this field, the other two fields must be null or undefined, either it will throw an error
    equalTo: {
      type: Number,
      validate: {
        validator: function (value) {
          if (
            this.price.higherThan ||
            this.price.lowerThan ||
            this.price.higherThan == 0 ||
            this.price.lowerThan == 0
          )
            return false;
        },
        message:
          "whenever you set a value for equalTo field, lowerThan and higherThan fields must be set to null or undefined",
      },
    },
    //coupon can be used on matches that theire price is higher than this field
    higherThan: {
      type: Number,
      validate: {
        validator: function (value) {
          if (this.price.lowerThan != undefined)
            return this.price.lowerThan > value;
        },
        message: "higherThan value must be lower  than lowerThan fields value",
      },
    },
  },
  //This field will specify a condition based on match dates
  matchDate: {
    //coupon can be used on matches with the exact same date
    //* if you pass value to this field, the other two fields will be set to undefined
    exactDate: {
      type: Date,
      validate: {
        validator: function (value) {
          if (this.matchDate.startDate || this.matchDate.endDate) return false;
        },
        message:
          "whenever you set a value for exactDate field, endDate and startDate fields must be set to null or undefined",
      },
    },
    //coupon can be used on matches with the exact same date and more on
    startDate: {
      type: Date,
      validate: {
        validator: function (value) {
          if (this.matchDate.endDate != undefined)
            return this.matchDate.endDate > value;
        },
        message: "startDate value must be lower than endDate value",
      },
    },
    //coupon can be used on matches with the exact same date and lower
    endDate: {
      type: Date,
      validate: {
        validator: function (value) {
          if (this.matchDate.startDate != undefined)
            return value > this.matchDate.startDate;
        },
        message: "endDate value must be greater than startDate value",
      },
    },
  },
  discountPercentage: {
    type: Number,
    required: [true, "each coupon must have a discount percentage value"],
    min: [1, "coupon percentage value must be more than 0"],
    max: [100, "coupon percentage value could not be higher than 100"],
  },
  //This field specify the max amount of discount that this coupon can apply
  maxDiscount: {
    type: Number,
    validate: {
      validator: function (value) {
        if (value <= 0) return false;
      },
      message: "maximum discount value must be greater than 0",
    },
  },
  //this field specify times that this coupon can use by one user
  usageTime: {
    type: Number,
    validate: {
      validator: function (value) {
        if (value < 0) return false;
      },
      message: "ticket usage time must be 0 or a number bigger than that",
    },
    required: [true, "each coupon must have a maxmimum usage time"],
  },
  //this field specify expiry date of the coupon
  usableAt: {
    type: Date,
    required: [true, "each coupon must have a visibility date"],
    validate: {
      //check if the date is about the futue
      validator: function (value) {
        if (value < Date.now()) return false;
      },
      message: "usableAt date must be in the future!",
    },
  },
  expiresAt: {
    type: Date,
    required: [true, "each coupon must have a expiry date"],
    //checking if the expiry date is greater than usable at date
    validate: {
      validator: function (value) {
        if (value < this.usableAt) return false;
      },
      message: "expiresAt date must be greater than usableAt date",
    },
  },
});
//check if the match date is in the range of coupon usable dates
couponSchema.methods.checkDates = (couponDocument, matchDocument) => {
  let isValid = true;
  if (couponDocument.matchDate || couponDocument.matchDate != undefined) {
    //check if the coupon has exact date value and compare it with match date
    if (couponDocument.matchDate.exactDate != undefined) {
      isValid = couponDocument.exactDate == matchDocument.matchDate;
    }
    //check if the coupon has start date value and compare it with match date
    if (couponDocument.matchDate.startDate != undefined) {
      isValid = couponDocument.usableAt <= matchDocument.matchDate;
    }
    //check if the coupon has start date value and compare it with match date
    if (couponDocument.matchDate.endDate != undefined && isValid) {
      isValid = matchDocument.matchDate <= couponDocument.expiresAt;
    }
  }

  return isValid;
};

//check if coupon is usable on a specific team
couponSchema.methods.checkTeams = (couponDocument, teamID) => {
  let isValid = true;
  for (i = 0; i < couponDocument.length; i++) {
    if (couponDocument.teams[i] === teamID) {
      isValid = true;
      break;
    } else isValid = false;
  }
  return isValid;
};
//check if coupon is usable for a specific user or not
couponSchema.methods.checkUsers = (couponDocument, userID) => {
  let isValid = true;
  for (i = 0; i < couponDocument.length; i++) {
    if (couponDocument.users[i] === matchID) {
      isValid = true;
      break;
    } else isValid = false;
  }
  return isValid;
};
//check if coupon is usable on a specific team
couponSchema.methods.checkMatches = (couponDocument, matchID) => {
  let isValid = true;
  for (i = 0; i < couponDocument.length; i++) {
    if (couponDocument.matches[i] === matchID) {
      isValid = true;
      break;
    } else isValid = false;
  }
  return isValid;
};
//check if coupon is created for certain match prices
couponSchema.methods.checkPrices = (couponDocument, matchPrice) => {
  let isValid = true;
  if (couponDocument.price.equalTo)
    isValid = couponDocument.price.equalTo == matchPrice;
  if (couponDocument.price.lowerThan && isValid)
    isValid = couponDocument.price.lowerThan > matchPrice;
  if (couponDocument.price.higherThan && isValid)
    isValid = couponDocument.price.higherThan < matchPrice;

  return isValid;
};
const couponModel = mongoose.model("coupons", couponSchema);

module.exports = couponModel;
