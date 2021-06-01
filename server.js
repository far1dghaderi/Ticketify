const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Email = require("./utilities/email");
const email = new Email();
//specify app`s config file
dotenv.config({ path: "./config.env" });
//Connecting to Data base
const connectionString = process.env.DATABASE_CONNECTION_STRING;
mongoose
  .connect(connectionString, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("app has been connected to database successfully!");
  });

const server = app.listen(process.env.PORT, () => {
  console.log("server is listening...");
});
