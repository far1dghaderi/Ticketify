const multer = require("multer");
const sharp = require("sharp");
const teamModel = require("./../Models/teamModel");
const { catchAsync } = require("./../utilities/errorHandler");

//configuring multer for uploading images
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("uploaded file must be an image"), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadCompetitionLogo = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "bgImage", maxCount: 1 },
]);
//----------
exports.resizeAndSaveCompetitionImages = catchAsync(async (req, res, next) => {
  if (!req.files.logo || !req.files.bgImage)
    return next(new Error("each team must have a logo and a background image"));
  //generating teams logo name and saving it into the DB
  const teamLogoFileName = `${Date.now()}-logo-${req.body.teamName.replace(
    " ",
    "-"
  )}.png`;
  await sharp(req.files.logo[0].buffer)
    .resize(64, 64)
    .toFormat("png")
    .toFile(`static/images/teams/${teamLogoFileName}`);
  //generating teams BG image and saving it into the DB
  const teamBgFileName = `${Date.now()}-background-${req.body.teamName.replace(
    " ",
    "-"
  )}.jpeg`;
  await sharp(req.files.bgImage[0].buffer)
    .resize(64, 64)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .resize(600, 600)
    .toFile(`static/images/teams/${teamBgFileName}`);
  console.log(teamBgFileName, teamLogoFileName);
  req.body.bgImage = teamBgFileName;
  req.body.logo = teamLogoFileName;
  next();
});
exports.createTeam = catchAsync(async (req, res, next) => {
  await teamModel.create(req.body);
  res.send(req.body);
});
