const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const stripe = require("stripe")(
  "sk_test_51IQv7tGKDFcoxrMkzfPQwz1PbA91LQvHW8TZ5JuWllUjMIngy5rKuZWRxqMmSvAS8ssiPQbJicMqZfUrys7zzkdr00JPisCvGH"
);

const ticketController = require("./../Controllers/ticketController");
const authController = require("./../Controllers/authController");
router.use(authController.protect);
router.post("/", ticketController.purchaseTicket);

module.exports = router;
