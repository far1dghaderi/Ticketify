const crypto = require("crypto");
const userModel = require("../Models/userModel");
const matchModel = require("./../Models/matchModel");
const ticketModel = require("./../Models/ticketModel");
const compModel = require("./../Models/competitionModel");
const QueryFeatures = require("./../utilities/queryFeatures");
const { catchAsync, AppError } = require("./../utilities/errorHandler");
const { getJwtPayload } = require("../utilities/appTools");

//? show account operatin menu in navbar for logged in users
exports.showAccountMenu = catchAsync(async (req, res, next) => {
  let user;
  if (req.cookies.jwt) {
    user = await getJwtPayload(req.cookies.jwt);
  } else user = undefined;
  req.body.user = user;
  next();
});

exports.getMatches = catchAsync(async (req, res, next) => {
  //Quering DB for matches that are Visible and theire buyable date is gt than current date
  let query = matchModel.find({
    $and: [
      { visibleDate: { $lt: new Date() } },
      { endBuyDate: { $gt: new Date() } },
      { isDisabled: false },
    ],
  });
  if (req.query.sport) {
    req.query.sport = req.query.sport.toLowerCase();
    query = query.find({ sport: req.query.sport });
  }

  const queryFeatures = new QueryFeatures(query, req.query);
  query = queryFeatures.paginate().filter();
  query = query.populate({
    path: "stadium",
    select: "name country city stands capacity sport ",
  });
  const matches = await query;
  let count = await matchModel.countDocuments({
    $and: [
      { visibleDate: { $lt: new Date() } },
      { endBuyDate: { $gt: new Date() } },
    ],
  });
  res.status(200).render("index", {
    matches,
    title: "Home page",
    user: req.body.user,
    role: req.body.role,
    currentPage: req.query.page * 1 || 1,
    total: count,
    success: req.query.success,
    error: req.query.error,
    alert: req.query.alert,
  });
});

//#region Auth view controllers
exports.showSigninForm = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt)
    return res.redirect("/?error=You have been already logged in");
  return res.render("signin", {
    title: "Sign in",
    error: req.query.error,
    success: req.query.success,
  });
});

exports.showSignupForm = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt)
    return res.redirect("/?error=You have been already logged in");
  return res.status(201).render("signup", {
    title: "Sign up",
    error: req.query.error,
  });
});

exports.showResetPasswordForm = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    return res.redirect(
      "/?error=You can't reset your password while you are logged in!"
    );
  }
  res.status(201).render("reset_password", {
    title: "Reset Password",
    error: req.query.error,
  });
});

exports.showChangePasswordForm = catchAsync(async (req, res, next) => {
  //check if the user is logged in
  if (req.cookies.jwt) {
    return res.redirect(
      "/?error=You can't reset your password while you are logged in!"
    );
  }
  //check if the users reset token is correct
  const hashedToken = await crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await userModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.redirect(
      "/user/resetpassword?error=your password reset token is invalid! generate new one"
    );
  }
  res.status(201).render("change_password", {
    title: "Reset Password",
    token: req.params.resetToken,
  });
});
//#endregion

//user panel view controllers
//#region  user panel
exports.showUserDashboard = catchAsync(async (req, res, next) => {
  //get the number of tickets that user boughts and sum of theire prices
  const count = req.user.tickets.length;
  let spent = 0;
  req.user.tickets.forEach((ticket) => {
    spent += ticket.price;
  });
  //sort the tickets array of the user by theire dates
  let tickets = req.user.tickets.sort((ticket1, ticket2) => {
    return ticket2.matchDate - ticket1.matchDate;
  });

  //remove tickets that belongs to a finished match
  tickets = tickets.filter((ticket) => {
    return new Date() < ticket.matchDate;
  });

  let match;
  if (tickets[0]) {
    match = await matchModel.findById(tickets[0].match).populate({
      path: "stadium",
      select: "name country city address ",
    });
  }

  res.render("panel_dashboard", {
    title: "Dashboard",
    user: req.user,
    page: "Dashboard",
    panel: "user",
    verified: req.user.verifiedEmail,
    match,
    spent,
    count,
    success: req.query.success,
  });
});

//? user panel account details controller
exports.showUserDetails = catchAsync(async (req, res, next) => {
  res.render("panel_account", {
    title: "Account",
    user: req.user,
    page: "Account",
    panel: "user",
    success: req.query.success,
    error: req.query.error,
  });
});
//#endregion

