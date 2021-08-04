const multer = require("multer");
const sharp = require("sharp");
const userModel = require("../Models/userModel");
const stadiumModel = require("./../Models/stadiumModel");
const matchModel = require("./../Models/matchModel");
const { catchAsync, AppError } = require("./../utilities/errorHandler");
const { removeFile } = require("./../utilities/appTools");

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
exports.uploadStadiumImg = upload.single("bgImage");

exports.resizeAndSaveStadiumImg = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  //generating teams logo name for saving it into the DB
  const stadiumImgName = `${Date.now()}-background-${req.body.name.replace(
    " ",
    "-"
  )}.png`;
  await sharp(req.file.buffer)
    .toFormat("jpg")
    .toFile(`static/images/stadiums/${stadiumImgName}`);
  req.body.image = stadiumImgName;

  next();
});

exports.createStadium = catchAsync(async (req, res, next) => {
  let stadium = new stadiumModel({
    name: req.body.name,
    sport: req.body.sport,
    country: req.body.country,
    province: req.body.province,
    city: req.body.city,
    address: req.body.address,
    image: req.body.image,
  });
  //generating stands and adding them to the model
  stadium.stands = stadium.createStands(req.body);
  //check if there is any stands with same ID
  //TODO

  stadiumModel.create(stadium);

  res
    .status(201)
    .redirect(
      `/user/adminpanel/stadiumForm?success=${stadium.name} has been added to DB successfully`
    );
});

exports.updateStadium = catchAsync(async (req, res, next) => {
  let stadium = new stadiumModel();
  stadium = await stadiumModel.findById(req.params.id);

  if (!stadium) {
    return res.redirect(
      "/user/adminpanel/stadiums?error=Stadium id was invalid!"
    );
  }

  stadium.name = req.body.name;
  stadium.sport = req.body.sport;
  stadium.country = req.body.country;
  stadium.image = req.body.image || stadium.image;
  stadium.city = req.body.city;
  stadium.address = req.body.address;
  stadium.stands = stadium.createStands(req.body);

  //get the matches that are associated with the stadium and check if theire ticket selling has begins
  //it's better that we preve t updates on this stadiums, but for no: NEVER MIND;
  // const matches = await matchModel.find({
  //   $and: [{ stadium: req.params.id }, { startBuyDate: { $gt: new Date() } }],
  // });

  await stadiumModel.findByIdAndUpdate(req.params.id, stadium);
  res.redirect(
    `/user/adminpanel/update/stadiums/${req.params.id}?success=Stadium has been updated successfully`
  );
});

exports.getStadiumDetails = catchAsync(async (req, res, next) => {
  const stadium = await stadiumModel.findById(req.params.id);
  if (!stadium) {
    return res.redirect(
      "/user/adminpanel/stadiums?error=Stadium id was invalid!"
    );
  }

  res.render("adminpanel_E_stadium", {
    title: "Edit stadium",
    user: req.user,
    stadium,
    error: req.query.error,
    success: req.query.success,
  });
});
exports.getStadiums = catchAsync(async (req, res, next) => {
  const stadiums = await stadiumModel.find();
  res.status(201).render("adminpanel_stadiums", {
    title: "Stadiums",
    user: req.body.user,
    panel: "admin",
    page: "Stadiums",
    stadiums,
  });
});

exports.deleteStadium = catchAsync(async (req, res, next) => {
  const stadium = await stadiumModel.findById(req.params.id);
  if (!stadium) {
    return res.redirect(
      "/user/adminpanel/stadiums?error=Stadium id was invalid!"
    );
  }
  //check if there is any match associated with this stadium and it's ticket selling process hasn't finished yet
  //if there was any, we won't let the user to delete the stadium
  const matches = await matchModel.find({
    $and: [{ stadium: stadium._id }, { endBuyDate: { $gt: new Date() } }],
  });

  if (0 < matches.length) {
    return res.redirect(
      "/user/adminpanel/stadiums?error=You can't delete a stadium while it's associated with an active match"
    );
  }
  await removeFile(`stadiums/${stadium.image}`);
  await stadiumModel.findByIdAndDelete(stadium._id);

  res.redirect(
    "/user/adminpanel/stadiums?success=Stadium has been deleted successfully!"
  );
});
