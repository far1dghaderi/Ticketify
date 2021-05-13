const sharp = require("sharp");
const multer = require("multer");
const { catchAsync, AppError } = require("./../utilities/errorHandler");
const competitionModel = require("./../Models/competitionModel");
const cp = require("./couponController");
const couponModel = require("../Controllers/couponController");

//configuring multer for uploading images
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("uploaded file must be an image", 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadCompetitionLogo = upload.single("logo");
//----------
exports.resizeAndSaveCompImages = catchAsync(async (req, res, next) => {
  if (!req.file)
    return next(new AppError("each competitions must have a logo", 400));
  //generating teams logo name and saving it into the DB
  const competitionLogoFileName = `${Date.now()}-logo-${req.body.name.replace(
    " ",
    "-"
  )}.png`;

  await sharp(req.file.buffer)
    .toFormat("png")
    .resize(24, 24)
    .toFile(`static/images/competitions/${competitionLogoFileName}`);
  req.body.logo = competitionLogoFileName;
  next();
});

//Creating competitions
exports.createCompetition = catchAsync(async (req, res, next) => {
  await competitionModel.create(req.body);
  res.send("competition has been added to DB successfuly!");
});
