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
  sendHello() {
    this.transport().sendMail({
      from: '"Ticketify 👻" <tickets@ticketify.com>', // sender address
      to: "faridghaderi@gmail.com", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    });
  }
  sendResetToken(token) {
    this.transport().sendMail({
      from: '"Ticketify 👻" <tickets@ticketify.com>', // sender address
      to: "faridghaderi@gmail.com", // list of receivers
      subject: "Reset password", // Subject line
      text: `${token}`, // plain text body
      html: `${token}`,
      // html body
    });
  }
  sendMachInfo() {
    this.transport().sendMail({
      from: '"Ticketify 👻" <tickets@ticketify.com>', // sender address
      to: "faridghaderi@gmail.com", // list of receivers
      subject: "Match ticket details", // Subject line
      html: "<h4>Ticket for ", // html body
    });
  }
  sendEmailConfirmationCode(code, email) {
    this.transport().sendMail({
      from: `"Ticketify" <ticketify@ticketify.com`,
      to: email,
      subject: "Confirm email",
      html: `<h2>Hi, this is your canfirmation code for confirming your email in ticketify.</h2> <br> <h6>Use the code below in order to confirm your email:</h6> <h1>${code}</h1> <span> This code will expires in 30minutes`,
    });
  }
};
