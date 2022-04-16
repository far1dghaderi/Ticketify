const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { catchAsync, AppError } = require("./../utilities/errorHandler");
const { reset } = require("chalk");
const chalk = require("chalk");
const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "you must specify firstname in order to create account"],
    minLength: [2, "firstname must have at least 2 characters"],
    maxLength: [40, "firstname must have less than 40 characters"],
    trim: true,
    toLower: true,
  },
  lastname: {
    type: String,
    required: [true, "you must specify lastname in order to create account"],
    minLength: [2, "lastname must have at least 2 characters"],
    maxLength: [40, "lastname must have less than 40 characters"],
    trim: true,
    toLower: true,
  },
  role: {
    type: String,
    enum: {
      values: ["user", "admin", "stadiumAdmin", "matchAdmin"],
      message:
        "a user must be either an user, admin, stadiumAdmin or matchAdmin",
    },
    default: "user",
  },
  //for signing up in website users must enter theire email address, phone number is optional and they can add it later on
  email: {
    type: String,
    required: [true, "you need an email in order to create your account"],
    minLength: [7, "email must have at least 7 characters"],
    maxLength: [330, "email must have less than 330 characters"],
    unique: [true, "this email has been already used"],
    trim: true,
    toLower: true,
  },
  verifiedEmail: {
    type: Boolean,
    default: false,
  },
  // phoneNumber: {
  //   type: String,
  //   minLength: [10, "phone number must have 10 digits"],
  //   maxLength: [10, "phone number must have 10 digits"],
  //   unique: [true, "this phone number has been already used"],
  //   sparse: true,
  //   trim: true,
  // },

  password: {
    type: String,
    minLength: [8, "your password must have at least 8 characters"],
    maxLength: [128, "you password could not have more than 128 characters"],
    required: [true, "your account must have a password"],
    select: false,
    trim: true,
  },
  confirmPassword: {
    type: String,
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "Passwords are not the same",
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  //id card For iranians
  idNumber: {
    type: String,
    minLength: [10, "id number number must have 10 digits"],
    maxLength: [10, "id number must have 10 digits"],
    unique: [true, "this ID number has been already used"],
    sparse: true,
  },
  //when users dosen`t have a id number, they can enter a passport number
  passportNumber: {
    type: String,
    minLength: [10, "Passport Number could not be lower than 7 digits"],
    maxLength: [10, "Passport Number  must have less than 12 digits"],
    unique: [true, "this passport number has been already used"],
    sparse: true,
  },
  gender: {
    type: String,
    enum: {
      values: ["male", "female", "other"],
      message: "Gender must be either male, female or other",
    },
  },
  birthdate: {
    type: Date,
    validate: {
      validator: function (value) {
        return value <= new Date();
      },
      message: "your not born yet, how the hell you want to go to a stadium?",
    },
  },
  //Country, province and city that the user is born in
  country: {
    type: String,
    minLength: [2, "country name must have more than 2 characters"],
    maxLength: [100, "country name must have less than 100 characters"],
  },
  province: {
    type: String,
    minLength: [2, "province name must have more than 2 characters"],
    maxLength: [100, "province name must have less than 100 characters"],
  },
  city: {
    type: String,
    minLength: [2, "city name must have more than 2 characters"],
    maxLength: [100, "city name must have less than 100 characters"],
  },
  joindate: {
    type: Date,
    requried: [true, "Each user must have a join date"],
  },
  emailConfirmationCode: String,
  emailConfiramtionCodeExpiryDate: Date,

  //This field contains tickets for mathces that are not finished yet
  tickets: [
    {
      id: {
        type: mongoose.Types.ObjectId,
        ref: "tickets",
      },
      price: {
        type: Number,
      },
      match: {
        type: mongoose.Types.ObjectId,
        ref: "tickets",
      },
      matchDate: {
        type: Date,
      },
    },
  ],
});
//encrypting the user`s password
// userSchema.pre("save", async function (next) {
//   //this fucntion will only runs if the password is modified
//   if (!this.isModified("password")) return next();

//   this.confirmPassword = undefined;
//   next();
// });

// userSchema.pre("updateOne", async function (next) {
//   const docToUpdate = await this.model.updateOne(this.getQuery());
//   console.log(docToUpdate);
//   next();
// });
userSchema.index(
  { email: 0 },
  { phoneNumber: 0 },
  { idNumber: 0 },
  { passportNumber: 0 }
);

userSchema.methods.hashPassword = async (password) => {
  return await bcrypt.hash(password, 14);
};

userSchema.methods.comparePassowrd = async function (
  candidatePassword,
  hashedPassword
) {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  const changedTimestamp = parseInt(
    this.passwordChangedAt.getTime() / 1000,
    10
  );
  return JWTTimestamp < changedTimestamp;
};

userSchema.methods.creatPasswordResetToken = async function () {
  const resetToken = await crypto.randomBytes(32).toString("hex");
  //encrypting reset token
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  //Token will expire after 30 minutes
  this.passwordResetExpires = Date.now() + 10 * 180 * 1000;
  return resetToken;
};

const userModel = mongoose.model("users", userSchema);
module.exports = userModel;
