const express = require("express");
const router = express.Router();
const teamModel = require("./../Models/teamModel");
const teamController = require("../Controllers/teamController");
const authController = require("./../Controllers/authController");
const viewController = require("./../Controllers/viewController");

router.use(authController.protect, authController.restrictAccess);

router.post(
  "/",
  teamController.uploadCompetitionLogo,
  teamController.resizeAndSaveCompetitionImages,
  teamController.createTeam
);

router.post(
  "/update/:id",
  teamController.uploadCompetitionLogo,
  teamController.resizeAndSaveCompetitionImages,
  teamController.updateTeam
);

router.get("/delete/:id", teamController.deleteTeam);
module.exports = router;
