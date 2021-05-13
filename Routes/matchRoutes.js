const express = require("express");
const router = express.Router();
const matchController = require("./../Controllers/matchController");
const authController = require("./../Controllers/authController");

router.route("/:id").get(matchController.getMatch);
router.use(authController.protect, authController.restrictAccess);
router.post(
  "/",
  matchController.uploadMatchLogo,
  matchController.resizeAndSaveCompImages,
  matchController.createMatch
);
router.route("/:id").patch(matchController.updateMatch);
module.exports = router;
