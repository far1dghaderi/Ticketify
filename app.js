const express = require("express");
const helmet = require("helmet");
const app = express();
const cookieParser = require("cookie-parser");
const sanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const compression = require("compression");
const cors = require("cors");
const pug = require("pug");

const globalErrorHandler = require("./Controllers/errorController");
const { getJwtPayload } = require("./utilities/appTools");

app.set("view engine", "pug");
app.set("views", "./Views");

const userRoutes = require("./Routes/userRoutes");
const stadiumRoutes = require("./Routes/stadiumRoutes");
const teamRoutes = require("./Routes/teamRoutes");
const compRoutes = require("./Routes/competitionRoutes");
const matchRoutes = require("./Routes/matchRoutes");
const ticketRoutes = require("./Routes/ticketRoutes");
const viewRoutes = require("./Routes/viewRoutes");
const authRoutes = require("./Routes/authRoutes");

const { AppError, catchAsync } = require("./utilities/errorHandler");
const { hpkp } = require("helmet");

app.use(express.static(`${__dirname}/Static`));

app.use(express.json({ limit: "15kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sanitize());
app.use(cors());
app.options("*", cors());
app.use(xss());
app.use(hpp());
app.use(compression());

app.use("/", viewRoutes);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/stadium", stadiumRoutes);
app.use("/teams", teamRoutes);
app.use("/match", matchRoutes);
app.use("/competitions", compRoutes);
app.use("/tickets", ticketRoutes);
app.all(
  "*",
  catchAsync(async (req, res, next) => {
    let user;
    if (req.cookies.jwt) {
      user = await getJwtPayload(req.cookies.jwt);
    } else user = undefined;
    res.render("404", {
      title: "Not found",
      user: req.user,
      success: req.query.success,
      error: req.query.error,
      alert: req.query.alert,
    });
  })
);

app.use(globalErrorHandler);
module.exports = app;
