const nodemailer = require("nodemailer");
module.exports = class Email {
  transport() {
    return nodemailer.createTransport({
      host: process.env.NODE_MAILER_HOST,
      port: process.env.NODE_MAILER_PORT,
      auth: {
        user: process.ENV.NODE_MAILER_USERNAME,
        pass: process.ENV.NODE_MAILER_PASSWORD,
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
  sendMachInfo() {
    this.transport().sendMail({
      from: '"Ticketify 👻" <tickets@ticketify.com>', // sender address
      to: "faridghaderi@gmail.com", // list of receivers
      subject: "Match ticket details", // Subject line
      html: "<h4>Ticket for ", // html body
    });
  }
};
