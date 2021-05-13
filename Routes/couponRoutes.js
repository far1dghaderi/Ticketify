const express = require("express");
const router = express.Router();
const couponModel = require("./../Models/couponModel");
const couponController = require("./../Controllers/couponController");
const basicCrud = require("./../Controllers/basicCrudController");
const authController = require("./../Controllers/authController");

router.use(authController.protect, authController.restrictAccess);
router.post("/", couponController.createCoupon);
router.route("/:id").patch(basicCrud.updateOne(couponModel));

module.exports = router;
