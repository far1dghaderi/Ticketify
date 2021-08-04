const express = require("express");
const router = express.Router();
const compController = require("./../Controllers/competitionController");
const compModel = require("./../Models/competitionModel");
const authController = require("./../Controllers/authController");

router.use(authController.protect, authController.restrictAccess);
//create a competition
router.post(
  "/",
  compController.uploadCompetitionLogo,
  compController.resizeAndSaveCompImages,
  compController.createCompetition
);

router
  .route("/update/:id")
  .post(
    compController.uploadCompetitionLogo,
    compController.resizeAndSaveCompImages,
    compController.updateComp
  );

router.get("/delete/:id", compController.deleteComp);

module.exports = router;
