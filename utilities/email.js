const nodemailer = require("nodemailer");
module.exports = class Email {
  transport() {
    return nodemailer.createTransport({
      host: process.env.NODE_MAILER_HOST,
      port: process.env.NODE_MAILER_PORT,
      auth: {
        user: process.env.NODE_MAILER_USERNAME,
        pass: process.env.NODE_MAILER_PASSWORD,
      },
    });
  }
  sendWelcome(user) {
    this.transport().sendMail({
      from: '"Ticketify 👻" <tickets@ticketify.com>',
      to: user.email,
      subject: "Welcome", // Subject line
      html: `<h1>Hey ${user.firstname}</h1>
       <p>You're so welcome to Ticketify, World's leading ticket selling platform and we're so glad that you choose us as your platform for buying tickets.</p>
       <br><br>
       <p> With Ticketify, you can buy tickets for various sports and matches. we support <strong> Most famous Leagues </strong> and <strong>Teams</strong>
       in our platform.</p>

       <span style="color:red;margin-right:15px;">NOTE:</span>
       <span> Please keep in mind in order to buy tickets, you need to verify your account by:</span>
       <ul>
       <li style="padding-left:10px;"> Verifying your email in user panel<account </li>
       <li style="padding-left:10px;"> Adding one of your Identity ID or PassportNo in your profile </li>
       </ul>
       <span style="color:red;margin-right:15px;">NOTE:</span> <span>Don't enter wrong values in those fields, if you do, we can't let you in</span>
       `,
    });
  }
  sendResetToken(resetUrl) {
    this.transport().sendMail({
      from: '"Ticketify 👻" <tickets@ticketify.com>', // sender address
      to: "faridghaderi@gmail.com", // list of receivers
      subject: "Reset password", // Subject line
      html: `<h5>This email sent to you due your request for resseting your password. click on the following link in order to reset your password</h5>
      <br> <br>
      <a href='${resetUrl}'> Reset password</a>
      <br>
      <p>If you didn't request for resseting your password, just ignore this email.</p>
      `,
      // html body
    });
  }
  sendPurchaseDetails(user, ticket, match, stadium) {
    this.transport().sendMail({
      from: '"Ticketify 👻" <tickets@ticketify.com>', // sender address
      to: "faridghaderi@gmail.com", // list of receivers
      subject: "Purchase information", // Subject line
      html: `<h2>Your ticket reservation was successfull.</h2><br>
      <h4> Here are your ticket's details:
      <ul>
      <li style='padding-left:10px;'><strong>Match:&nbsp;</strong>${
        match.homeTeam.name
      } - ${match.awayTeam.name} </li>
      <li style='padding-left:10px;'><strong>Fixture&nbsp;</strong>${
        match.fixture
      }</li>
      <li style='padding-left:10px;'><strong>Stadium name&nbsp;</strong>${
        stadium.name
      }
      <strong>stand:&nbsp;</strong>${ticket.stand}</li>
      <li> <strong>Match date:&nbsp;</strong>${new Date(
        match.matchDate
      ).toDateString()}&nbsp;&nbsp;${new Date(
        match.matchDate
      ).getHours()}:${new Date(match.matchDate).getMinutes()}</li>
      <li> <strong>Price:&nbsp;</strong>${ticket.price}
      
      `, // html body
    });
  }
  sendEmailConfirmationCode(code, email) {
    this.transport().sendMail({
      from: `"Ticketify" <ticketify@ticketify.com`,
      to: email,
      subject: "Confirm email",
      html: `<h2>Hi, this is your confirmation code for confirming your email in ticketify.</h2> <br> <h6>Use the code below in order to confirm your email:</h6> <h1>${code}</h1> <span> This code will expires in 30minutes`,
    });
  }
};
