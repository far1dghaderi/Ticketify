const express = require("express");
const router = express.Router();
const matchController = require("./../Controllers/matchController");
const authController = require("./../Controllers/authController");
const viewController = require("./../Controllers/viewController");

router.use(viewController.showAccountMenu);
router.route("/:id").get(matchController.getMatch);
router.use(authController.protect, authController.restrictAccess);

router.post(
  "/",
  matchController.uploadMatchLogo,
  matchController.resizeAndSaveCompImages,
  matchController.createMatch
);

router
  .route("/update/:id")
  .post(
    matchController.uploadMatchLogo,
    matchController.resizeAndSaveCompImages,
    matchController.updateMatch
  );

router.route("/delete/:id").get(matchController.deleteMatch);
module.exports = router;
