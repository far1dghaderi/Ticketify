const express = require("express");
const router = express.Router();
const teamModel = require("./../Models/teamModel");
const teamController = require("./../Controllers/TeamController");
const basicCrud = require("./../Controllers/basicCrudController");
const authController = require("./../Controllers/authController");
const viewController = require("./../Controllers/viewController");

//This Routes are only accessible for signed in and admin users
router.use(authController.protect, authController.restrictAccess);
//Create new team
router.post(
  "/",
  teamController.uploadCompetitionLogo,
  teamController.resizeAndSaveCompetitionImages,
  teamController.createTeam
);

//update ream
router.post(
  "/update/:id",
  teamController.uploadCompetitionLogo,
  teamController.resizeAndSaveCompetitionImages,
  teamController.updateTeam
);

//deleting a team
router.get("/delete/:id", teamController.deleteTeam);
module.exports = router;
