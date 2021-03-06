const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");
const { catchAsync, AppError } = require("./../utilities/errorHandler");
const userModel = require("./../Models/userModel");
const EmailSender = require("./../utilities/email");
const { getJwtPayload } = require("./../utilities/appTools");

const signJWT = (userID, userRole) => {
  return jwt.sign({ id: userID, role: userRole }, process.env.JWT_SECRET_CODE, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
//create a jwt token and save it into the cookie
const createAndSaveJwtToken = (user, statuscode, responseMsg, req, res) => {
  const token = signJWT(user._id, user.role);
  res.cookie("jwt", token, {
    expires: new Date().setMonth(
      new Date().getDate() + process.env.COOKIE_EXPIRES_IN
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });
  return res.status(statuscode).redirect(`/?success=${responseMsg}`);
};
exports.signup = catchAsync(async (req, res, next) => {
  //check if the user had already signed in
  if (req.cookies.jwt)
    return res.redirect("/?error=You have been already logged in");

  let user = new userModel({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    role: "user",
    email: req.body.email,
    passwordChangedAt: Date.now(),
    joindate: new Date(),
  });
  if (user.password != user.confirmPassword)
    return res.redirect("/user/signup?error=Passwords are not the same");

  user.password = await user.hashPassword(req.body.password);
  user = await userModel.create(user);
  const email = new EmailSender();
  email.sendWelcome(user);
  //generate JWT token and save it into the cookies and send as response to the client
  const responseMsg =
    "your account has been created successfully! you are now logged in";
  createAndSaveJwtToken(user, 201, responseMsg, req, res);
});
exports.login = async (req, res, next) => {
  if (req.cookies.jwt)
    return res.redirect("/?error=You have been already logged in!");
  if (!req.body.email) {
    return res.render("signin", {
      error: "You need to enter your email for logging in to your account",
    });
  }
  if (!req.body.password) {
    return res.render("signin", {
      error: "You need to enter your password for logging in to your account",
    });
  }

  const user = await userModel
    .findOne({ email: req.body.email.toLowerCase() })
    .select("+password");
  if (user == null) {
    return res.render("signin", {
      error: "There is no user with this email",
    });
  }
  if (await user.comparePassowrd(req.body.password, user.password)) {
    //generate JWT token and save it into the cookies and send response to the client
    const responseMsg = "your have been logged in successffully!";
    createAndSaveJwtToken(user, 201, responseMsg, req, res);
  } else {
    return res.render("signin", {
      error: "Inccorect credentials, please try again",
    });
  }
};

exports.signout = catchAsync(async (req, res, next) => {
  if (!req.cookies.jwt) {
    return res
      .status(401)
      .redirect(`/?error=You need to login in order to logout`);
  }

  res.cookie("jwt", "loggedout", { maxAge: 0 });
  res.status(200).redirect("/?success=You have been logged out successfully");
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const user = await userModel.findById(req.user._id).select("password");
  if (!req.body.oldPassword) {
    return res.redirect(
      "/panel/account/?error=your have to pass your old password in order to update your password"
    );
  }
  if (!req.body.newPassword) {
    return res.redirect(
      "/panel/account/?error=your have to pass your new password in order to update your password"
    );
  }
  if (req.body.newPassword != req.body.confirmNewPassword) {
    return res.redirect("/panel/account/?error=passwords are not same!");
  }

  const pwdCompare = await req.user.comparePassowrd(
    req.body.oldPassword,
    user.password
  );
  if (!pwdCompare) {
    return res.redirect(
      "/panel/account/?error=your old password is incorrect!!"
    );
  }

  if (await req.user.comparePassowrd(req.body.newPassword, user.password)) {
    return res.redirect(
      "/panel/account/?error=your new password could not be the same with your old one!"
    );
  }
  const hashedPassword = await req.user.hashPassword(req.body.newPassword);
  await userModel.findByIdAndUpdate(req.user._id, {
    password: hashedPassword,
    passwordChangedAt: new Date(),
  });
  //change the user cookie and send response to the client
  const responseMsg = "your password has been changed successfully!";
  createAndSaveJwtToken(req.user, 200, responseMsg, req, res);
});
exports.forgotPassword = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    return res.status(401).render("reset_password", {
      error: "you have been already signed in!",
      title: "Reset Password",
    });
  }
  if (!req.body.email) {
    return res.status(404).render("reset_password", {
      error: "you have to pass your email in order to reset your password!",
      title: "Reset Password",
    });
  }
  const user = await userModel.findOne({ email: req.body.email.toLowerCase() });
  if (!user) {
    return res.status(404).render("reset_password", {
      error: "there is no user with this email!",
      title: "Reset Password",
    });
  }
  //generate reset token and save it into the DB
  const resetToken = await user.creatPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //generating reset url
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/user/resetPassword/${resetToken}`;
  //send back the reset token to the user

  const email = new EmailSender();
  await email.sendResetToken(resetURL);
  res.status(201).render("reset_password", {
    success: "Reset link has been sent to your email successfully!",
    title: "Reset Password",
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    return res.status(401).render("reset_password", {
      error: "you have been already signed in!",
      title: "Reset Password",
    });
  }
  const hashedToken = await crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");
  const user = await userModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(401).render("reset_password", {
      error: "your password reset token is invalid!!",
      title: "Reset Password",
    });
  }
  if (!req.body.password || !req.body.confirmPassword) {
    return res.status(401).render("reset_password", {
      error: "please enter your new password in order to reset your password!",
      title: "Reset Password",
    });
  }
  if (req.body.password != req.body.confirmPassword) {
    return res.status(401).render("reset_password", {
      error: "passwords are not same!",
      title: "Reset Password",
    });
  }
  if (req.body.password.length < 8 || req.body.password.length > 128) {
    return res.status(401).render("reset_password", {
      error: "password length must be lower than 128 and bigger than 7",
      title: "Reset Password",
    });
  }
  user.password = await user.hashPassword(req.body.password);
  user.passwordChangedAt = new Date();
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({});
  return res.redirect(
    200,
    "/user/signin?success=Your password has been successfully reseted. You can now login"
  );
});

exports.changeEmail = catchAsync(async (req, res, next) => {
  if (req.body.email == req.user.email) {
    res
      .status(400)
      .redirect("/user/panel/account?error=You are using this email right now");
  }
  const user = await userModel.findById(req.user._id);
  if (req.body.email) {
    user.email = req.body.email;
    user.verifiedEmail = false;
  } else {
    return res
      .status(400)
      .redirect(
        "/user/panel/account?error=please pass your new email in order to change it."
      );
  }
  await user.save();

  res
    .status(200)
    .redirect(
      "/user/panel/account?success=Your email has been changed successfully. please verify it ASAP."
    );
});
//protect urls from users that are not logged in
exports.protect = catchAsync(async (req, res, next) => {
  let token = req.cookies.jwt;
  if (!token) {
    return res
      .status(401)
      .redirect("/user/signin?error=You need to login to perform this action");
  }

  //verifying JWT token
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_CODE
  );
  const user = await userModel.findById(decodedToken.id).select("-password");

  if (!user) {
    return res
      .status(401)
      .redirect("/user/signin?error=You need to login to perform this action");
  }

  if (user.changedPasswordAfter(decodedToken.iat)) {
    return res
      .status(401)
      .redirect("/user/signin?error=You need to login to perform this action");
  }
  req.user = user;
  next();
});

exports.restrictAccess = catchAsync(async (req, res, next) => {
  const user = await getJwtPayload(req.cookies.jwt);
  if (user.role != "admin") {
    return res.redirect("/");
  }
  next();
});
