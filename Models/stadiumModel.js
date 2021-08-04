const mongoose = require("mongoose");

const stadiumSchema = new mongoose.Schema(
  {
    sport: {
      type: String,
      enum: {
        values: ["football", "volleyball", "basketball"],
        message: "a Stadium must be either: football, basketball or volleyball",
      },
      required: [true, "a Stadium must have a type"],
    },
    image: {
      type: String,
      required: [true, "Each stadium must have an image"],
    },
    name: {
      type: String,
      minLength: [2, "stadium name must have at least 2 characters"],
      maxLength: [80, "stadium name must have less than 80 characters"],
      trim: true,
      toLower: true,
      required: [true, "a stadium must have a name"],
    },
    stands: [
      //This part will specify floors and stands of the stadium
      //Each stadium has at least 1 floor
      {
        id: {
          type: String,
          required: [true, "each stand must has a id"],
          maxLength: [64, "stand id must have less than 64 characters"],
          trim: true,
          toUpper: true,
        },
        location: {
          type: String,
          required: [true, "each stand must has a stand location"],
          enum: {
            values: ["west", "east", "north", "south"],
            message:
              "each stand must be either in west, east, south or north side of a stadium",
          },
        },
        floor: {
          type: String,
          enum: {
            values: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "VIP"],
            message:
              "each stand must be in floors of 1 - 10 or either be a VIP stand",
          },
          required: [true, "each stand must has a floor"],
        },
        capacity: {
          type: Number,
          required: [true, "each stand must has a certain capacity"],
          max: [40000, "a stand capacity could not be more than 40000 "],
          min: [1, "a stand must has at least capacity for 1 person"],
        },
        //note: entry prices are recognzied as USD
        price: {
          type: Number,
          required: [true, "each stand must has a price"],
          min: [0, "stand price could not be lower than 0"],
          max: [1000, "stand price could not be more than 1000 USD"],
        },
        availablity: {
          type: Boolean,
          default: true,
        },
      },
    ],

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
stadiumSchema.methods.createStands = function (requestBody) {
  let standKeys = Object.keys(requestBody).filter((key) => {
    return key.split("_")[0] == "stand";
  });
  //get stand numbers
  let standNumbers = [];
  standKeys.forEach((stand, index) => {
    if (index == 0) {
      standNumbers.push(stand.split("_")[1]);
    } else {
      if (!standNumbers.includes(stand.split("_")[1]))
        standNumbers.push(stand.split("_")[1]);
    }
  });

  //create an empty object of stands
  let standObj = {
    id: "",
    location: "",
    floor: "",
    capacity: "",
    price: "",
    availablity: "",
  };

  let stands = [];
  //join values together for each stand
  standNumbers.forEach((standNum) => {
    standKeys.forEach((key) => {
      if (key.split("_")[1] == standNum) {
        let currentProperty = key.split("_")[2];
        if (currentProperty == "id") {
          standObj.id = requestBody[key];
        } else if (currentProperty == "location") {
          standObj.location = requestBody[key];
        } else if (currentProperty == "floor") {
          standObj.floor = requestBody[key];
        } else if (currentProperty == "capacity") {
          standObj.capacity = requestBody[key];
        } else if (currentProperty == "price") {
          standObj.price = requestBody[key].replace(/[^0-9]/g, "");
        } else if (currentProperty == "availablity") {
          standObj.availablity = requestBody[key];
        }
      }
    });

    stands.push({ ...standObj });
  });

  return stands;
};
//calculate the capacity of stadium
stadiumSchema.virtual("capacity").get(function () {
  let capacity = 0;
  this.stands.forEach((stand) => {
    capacity += stand.capacity;
  });
  return capacity;
});

stadiumSchema.methods.checkStand = (stands, standID) => {
  return stands.find((stand) => {
    return stand.id == standID;
  });
};
//this method will check if the stand exist or not
//TOFIX
stadiumSchema.methods.getStandCapacity = (stands, standID) => {
  let stand = stands.find((stand) => {
    if (stand.availablity) {
      return stand.id === standID;
    }
  });
  return stand.capacity;
};
//-----------------------------------------------------
const stadiumModel = mongoose.model("stadiums", stadiumSchema);
module.exports = stadiumModel;
