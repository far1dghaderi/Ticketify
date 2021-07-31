const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const ticketController = require("./../Controllers/ticketController");
const authController = require("./../Controllers/authController");
router.use(authController.protect);
router.post("/", ticketController.purchaseTicket);

module.exports = router;
