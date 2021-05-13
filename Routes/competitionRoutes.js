const express = require("express");
const router = express.Router();
const compController = require("./../Controllers/competitionController");
const compModel = require("./../Models/competitionModel");
const basicCrud = require("./../Controllers/basicCrudController");
const authController = require("./../Controllers/authController");

router.use(authController.protect, authController.restrictAccess);
router.post(
  "/",
  compController.uploadCompetitionLogo,
  compController.resizeAndSaveCompImages,
  compController.createCompetition
);
router
  .route("/:id")
  .patch(
    compController.uploadCompetitionLogo,
    compController.resizeAndSaveCompImages,
    basicCrud.updateOne(compModel)
  );

module.exports = router;
