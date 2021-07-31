const express = require("express");
const rateLimit = require("express-rate-limit");
const userController = require("./../Controllers/userController");
const authController = require("./../Controllers/authController");
const confirmEmail = require("./../API/confirmEmail");
const router = express.Router();

//#region reseting passwornd region
router.post("/resetpassword/", authController.forgotPassword);
router.post("/resetpassword/:resetToken", authController.resetPassword);
//#endregion

//#region Login && Signup operations
router.post("/signup", authController.signup);
router.post("/signin", authController.login);
router.get("/logout", authController.protect, authController.signout);
//#endregion
router.use(authController.protect);

//#region Updating user account details
router.post("/updateAccountInfo", userController.updateUser);
router.post("/changePassword", authController.changePassword);
router.post("/email", authController.changeEmail);
//#endregion

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1,
});

//#region Verifying email
router.post("/email/sendcode", confirmEmail.sendConfirmationCode);
router.post("/email/verify", confirmEmail.verifyEmail);
//#endregion

router.use(authController.restrictAccess);
module.exports = router;
