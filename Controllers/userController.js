const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const matchModel = require("./../Models/matchModel");
const ticketModel = require("./../Models/ticketModel");
const userModel = require("./../Models/userModel");
const { catchAsync, AppError } = require("./../utilities/errorHandler");

//this function will update user information except security fields like pwd, confirmNumber and also contact information ...
exports.updateUser = catchAsync(async (req, res, next) => {
  const userObj = {};
  userObj.firstname = req.body.firstname;
  userObj.lastname = req.body.lastname;
  userObj.idNumber = req.body.idNumber == "" ? undefined : req.body.idNumber;
  userObj.passportNumber =
    req.body.passportNumber == "" ? undefined : req.body.passportNumber;
  userObj.gender = req.body.gender;
  userObj.birthdate = req.body.birthdate == "" ? undefined : req.body.birthdate;
  userObj.country = req.body.country;
  userObj.province = req.body.province;
  userObj.city = req.body.city;

  Object.keys(userObj).forEach((key) => {
    if (userObj[key] === undefined) delete userObj[key];
  });
  await userModel.findByIdAndUpdate(req.user._id, userObj, {
    runValidators: true,
  });
  return res
    .status(200)
    .redirect(
      "/user/panel/account?success=your account information has been updated successfully!"
    );
});

exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await userModel
    .find()
    .select(
      "-password -passwordChangedAt -passwordResetToken -role -passwordResetExpires"
    );
  res.status(201).render("adminpanel_users", {
    title: "Users",
    user: req.body.user,
    panel: "admin",
    page: "Users",
    users,
  });
});

exports.getUserTickets = catchAsync(async (req, res, next) => {
  let tickets = [];
  //get match details with the ID that is placed with tickets
  for (const ticket of req.user.tickets) {
    let match = await matchModel.findById(ticket.match).populate({
      path: "stadium",
      select: "name country city province stands capacity address image ",
    });
    let userTicket = await ticketModel.findById(ticket.id);
    if (match && userTicket) {
      tickets.push({
        match,
        stand: userTicket.stand,
        id: userTicket._id,
        price: userTicket.price,
      });
    }
  }
  tickets.sort((ticket1, ticket2) => {
    return new Date(ticket2.date) - new Date(ticket1.date);
  });
  return res.render("panel_tickets", {
    title: "Tickets",
    panel: "user",
    page: "Tickets",
    user: req.user,
    tickets,
  });
});
