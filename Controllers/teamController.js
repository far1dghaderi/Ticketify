const multer = require("multer");
const sharp = require("sharp");
const teamModel = require("./../Models/teamModel");
const { catchAsync } = require("./../utilities/errorHandler");
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
exports.uploadCompetitionLogo = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "bgImage", maxCount: 1 },
]);

exports.resizeAndSaveCompetitionImages = catchAsync(async (req, res, next) => {
  if (!req.files.logo && !req.files.bgImage) return next();
  if (req.files.bgImage) {
    //generating teams BG image for saving it into the DB
    const teamBgFileName = `${Date.now()}-background-${req.body.name.replace(
      " ",
      "-"
    )}.jpeg`;
    await sharp(req.files.bgImage[0].buffer)
      .resize(64, 64)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .resize(600, 600)
      .toFile(`static/images/teams/${teamBgFileName}`);

    req.body.bgImage = teamBgFileName;
  }
  if (req.files.logo) {
    //generating teams logo name for saving it into the DB
    const teamLogoFileName = `${Date.now()}-logo-${req.body.name.replace(
      " ",
      "-"
    )}.png`;
    await sharp(req.files.logo[0].buffer)
      .resize(64, 64)
      .toFormat("png")
      .toFile(`static/images/teams/${teamLogoFileName}`);
    req.body.logo = teamLogoFileName;
  }
  next();
});

exports.getTeams = catchAsync(async (req, res, next) => {
  const teams = await teamModel.find();
  res.status(201).render("adminpanel_teams", {
    title: "Teams",
    user: req.body.user,
    panel: "admin",
    page: "Teams",
    teams,
    error: req.query.error,
    success: req.query.success,
  });
});

exports.createTeam = catchAsync(async (req, res, next) => {
  await teamModel.create(req.body);
  return res.redirect(
    `/user/adminpanel/teamForm?success=${req.body.name} has been added successfully!`
  );
});

exports.getTeamDetails = catchAsync(async (req, res, next) => {
  const team = await teamModel.findById(req.params.id);
  if (!team)
    return res.redirect("/user/adminpanel/teams?error=Invalid team id!");

  return res.render("adminpanel_E_team", {
    title: "Edit team",
    user: req.user,
    role: "admin",
    error: req.query.error,
    success: req.query.success,
    team,
  });
});

exports.updateTeam = catchAsync(async (req, res, next) => {
  const team = await teamModel.findById(req.params.id);
  if (!team)
    return res.redirect("/user/adminpanel/teams?error=Invalid team id!");
  team.name = req.body.name;
  team.sport = req.body.sport;
  team.logo = req.body.logo || team.logo;
  team.bgImage = req.body.bgImage || team.bgImage;

  await team.save();

  return res.redirect(`/user/adminpanel/update/teams/${team._id}`);
});

exports.deleteTeam = catchAsync(async (req, res, next) => {
  const team = await teamModel.findById(req.params.id);

  if (!team) {
    return res
      .status(404)
      .redirect("/user/adminpanel/teams?error=ID was invalid!");
  }
  await removeFile(`teams/${team.logo}`);
  await removeFile(`teams/${team.bgImage}`);
  await teamModel.findByIdAndDelete(team._id);
  return res
    .status(200)
    .redirect(
      "/user/adminpanel/teams?success=Selected team has been deleted successfully!"
    );
});
