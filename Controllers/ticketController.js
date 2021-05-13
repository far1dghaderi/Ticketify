const ticketModel = require("./../Models/ticketModel");
const matcheModel = require("./../Models/matchModel");
const stadiumModel = require("./../Models/stadiumModel");
const userModel = require("./../Models/userModel");
const matchModel = require("./../Models/matchModel");
const couponModel = require("../Models/couponModel");
const { calculateAge } = require("../utilities/appTools");
const { catchAsync, AppError } = require("./../utilities/errorHandler");

exports.purchaseTicket = catchAsync(async (req, res, next) => {
  const ticket = new ticketModel({
    user: req.body.userID,
    match: req.body.matchID,
    stand: req.body.standID,
  });
  if (ticket.user === undefined)
    return next(new AppError("user id is not valid!", 400));
  if (ticket.match === undefined)
    return next(new AppError("match id is not valid!", 400));
  //check if the use has bought this ticket before or not
  let boughtTickets = await ticketModel.findOne({
    match: ticket.match,
    user: ticket.user,
  });
  if (boughtTickets)
    return next(new AppError("you cant buy a ticket for one match twice", 400));
  //getting the match that the user want to buy its ticket
  const match = await matcheModel.findById(ticket.match);
  //check if the ticket selling for specific match has been started or not
  if (new Date(match.buyableDate) > new Date(Date.now()))
    return next(
      new AppError("ticket selling for this match has not begin yet!", 400)
    );
  //check if the ticket selling for specific match has been finished or not
  if (new Date(match.endBuyDate) < new Date(Date.now()))
    return next(
      new AppError("ticket selling for this match has been finished!", 400)
    );
  //getting the user information that wants to buy match ticket
  const user = await userModel.findById(ticket.user);
  //check if there is any limitation for buying tickets
  if (match.limitation.gender) {
    if (match.limitation.gender != user.gender)
      return next(
        new AppError(
          "oops! you cant attend in this match because of your gender",
          400
        )
      );
  }
  if (match.limitation.age) {
    if (match.limitation.age > calculateAge(user.birthdate))
      return next(
        new AppError(
          "oops! you cant attend in this match because of your age",
          400
        )
      );
  }
  //getting match`s stadium
  const stadium = await stadiumModel.findById(match.stadium);
  //checking the existance of entered stand ID
  //* -1 means that the stand wasnt exist
  if (stadium.getStandCapacity(stadium, ticket.stand) == -1)
    return next(
      new AppError("entered stand ID does not exist in the stadium stands", 400)
    );
  //getting capacity by subtracting sold tickets count for the stand from main stand capacity
  const capacity =
    stadium.getStandCapacity(stadium, ticket.stand) -
    match.tickets.filter((item) => {
      return item.stand === ticket.stand;
    }).length;
  //check if theres any space left or not
  if (capacity <= 0)
    return next(
      new Error(
        "oops! theres no remaining seats for this stand, please try other stands"
      )
    );
  //Checking if there is any ticket in the body
  if (req.body.couponCode) {
    const coupon = await couponModel.findOne({ code: req.body.couponCode });
    if (coupon.length < 1)
      return next(new AppError("coupon code is invalid!", 400));
    //check if the token has is usable or expired
    if (coupon.usableAt > new Date()) {
      return next(new AppError("you cant use this coupon yet!", 400));
    }
    if (coupon.expiresAt < new Date())
      return next(new AppError("coupon code is invalid!", 400));
    //check if coupon is resgistered for some specific users
    if (coupon.users) {
      if (coupon.users.length > 0 && !coupon.checkUsers(coupon, user._id))
        return next(new AppError("this coupon is not usable for you!", 400));
    }

    //check if coupon is resgistered for some specific mathces
    const couponSchema = new couponModel();
    if (coupon.matches) {
      if (
        coupon.matches.length > 0 &&
        !couponSchema.checkMatches(coupon, match._id)
      )
        return next(
          new AppError("this coupon is not usable for this match!", 400)
        );
    }

    //check if coupon is resgistered for some specific teams
    if (coupon.teams) {
      if (
        coupon.teams.length > 0 &&
        !couponSchema.checkTeams(coupon, match.homeTeam)
      ) {
        return next(
          new AppError("this coupon is not usable for this match!", 400)
        );
      } else if (
        coupon.teams.length > 0 &&
        !couponSchema.checkTeams(coupon, match.awayTeam)
      ) {
        return next(
          new AppError("this coupon is not usable for this match!", 400)
        );
      }
    }
    //check dates
    if (!couponSchema.checkDates(coupon, match)) {
      //check coupon date and compare them to the match date
      return next(
        new AppError("this coupon could not be used on this match", 400)
      );
    }
    //check coupon prices
    if (coupon.price) {
      if (!couponSchema.checkPrices(coupon, match.price))
        new AppError("this coupon could not be used on this match", 400);
    }
    //check if user used this coupon before and compare it with maximum time than coupon can be used by a single user
    if (user.coupons != null && user.coupons != undefined) {
      const usedCoupons = user.coupons.filter((item) => {
        return item.toString() === coupon._id.toString();
      });
      if (coupon.usageTime <= usedCoupons.length)
        return next(new AppError("you cant use this coupon anymore!", 400));
      else user.coupons.push(coupon._id);
    } else {
      user.coupons.push(coupon._id);
    }
    await userModel.findByIdAndUpdate(user._id, user);
    //Apply coupon to ticket price
    let finalPrice =
      match.price - (coupon.discountPercentage / 100) * match.price;
    if (coupon.maxDiscount) {
      if (coupon.maxDiscount < match.price - finalPrice) {
        finalPrice = match.price - coupon.maxDiscount;
      }
    }
    ticket.finalPrice = finalPrice;
    //TODO
  }
  //-STOP THE EXECUTION

  //*if the program comes to this part, it means theres nothing wrong and user can buy the ticket
  ticket.purchaseDate = new Date();
  const addedTicket = await ticketModel.create(ticket);
  await matchModel.findByIdAndUpdate(match._id, {
    $push: { tickets: { ticketID: addedTicket._id, stand: addedTicket.stand } },
  });
  if (user.tickets) {
    await userModel.findByIdAndUpdate(ticket.user, {
      $push: {
        tickets: addedTicket._id,
      },
    });
  } else {
    user.tickets = [addedTicket._id];
    await userModel.findByIdAndUpdate(ticket.user, user);
  }

  return res.send("ticked has been purchased successfully!");
});
