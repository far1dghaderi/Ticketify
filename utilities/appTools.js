const fs = require("fs");
const jwt = require("jsonwebtoken");
const { catchAsync } = require("./errorHandler");
const { promisify } = require("util");

//get jwt payload
exports.getJwtPayload = async (token) => {
  //decoding token and get id
  return await promisify(jwt.verify)(token, process.env.JWT_SECRET_CODE);
};
