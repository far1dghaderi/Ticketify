const fs = require("fs");
//this function will calculate the age based on the birth date
exports.calculateAge = (birthDate) => {
  const timeStampDifference = Date.now() - new Date(birthDate).getTime();
  return Math.abs(new Date(timeStampDifference).getUTCFullYear() - 1970);
};

//this function will remove files based on theire name and directory
// exports.removeFile = (fileName, directory) => {};
