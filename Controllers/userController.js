const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const userModel = require("../Models/userModel");
const { catchAsync, AppError } = require("./../utilities/errorHandler");

//this field will update user information except security fields like pwd, confirmNumber and ...
exports.updateUser = catchAsync(async (req, res, next) => {
  const user = new userModel(req.user);
  //applying new values to the user model
  user.firstname = req.body.firstname || user.firstname;
  user.lastname = req.body.lastname || user.lastname;
  user.email = req.body.email || user.email;
  user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
  user.idNumber = req.body.idNumber || user.idNumber;
  user.passportNumber = req.body.passportNumber || user.passportNumber;
  user.gender = req.body.gender || user.gender;
  user.birthdate = req.body.birthdate || user.birthdate;
  user.country = req.body.country || user.country;
  user.province = req.body.province || user.province;
  user.city = req.body.city || user.city;
  //if the user changes its phone number or email, theire verified flag will be change to false
  if (req.body.email && req.body.email != req.user.email)
    user.verifiedEmail = false;
  if (req.body.phoneNumber && req.body.phoneNumber != req.user.phoneNumber)
    user.verifiedPhoneNumber = false;

  await userModel.findByIdAndUpdate(user._id, user, { runValidators: true });
  return res
    .status(200)
    .send("your account information has been updated successfully!");
});
