const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
//specify app`s config file
dotenv.config({ path: "./config.env" });
//Connecting to Data base
const connectionString = process.env.DATABASE_CONNECTION_STRING;
const startApp = async () => {
  await mongoose.connect(connectionString, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
  app.listen(process.env.PORT, () => {
    console.log("Application has been started successfully...");
  });
};

startApp();
