const express = require("express");
const rateLimit = require("express-rate-limit");
const authController = require("./../Controllers/authController");
const confirmEmail = require("./../API/confirmEmail");
const router = express.Router();

router.use(authController.protect, authController.restrictAccess);
const limiter = rateLimit({
  windowMs: 1 * 60 * 100,
  max: 1,
});

router.post("/email", authController.changeEmail);
router.post("/email/sendCode", limiter, confirmEmail.sendConfirmationCode);
router.post("/email/verify", confirmEmail.verifyEmail);
module.exports = router;
