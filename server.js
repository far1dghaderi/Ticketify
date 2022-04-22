const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
//specify app`s config file
if (process.env.ENV !== "production") {
  dotenv.config({ path: "./config.env" });
}
//Connecting to Database
const startApp = async () => {
  await mongoose.connect(process.env.DATABASE_CONNECTION_STRING, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
  app.listen(process.env.PORT || 3000, () => {
    console.log(
      "Application has been started successfully... on port " + process.env.PORT
    );
  });
};

startApp();
