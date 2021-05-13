const mongoose = require("mongoose");

const stadiumSchema = new mongoose.Schema(
  {
    //This field specifies stadium type
    stadiumType: {
      type: String,
      enum: {
        values: ["football", "volleyball", "basketball"],
        message: "a Stadium must be either: football, basketball or volleyball",
      },
      required: [true, "a Stadium must have a type"],
    },
    name: {
      type: String,
      minLength: [2, "stadium name must have at least 2 characters"],
      maxLength: [80, "stadium name must have less than 80 characters"],
      trim: true,
      toLower: true,
      required: [true, "a stadium must have a name"],
    },
    //it must be at least one entrance for reaching stadium stands
    entrances: [
      {
        type: String,
        minLength: [2, "stadium entrance name must have at least 2 characters"],
        maxLength: [
          100,
          "stadium entrance name could not have more than 100 characters",
        ],
        required: [true, "a stadium must have a entrance"],
      },
    ],
    stands: [
      //This part will specify diffrent parts of stadium
      //Each stadium has at least 1 floor
      {
        //this field specifies a id for each stand
        standId: {
          type: String,
          required: [true, "each stand must has a id"],
          maxLength: [64, "stand id must have less than 64 characters"],
          trim: true,
          toUpper: true,
        },
        //this field specifies the location that stand placed in
        standLocation: {
          type: String,
          required: [true, "each stand must has a stand location"],
          enum: {
            values: ["west", "east", "north", "south"],
            message:
              "each stand must be either in west, east, south or north side of a stadium",
          },
        },
        //this field specifies the floor that stand located in
        floor: {
          type: String,
          enum: {
            values: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "VIP"],
            message:
              "each stand must be in floors of 1 - 10 or either be a VIP stand",
          },
          required: [true, "each stand must has a floor"],
        },
        //this field specifies the capacity of each stand
        capacity: {
          type: Number,
          required: [true, "each stand must has a certain capacity"],
          max: [40000, "a stand capacity could not be more than 40000 "],
          min: [1, "a stand must has at least capacity for 1 person"],
        },
        //this field specifes price of each stand
        //note: entry prices are recognzied as USD
        price: {
          type: Number,
          required: [true, "each stand must has a price"],
          min: [0, "stand price could not be lower than 0"],
          max: [1000, "stand price could not be more than 1000 USD"],
        },
        //this field specifies the entrances for each stand
        //NOTE: entered values in this field could not be diffrent with stadiums entrances
        entrances: {
          type: [String],
          required: [true, "each stand must has at least one entrance"],
        },
        //this stand specifies if the stand is available or not
        availablity: {
          type: Boolean,
          default: true,
        },
        //
      },
    ],

    //Country, province and city that the stadium placed in
    country: {
      type: String,
      minLength: [2, "country name must have more than 2 characters"],
      maxLength: [100, "country name must have less than 100 characters"],
      required: [true, "a stadium must have a country"],
    },
    province: {
      type: String,
      minLength: [2, "province name must have more than 2 characters"],
      maxLength: [100, "province name must have less than 100 characters"],
      required: [true, "a stadium must have a province"],
    },
    city: {
      type: String,
      minLength: [2, "city name must have more than 2 characters"],
      maxLength: [100, "city name must have less than 100 characters"],
      required: [true, "a stadium must have a city"],
    },
    address: {
      type: String,
      minLength: [2, "address name must have more than 2 characters"],
      maxLength: [350, "address name must have less than 100 characters"],
      required: [true, "a stadium must have a address"],
    },
  },
  { getters: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
//this method will generate stands
stadiumSchema.methods.createStand = function (stand) {
  let standObject = {
    standId: stand.split("-")[0],
    standLocation: stand.split("-")[1],
    floor: stand.split("-")[2],
    capacity: stand.split("-")[3] * 1,
    price: stand.split("-")[4] * 1,
    entrances: [],
  };
  //adding entrances to the stand object
  stand.split("-").forEach((entrance, index) => {
    if (4 < index) standObject.entrances.push(entrance);
  });
  //returning stand object
  return standObject;
};
//calculate the capacity of stadium
stadiumSchema.virtual("capacity").get(function () {
  let capacity = 0;
  this.stands.forEach((stand) => {
    capacity += stand.capacity;
  });
  return capacity;
});
//this method will check stands for same Stand id, if there was any, it will return true
stadiumSchema.methods.checkStands = function (standsArray) {
  let isConflict = false;
  let standIDs = [];
  standsArray.forEach((stand) => {
    standIDs.push(stand.split("-")[0]);
  });

  standIDs.forEach((standID, index) => {
    if (!isConflict) {
      isConflict = standIDs.includes(standID, index + 1);
    }
  });
  return isConflict;
};

//checking entrances
stadiumSchema.methods.checkEntrances = function (stadiumModel, stands) {
  let doesExist = true;
  //if the stand entrance wasnt exist in stadium entrances, then the function will return false
  stands.forEach((stand) => {
    stand.entrances.forEach((entrance) => {
      if (!stadiumModel.entrances.includes(entrance)) {
        doesExist = false;
      }
    });
  });
  return doesExist;
};
//this method will check if the stadium exist or not
stadiumSchema.methods.getStandCapacity = (stadiumModel, standID) => {
  let capacity = -1;
  //itterate stands array for checking existance of input standID
  let stand = stadiumModel.stands.find((item) => {
    return item.standId === standID;
  });
  //check if the stand was exist
  if (stand != undefined) capacity = stand.capacity;
  return capacity;
};
//-----------------------------------------------------
const stadiumModel = mongoose.model("stadiums", stadiumSchema);
module.exports = stadiumModel;
