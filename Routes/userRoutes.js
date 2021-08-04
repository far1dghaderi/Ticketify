const express = require("express");
const router = express.Router();
const authController = require("./../Controllers/authController");
const userController = require("./../Controllers/userController");
const viewController = require("./../Controllers/viewController");
const matchController = require("./../Controllers/matchController");
const teamController = require("../Controllers/teamController");
const competitionContoller = require("../Controllers/competitionController");
const stadiumController = require("../Controllers/stadiumController");

router.use(viewController.showAccountMenu);

//#region show ogin && Signup pages
router.get("/signup", viewController.showSignupForm);
router.get("/signin", viewController.showSigninForm);

//#endregion

router.use(authController.protect);

//#region user Panel routes
router.get("/panel", viewController.showUserDashboard);
router.get("/panel/dashboard", viewController.showUserDashboard);
router.get("/panel/account", viewController.showUserDetails);
router.get("/panel/tickets", userController.getUserTickets);

//#endregion

//#region admin panel routes
router.use(authController.restrictAccess);
router.get("/adminpanel", viewController.showAdminDashboard);
router.get("/adminpanel/users", userController.getUsers);
router.get("/adminpanel/matches", matchController.getMatches);
router.get("/adminpanel/update/matches/:id", matchController.getMatchDetails);
router.get("/adminpanel/teams", teamController.getTeams);
router.get("/adminpanel/update/teams/:id", teamController.getTeamDetails);
router.get("/adminpanel/competitions", competitionContoller.getCompetitions);
router.get(
  "/adminpanel/update/competitions/:id",
  competitionContoller.getCompetitionDetails
);
router.get("/adminpanel/stadiums", stadiumController.getStadiums);
router.get(
  "/adminpanel/update/stadiums/:id",
  stadiumController.getStadiumDetails
);
router.get("/adminpanel/dashboard", viewController.showAdminDashboard);
router.get("/adminpanel/competitionform", viewController.showCompetitionForm);
router.get("/adminpanel/teamForm", viewController.showTeamForm);
router.get("/adminpanel/stadiumForm", viewController.showStadiumForm);
router.get("/adminpanel/matchForm", viewController.showMatchForm);
//#endregion

module.exports = router;
