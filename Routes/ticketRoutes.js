const express = require("express");
const router = express.Router();
const ticketController = require("./../Controllers/ticketController");
const authController = require("./../Controllers/authController");

router.post("/", authController.protect, ticketController.purchaseTicket);
module.exports = router;
