const { unlink, constants, access } = require("fs");
const jwt = require("jsonwebtoken");
const { catchAsync, AppError } = require("./errorHandler");
const { promisify } = require("util");

//get jwt payload
exports.getJwtPayload = async (token) => {
  //decoding token and get users id
  return await promisify(jwt.verify)(token, process.env.JWT_SECRET_CODE);
};

exports.removeFile = (fullpath) => {
  try {
    access(
      `${__dirname}/../Static/images/${fullpath}`,
      constants.F_OK,
      (err) => {
        if (err) {
          return;
        }
        unlink(`${__dirname}/../Static/images/${fullpath}`, (err) => {});
      }
    );
  } catch (err) {
    //donothing
  }
};
