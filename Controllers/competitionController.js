const sharp = require("sharp");
const multer = require("multer");
const { catchAsync, AppError } = require("./../utilities/errorHandler");
const competitionModel = require("./../Models/competitionModel");
const { removeFile } = require("./../utilities/appTools");

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      res
        .status(401)
        .redirect(
          "/user/adminpanel/competitionform?error=Competition logo must be an image"
        ),
      false
    );
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadCompetitionLogo = upload.single("file");
//----------
exports.resizeAndSaveCompImages = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
    // return res
    //   .status(401)
    //   .redirect(
    //     "/user/adminpanel/competitionform?error=Each competition must have a logo"
    //   );
  }
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

exports.createCompetition = catchAsync(async (req, res, next) => {
  await competitionModel.create(req.body);
  res.redirect(
    "/user/adminpanel/competitionform/?success=Competition has been created successfully"
  );
});

exports.getCompetitions = catchAsync(async (req, res, next) => {
  const competitions = await competitionModel.find();
  res.status(201).render("adminpanel_competitions", {
    title: "Comps",
    user: req.body.user,
    panel: "admin",
    page: "Competitions",
    competitions,
  });
});

exports.getCompetitionDetails = catchAsync(async (req, res, next) => {
  const competition = await competitionModel.findById(req.params.id);
  if (!competition) {
    return res.redirect(
      "/user/adminpanel/competitions?error=Invalid competition id!"
    );
  }
  res.status(201).render("adminpanel_E_competition", {
    title: "Edit comps",
    user: req.body.user,
    role: "admin",
    competition,
  });
});
exports.updateComp = catchAsync(async (req, res, next) => {
  const competition = await competitionModel.findById(req.params.id);

  if (!competition) {
    return res.redirect(
      "/user/adminpanel/competitions?error=Invalid competition id!"
    );
  }
  competition.name = req.body.name;
  competition.logo = req.body.logo || competition.logo;

  await competition.save();
  res.redirect(`/user/adminpanel/update/competitions/${competition._id}`);
});

exports.deleteComp = catchAsync(async (req, res, next) => {
  const competition = await competitionModel.findById(req.params.id);

  if (!competition) {
    return res.redirect(
      "/user/adminpanel/competitions?error=Invalid competition id!"
    );
  }
  await removeFile(`competitions/${competition.logo}`);
  await competitionModel.findByIdAndRemove(competition._id);
  res.redirect(
    `/user/adminpanel/competitions?success=${competition.name} has been deleted successfully!`
  );
});
