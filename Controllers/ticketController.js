//const stripe = require("stripe")();
const ticketModel = require("./../Models/ticketModel");
const matcheModel = require("./../Models/matchModel");
const stadiumModel = require("./../Models/stadiumModel");
const userModel = require("./../Models/userModel");
const matchModel = require("./../Models/matchModel");
const { catchAsync, AppError } = require("./../utilities/errorHandler");

exports.purchaseTicket = catchAsync(async (req, res, next) => {
  const ticket = new ticketModel({
    user: req.user._id,
    match: req.body.matchID,
    stand: req.body.standID,
  });
  if (!ticket.match) {
    return res
      .status(400)
      .redirect(
        `/?error=You need to specify the match that you want to buy it's ticket`
      );
  }

  if (!req.user.verifiedEmail) {
    return res
      .status(403)
      .redirect(
        `/user/panel/account?error=You need to confirm your email to buy a ticket`
      );
  }

  if (!req.user.idNumber && !req.user.passportNumber) {
    return res
      .status(403)
      .redirect(
        `/user/panel/account?error=You need to either have a id number or a passport number`
      );
  }

  //getting the match that the user want to buy its ticket
  const match = await matcheModel.findById(ticket.match);
  if (!match) {
    return res.status(400).redirect(`/?error=input match is invalid`);
  }
  //check if the use has bought this ticket before or not
  let hasBoughtBefore = await ticketModel.findOne({
    match: ticket.match,
    user: ticket.user,
  });
  if (hasBoughtBefore) {
    return res
      .status(400)
      .redirect(`/?error=you cant buy a ticket for one match twice`);
  }
  //check if the ticket selling for specific match has been started or not
  if (new Date(match.buyableDate) > new Date(Date.now())) {
    return res
      .status(400)
      .redirect(`/?error=ticket selling for this match has not begin yet!`);
  }

  //check if the ticket selling for specific match has been finished or not
  if (new Date(match.endBuyDate) < new Date(Date.now())) {
    return res
      .status(400)
      .redirect(`/?error=ticket selling for this match has been finished!!`);
  }
  //getting match's stadium
  const stadium = await stadiumModel.findById(match.stadium);
  const stands = stadium.stands;
  //checking the existance of entered stand ID
  const stand = stadium.checkStand(stands, ticket.stand);
  if (!stand) {
    return res
      .status(400)
      .redirect(`/?error=Oops! Entered stand id was incorrect!`);
  }
  //getting capacity by subtracting sold tickets count for the stand from main stand capacity
  const capacity =
    stadium.getStandCapacity(stands, ticket.stand).capacity -
    match.tickets.filter((item) => {
      return item.stand === ticket.stand;
    }).length;
  //check if there is any space left or not
  if (capacity <= 0) {
    return res
      .status(400)
      .redirect(
        `/?error=Oops! theres no remaining seats for this stand, please choose other stands!`
      );
  }
  // const session = await stripe.checkout.sessions.create({
  //   payment_method_types: ["card"],
  //   line_items: [
  //     {
  //       price_data: {
  //         currency: "usd",
  //         product_data: {
  //           name: match.homeTeam.name + " - " + match.awayTeam.name,
  //         },
  //         unit_amount: stand.price * 100,
  //       },
  //       quantity: 1,
  //     },
  //   ],
  //   mode: "payment",
  //   success_url: "http://127.0.0.1:8000/tickets/s",
  //   cancel_url: "https://example.com/cancel",
  // });
  ticket.price = stand.price;
  ticket.purchaseDate = new Date();
  const addedTicket = await ticketModel.create(ticket);
  //*if the program comes to this part, it means theres nothing wrong and user can buy the ticket

  await matchModel.findByIdAndUpdate(match._id, {
    $push: {
      tickets: {
        ticketID: addedTicket._id,
        stand: addedTicket.stand,
        userID: req.user.idNumber,
        userPassportNO: req.user.passportNumber,
        userMail: req.user.email,
      },
    },
  });
  const user = await userModel.findById(ticket.user);
  // if (user.tickets) {
  await userModel.findByIdAndUpdate(ticket.user, {
    $push: {
      tickets: {
        id: addedTicket._id,
        price: ticket.price,
        match: match._id,
        matchDate: match.matchDate,
      },
    },
  });

  res
    .status(200)
    .redirect(`/user/panel/dashboard?success=Purchase was successfull!`);
});
