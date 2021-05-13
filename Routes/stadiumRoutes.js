const express = require("express");
const router = express.Router();
const stadiumController = require("./../Controllers/stadiumController");
const authController = require("./../Controllers/authController");

router.use(authController.protect, authController.restrictAccess);
router.post("/", stadiumController.createStadium);
router.route("/:id").patch(stadiumController.updateStadium);

module.exports = router;
