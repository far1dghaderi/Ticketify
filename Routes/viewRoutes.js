const express = require("express");
const router = express.Router();
const viewController = require("../Controllers/viewController");

router.use(viewController.showAccountMenu);
router.route("/").get(viewController.getMatches);

router.get("/user/resetpassword", viewController.showResetPasswordForm);
router
  .route("/user/resetpassword/:resetToken")
  .get(viewController.showChangePasswordForm);
module.exports = router;
