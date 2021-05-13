const express = require("express");
const router = express.Router();
const authController = require("./../Controllers/authController");
const userController = require("../Controllers/userController");

router.post("/signup", authController.signup);
router.post("/signin", authController.login);
router.get("/signout", authController.protect, authController.signout);
router.patch("/updateUser", authController.protect, userController.updateUser);
router.patch(
  "/updatePassword",
  authController.protect,
  authController.changePassword
);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

module.exports = router;
