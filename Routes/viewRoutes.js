const express = require("express");
const router = express.Router();
const matchController = require("./../Controllers/matchController");

router.get("/", matchController.getMatches);

module.exports = router;
