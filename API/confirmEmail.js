const userModel = require("./../Models/userModel");
const Email = require("./../utilities/email");
const { catchAsync } = require("./../utilities/errorHandler");
const email = new Email();

exports.sendConfirmationCode = catchAsync(async (req, res, next) => {
  const user = await userModel.findById(req.user._id);
  //if users email has been cofirmed already, we wont produce confirmation code
  if (user.verifiedEmail) {
    return res.status(403).json({
      status: "fail",
      message: "Your email has been already confirmed",
    });
  }

  //produce confirmation code and set the expiry date
  user.emailConfirmationCode =
    Math.floor(Math.random() * (999999 - 100000)) + 100000;

  user.emailConfiramtionCodeExpiryDate = new Date(
    new Date().getTime() + 30 * 60000
  );
  await email.sendEmailConfirmationCode(user.emailConfirmationCode, user.email);

  await user.save();
  res.status(200).json({
    status: "success",
    message: "Vertification code has been sent successfully!",
  });
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const user = await userModel.findById(req.user._id);
  //if the email was activated before, we will break the operation
  if (user.verifiedEmail) {
    return res.status(403).json({
      status: "fail",
      message: "This account's email has been activated before",
    });
  }
  //if user dosen't have an activation code, we will ask for doing that
  if (!user.emailConfirmationCode) {
    return res.status(403).json({
      status: "fail",
      message:
        "You don't have an activation code, please register it for activation your account",
    });
  }
  //if the time of confirmation code has been expired, we will send an error back to the client
  if (user.emailConfiramtionCodeExpiryDate < new Date()) {
    return res.status(403).json({
      status: "fail",
      message:
        "Your confiramtion code has been expired. Please register new one.",
    });
  }

  if (req.body.code != user.emailConfirmationCode) {
    return res.status(403).json({
      status: "fail",
      message: "Invalid code, please try again.",
    });
  }

  user.emailConfirmationCode = undefined;
  user.emailConfiramtionCodeExpiryDate = undefined;
  user.verifiedEmail = true;
  await user.save();

  return res.json({
    status: "success",
    message: "Your email has been successfully confirmed.",
  });
});
