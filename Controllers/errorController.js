const { AppError } = require("./../utilities/errorHandler");

//handlers for various kind of errors
const handleValidationErrorDB = (errorObject) => {
  const errors = Object.values(errorObject.errors).map((item) => item.message);
  const errorMessage = "Invalid input data:" + errors.join(". ");
  return new AppError(errorMessage, 400);
};

const handleCastErrorDB = (errorObject) => {
  const message = `Invalid ${errorObject.path}: ${errorObject.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (errorObject) => {
  let duplicateValue = Object.keys(errorObject.keyValue)[0];
  const message = `The value that you entered for ${duplicateValue} has been used before. Please use another value!`;
  return new AppError(message, 400);
};
const handleJWTError = () => {
  new AppError("you need to login to perform this action", 401);
};

const handleJWTExpiredError = () => {
  new AppError("you need to login to perform this action", 401);
};
//Sending errors

//sending errors in development mode
const sendErrorDev = async (err, req, res) => {
  return res.status(err.statusCode).json({
    status: err.statusCode,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
//sending errors in production mode
const sendErrorProduction = (err, req, res) => {
  //LOGICAL ERRORS - send a logical error to client and let them know what did they do wrong
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  //programming errors - just tell the client that something went wrong, no need to leak error details
  return res.status(500).json({
    status: "error",
    message: `Something went wrong!`,
  });
};
//!Global error handler
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  //send errors in development environment
  if (process.env.NODE_ENV === "development") sendErrorDev(err, req, res);
  else if (process.env.NODE_ENV === "production") {
    //send errors in production environment
    let error = { ...err };
    error.message = err.message;
    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    sendErrorProduction(error, req, res);
  }
};
