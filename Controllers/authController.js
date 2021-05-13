const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");
const { catchAsync, AppError } = require("./../utilities/errorHandler");
const userModel = require("./../Models/userModel");

//this function will sign a jwt token
const signJWT = (userID) => {
  return jwt.sign({ id: userID }, process.env.JWT_SECRET_CODE, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
//create a jwt token and save it into the cookie
const createAndSaveJwtToken = (user, resMessage, statusCode, req, res) => {
  //generating JWT token
  const token = signJWT(user._id);
  //setting up cookie
  res.cookie("jwt", token, {
    expires: new Date().setMonth(
      new Date().getMonth() + process.env.COOKIE_EXPIRES_IN
    ),
    httpOnly: true,
    secure: req.secure,
  });

  //sending jwt back to the client
  res.status(statusCode).send(resMessage);
};
//handling user signup request
//sign up a user
exports.signup = catchAsync(async (req, res, next) => {
  //check if the user signed in before
  if (req.cookies.jwt)
    return next(new AppError("you have been already signed in!", 401));
  //createing user
  let user = new userModel({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    role: "user",
    email: req.body.email,
    passwordChangedAt: Date.now(),
  });
  user.password = await user.hashPassword(req.body.password);
  user = await userModel.create(user);
  //generate JWT token and save it into the cookies and send response to the client
  const responseMsg =
    "your account has been created successfully! you are now logged in";
  createAndSaveJwtToken(user._id, responseMsg, 201, req, res);
  res.status(201).send("succeed!");
});
//handling user login request
exports.login = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt)
    return next(new AppError("you have been already signed in!", 401));
  //check if user passes the password with the body
  if (!req.body.password) {
    return next(
      new AppError(
        "you need to enter your password in order to login to your account",
        400
      )
    );
  }

  //searching for user with email
  if (req.body.email) {
    const user = await userModel
      .findOne({ email: req.body.email })
      .select("+password");
    if (user == null)
      return next(new AppError("there is no user with this email", 400));
    if (await user.comparePassowrd(req.body.password, user.password)) {
      //generate JWT token and save it into the cookies and send response to the client
      const responseMsg = "your have been logged in successffully!";
      createAndSaveJwtToken(user._id, responseMsg, 201, req, res);
    } else {
      return next(new AppError("incorrect credentials, please try again", 400));
    }
  }
  //searching for user with phoneNumber
  else if (req.body.phoneNumber) {
    const user = await userModel
      .findOne({ phoneNumber: req.body.phoneNumber })
      .select("+password");
    if (user == null)
      return next(new AppError("there is no user with this phoneNumber", 400));

    if (user.comparePassowrd(req.body.password, user.password)) {
      //generate JWT token and save it into the cookies and send response to the client
      const responseMsg = "your have been logged in successffully!";
      createAndSaveJwtToken(user._id, responseMsg, 201, req, res);
    } else {
      return next(new AppError("incorrect credentials, please try again", 400));
    }
  }
  //throw an error if user didnt pass neither of email and phoneNumber
  else {
    return next(
      new AppError(
        "you need to specify your email or phone number in order to login",
        400
      )
    );
  }
});

//logging out the user
exports.signout = catchAsync(async (req, res, next) => {
  if (!req.cookies.jwt)
    return next(new AppError("you need to sign in in order to sign out!"));
  res.cookie("jwt", "loggedout", { maxAge: 0 });
  res.status(200).send("you have been logged out successfully!");
});
//update password
exports.changePassword = catchAsync(async (req, res, next) => {
  //checking if the user pass all required values
  if (!req.body.oldPassword) {
    return next(
      new AppError(
        "your have to pass your old password in order to update your password",
        401
      )
    );
  }
  if (!req.body.newPassword) {
    return next(
      new AppError(
        "your have to pass your new password in order to update your password",
        401
      )
    );
  }
  //comparing the old password with users password to make user acutal user wants to change it
  const pwdCompare = await req.user.comparePassowrd(
    req.body.oldPassword,
    req.user.password
  );
  if (!pwdCompare)
    return next(new AppError("your old password is incorrect!", 401));

  //comparing password and confirm password
  if (req.body.newPassword != req.body.confirmPassword)
    return next(new AppError("passwords are not same!", 401));

  //comparing new password and old password | they cant be same
  if (await req.user.comparePassowrd(req.body.newPassword, req.user.password)) {
    return next(
      new AppError(
        "your new password could not be the same with your old one",
        401
      )
    );
  }
  //hashing password
  const hashedPassword = await req.user.hashPassword(req.body.newPassword);
  await userModel.findByIdAndUpdate(req.user._id, {
    password: hashedPassword,
    passwordChangedAt: new Date(),
  });
  //change the user cookie and send response to the client
  const responseMsg = "your password has been changed successfully!";
  createAndSaveJwtToken(req.user._id, responseMsg, 200, req, res);
});
//forgot password - sending request to reset password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt)
    return next(new AppError("you have been already signed in!", 401));
  if (!req.body.email) {
    return next(
      new AppError(
        "you have to pass your email in order to reset your password!",
        404
      )
    );
  }
  //get the user with the email in body
  const user = await userModel.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError("there is no user with this email!", 404));
  if (user.passwordResetToken)
    return next(
      new AppError(
        "a password reset token has been already sent to your email",
        401
      )
    );
  //generate reset token and save it into the DB
  const resetToken = await user.creatPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //generating reset url
  const resetURL = `we sent an reset email to ${
    user.email
  } \n got to this address to reset your password: ${req.protocol}://${req.get(
    "host"
  )}/user/resetPassword/${resetToken}`;
  //sending url back to the client
  res.send(resetURL);
});

//reset user password
exports.resetPassword = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt)
    return next(new AppError("you have been already signed in!", 401));
  const hashedToken = await crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  //search for the user with this token
  const user = await userModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //check if the user was exist
  if (!user)
    return next(new AppError("your password reset token is invalid!", 401));
  //check for the passwords in the body
  if (!req.body.password || !req.body.confirmPassword) {
    return next(
      new AppError(
        "please enter your new password in order to reset your password!",
        401
      )
    );
  }
  if (req.body.password != req.body.confirmPassword)
    return next(new AppError("passwords are not same!", 401));
  //checking password length
  if (req.body.password.length < 8 || req.body.password.length > 128) {
    return next(
      new AppError(
        "password length must be lower than 128 and bigger than 7",
        401
      )
    );
  }
  //changing user field values and save new password
  user.password = await user.hashPassword(req.body.password);
  user.passwordChangedAt = new Date();
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({});
  res.send(
    "your password has been reset successfully! you can now login with your new password"
  );
});
//protect urls from users that are not logged in
exports.protect = catchAsync(async (req, res, next) => {
  //getting the token from cookies and check if it was there
  let token = req.cookies.jwt;
  if (!token)
    return next(new AppError("you need to login to perform this action", 401));

  //verifying JWT token
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_CODE
  );
  //getting user with the id in jwt payload
  const user = await userModel.findById(decodedToken.id).select("+password");

  if (!user)
    return next(new AppError("you need to login to perform this action", 401));

  //check if the user changed its password after generating token or not
  if (user.changedPasswordAfter(decodedToken.iat))
    return next(new AppError("you need to login to perform this action", 401));

  req.user = user;
  next();
});

//restrict access to routes that are for admins
exports.restrictAccess = (req, res, next) => {
  if (req.user.role != "admin") {
    return next(
      new AppError("you dont have permission to reach this page", 403)
    );
  }
  next();
};
