//adding modules
const express = require("express");
const helmet = require("helmet");
const app = express();
const cookieParser = require("cookie-parser");
const sanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const compression = require("compression");
const cors = require("cors");
//adding application moduels
const globalErrorHandler = require("./Controllers/errorController");
//adding route files
const userRoutes = require("./Routes/userRoutes");
const stadiumRoutes = require("./Routes/stadiumRoutes");
const teamRoutes = require("./Routes/teamRoutes");
const compRoutes = require("./Routes/competitionRoutes");
const matchRoutes = require("./Routes/matchRoutes");
const couponRoutes = require("./Routes/couponRoutes");
const ticketRoutes = require("./Routes/ticketRoutes");
const viewRoutes = require("./Routes/viewRoutes");
const { AppError } = require("./utilities/errorHandler");
//adding static files folder to app middleware
app.use(express.static(`${__dirname}/static`));
//adding readable datas from body to middleware
app.use(express.json({ limit: "15kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(express.urlencoded());-

//prevent data sanitization against NoSQL query injection
app.use(sanitize());

app.use(cors());
app.options("*", cors());
//prevent data sanitization against XSS
app.use(xss());

app.use(compression());

//adding routes to middleware
app.use("/", viewRoutes);
app.use("/user", userRoutes);
app.use("/stadium", stadiumRoutes);
app.use("/teams", teamRoutes);
app.use("/matches", matchRoutes);
app.use("/competitions", compRoutes);
app.use("/coupons", couponRoutes);
app.use("/tickets", ticketRoutes);
app.all("*", (req, res, next) => {
  return next(
    new AppError(
      `hmm, i cant find ${req.originalUrl}, it seems like you entered it wrongly`,
      404
    )
  );
});

//handling application errors with global error handler
app.use(globalErrorHandler);
module.exports = app;