//#region Admin panel view controllers

exports.showAdminDashboard = catchAsync(async (req, res, next) => {
  let usersCount = await userModel.count();
  let matchesCount = await matchModel.count();
  let ticketsCount = await ticketModel.count();
  let compsCount = await compModel.count();
  usersCount.toLocaleString();
  matchesCount.toLocaleString();
  ticketsCount.toLocaleString();
  compsCount.toLocaleString();
  //get statistics
  //get all tickets count that had been sold today
  //get all users count that has been signed up yesterday
  let yesterdaysDate = new Date().setDate(new Date().getDate() - 1);
  yesterdaysDate = new Date(new Date(yesterdaysDate).setHours(0, 0, 0, 0));
  let tommarrowsDate = new Date().setDate(new Date().getDate() + 1);
  tommarrowsDate = new Date(new Date(tommarrowsDate).setHours(0, 0, 0, 0));
  const todaysSoldTickets = await ticketModel.countDocuments({
    $and: [
      { purchaseDate: { $gte: new Date().setHours(0, 0, 0, 0) } },
      {
        purchaseDate: { $lt: tommarrowsDate },
      },
    ],
  });
  //get all tickets count that had been sold yesterday
  const yesterdaysSoldTickets = await ticketModel.countDocuments({
    $and: [
      { purchaseDate: { $lt: new Date().setHours(0, 0, 0, 0) } },
      {
        purchaseDate: { $gte: yesterdaysDate },
      },
    ],
  });
  //get all users count that has been signed up today
  const todaysJoinedUsers = await userModel.countDocuments({
    $and: [
      { joindate: { $gte: new Date().setHours(0, 0, 0, 0) } },
      {
        joindate: { $lt: tommarrowsDate },
      },
    ],
  });

  const yesterdaysJoinedUsers = await userModel.countDocuments({
    $and: [
      { joindate: { $lt: new Date().setHours(0, 0, 0, 0) } },
      {
        joindate: {
          $gte: yesterdaysDate,
        },
      },
    ],
  });
  //put all those statistics into one object

  //this two vars are decalred for preveneting divide a number to zero
  const yesterdaysSoldTickets2 =
    yesterdaysSoldTickets == 0 ? 1 : yesterdaysSoldTickets;
  const yesterdaysJoinedUsers2 =
    yesterdaysJoinedUsers == 0 ? 1 : yesterdaysJoinedUsers;
  const statistics = {
    soldTickets: todaysSoldTickets,
    joinedUsers: todaysJoinedUsers,
    //get the percentage of todays ticket seeling growth
    todaysTicketsGrowth:
      ((todaysSoldTickets - yesterdaysSoldTickets) / yesterdaysSoldTickets2) *
      100,
    //get the percentage of todays joined users growth
    todaysUsersGrowth:
      ((todaysJoinedUsers - yesterdaysJoinedUsers) / yesterdaysJoinedUsers2) *
      100,
  };
  return res.render("adminpanel_dashboard", {
    title: "Dashboard",
    user: req.body.user,
    panel: "admin",
    page: "Dashboard",
    usersCount,
    matchesCount,
    ticketsCount,
    compsCount,
    statistics,
  });
});

exports.showCompetitionForm = catchAsync(async (req, res, next) => {
  return res.render("adminpanel_C_competition", {
    title: "Create competition",
    error: req.query.error,
    success: req.query.success,
    panel: "admin",
  });
});

exports.showTeamForm = catchAsync(async (req, res, next) => {
  return res.render("adminpanel_C_team", {
    title: "Create Team",
    panel: "admin",
    user: req.body.user,
    error: req.query.error,
    success: req.query.success,
  });
});

exports.showStadiumForm = catchAsync(async (req, res, next) => {
  return res.render("adminpanel_C_stadium", {
    title: "Create stadium",
    action: "add",
    panel: "admin",
    user: req.body.user,
    error: req.query.error,
    success: req.query.success,
  });
});

exports.showMatchForm = catchAsync(async (req, res, next) => {
  return res.render("adminpanel_C_match", {
    title: "Add/edit match",
    action: "add",
    panel: "admin",
    user: req.body.user,
    error: req.query.error,
    success: req.query.success,
  });
});
//#endregion
