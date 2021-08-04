const express = require("express");
const router = express.Router();
const stadiumController = require("./../Controllers/stadiumController");
const authController = require("./../Controllers/authController");

router.use(authController.protect, authController.restrictAccess);
//create a stadium

router.post(
  "/",
  stadiumController.uploadStadiumImg,
  stadiumController.resizeAndSaveStadiumImg,
  stadiumController.createStadium
);

router
  .route("/update/:id")
  .post(
    stadiumController.uploadStadiumImg,
    stadiumController.resizeAndSaveStadiumImg,
    stadiumController.updateStadium
  );

router.get("/delete/:id", stadiumController.deleteStadium);
module.exports = router;
