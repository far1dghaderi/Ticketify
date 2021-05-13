const express = require("express");
const router = express.Router();
const teamModel = require("./../Models/teamModel");
const teamController = require("./../Controllers/TeamController");
const basicCrud = require("./../Controllers/basicCrudController");
const authController = require("./../Controllers/authController");

router.post(
  "/",
  authController.protect,
  authController.restrictAccess,
  teamController.uploadCompetitionLogo,
  teamController.resizeAndSaveCompetitionImages,
  teamController.createTeam
);

router
  .route("/:id")
  .patch(
    teamController.uploadCompetitionLogo,
    teamController.resizeAndSaveCompetitionImages,
    basicCrud.updateOne(teamModel)
  );
module.exports = router;
