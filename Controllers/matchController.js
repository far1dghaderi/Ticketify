const multer = require("multer");
const sharp = require("sharp");
const { promisify } = require("util");
const { catchAsync, AppError } = require("./../utilities/errorHandler");
// const QueryFeatures = require("./../utilities/queryFeatures");
const matchModel = require("./../Models/matchModel");
const teamModel = require("./../Models/teamModel");
const stadiumModel = require("./../Models/stadiumModel");
const compModel = require("./../Models/competitionModel");
const couponModel = require("./../Models/couponModel");

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
exports.uploadMatchLogo = upload.single("matchCover");
//----------
exports.resizeAndSaveCompImages = catchAsync(async (req, res, next) => {
  if (!req.file) {
    req.body.matchCover = `default-${req.body.matchType}.jpeg`;
    next();
  }
  //generating teams logo name and saving it into the DB
  const matchCoverFileName = `${Date.now()}-match-cover-${req.body.homeTeam.slice(
    0,
    6
  )}-${req.body.awayTeam.slice(0, 6)}.jpeg`;

  await sharp(req.file.buffer)
    .toFormat("jpeg")
    .resize(1280, 720)
    .toFile(`static/images/matches/${matchCoverFileName}`);
  req.body.matchCover = matchCoverFileName;
  next();
});

//Creating a match
exports.createMatch = catchAsync(async (req, res, next) => {
  //creating an instance of match model and consturcuring its keys
  let match = new matchModel({
    stadium: req.body.stadium,
    competition: req.body.competition,
    matchType: req.body.matchType,
    price: Number(req.body.price),
    matchDate: new Date(req.body.matchDate),
    visibleDate: new Date(req.body.visibleDate),
    startBuyDate: new Date(req.body.startBuyDate),
    endBuyDate: new Date(req.body.endBuyDate),
    matchCover: req.body.matchCover,
    tickets: [],
  });
  match.homeTeam.id = req.body.homeTeam;
  match.awayTeam.id = req.body.awayTeam;

  //check if there is any limitation for this match
  if (req.body.age) match.limitation.age = req.body.age;
  if (req.body.gender) match.limitation.gender = req.body.gender;

  //check if the home and away teams are not same
  if (String(req.body.homeTeam) == String(req.body.awayTeam)) {
    return next(new AppError("match teams could not be the same", 400));
  }
  //check if teams sport type is same with each other and then add required values to home and away team field in schema
  const homeTeam = await teamModel.findById(req.body.homeTeam);
  const awayTeam = await teamModel.findById(req.body.awayTeam);
  if (match.matchType != homeTeam.teamType) {
    return next(
      new AppError("match sport type must be same with teams sport type", 400)
    );
  }
  //set other home and away team values in  match schema
  match.homeTeam.name = homeTeam.teamName;
  match.homeTeam.logo = homeTeam.logo;
  match.awayTeam.name = awayTeam.teamName;
  match.awayTeam.logo = awayTeam.logo;

  //check if the stadium sport type is same with the match sport type
  const stadium = await stadiumModel.findById(req.body.stadium);

  if (stadium.stadiumType != match.matchType) {
    return next(
      new AppError("match sport type must be same with stadium sport type", 400)
    );
  }

  //check if the competition sport type is same with match sport type
  const comp = await compModel.findById(match.competition);
  if (comp.sport != match.matchType) {
    return next(
      new AppError("competition sport is not same with match type", 400)
    );
  }

  //set slug for the match
  let matchSlug = `${homeTeam.teamName}-${awayTeam.teamName}-${
    comp.name
  }-${match.matchDate.toDateString()}`
    .split(" ")
    .join("-");
  match.slug = matchSlug;
  await matchModel.create(match);
  res.send("match has been created successfully!");
});

//update a match
exports.updateMatch = catchAsync(async (req, res, next) => {
  //getting the match with the ID that the user pass via URL
  const match = await matchModel.findById(req.params.id);

  //check if the passed ID was correct or not
  if (!match) {
    return next(
      new AppError("there is no match with this ID, please pass a correct ID")
    );
  }
  //- stadium ID is not updatable after the process of match ticket selling has begin, because it can cause unwanted errors

  //check if the user wants to change the stadium
  if (req.body.stadium) {
    //User can only change the stadium before of beginning ticket selling for the match
    if (match.startBuyDate <= new Date()) {
      return next(
        new AppError(
          "you can`t change the matchs stadium after its ticket selling has been started!"
        )
      );
    }
    const stadium = await stadiumModel.findById(req.body.stadium);
    //check if the stadium id was correct!
    if (!stadium) return next(new AppError("stadium id was invalid!", 400));
    //Check if the stadium type is same with the match type
    if (stadium.stdaiumType != match.matchType) {
      return next(
        new AppError(
          "match sport type must be same with stadium sport type",
          400
        )
      );
    }
    match.stadium = req.body.stadium;
  }
  //set new price if it exists in the body
  if (req.body.price) match.price = req.body.price * 1;
  //set new competition if it exists in the body
  if (req.body.competition) match.competition = req.body.competition;
  //set new dates if they were exist in the body
  if (req.body.startBuyDate) match.startBuyDate = req.body.startBuyDate;
  if (req.body.matchDate) match.matchDate = req.body.matchDate;
  if (req.body.visibleDate) match.visibleDate = req.body.visibleDate;
  if (req.body.endBuyDate) match.endBuyDate = req.body.endBuyDate;
  if (req.body.slug) match.slug = req.body.slug;

  const coupon = await matchModel.findByIdAndUpdate(match.id, match, {
    runValidators: true,
  });
  return res.send("match has been updated successfully!");
});

//get matches
exports.getMatches = catchAsync(async (req, res, next) => {
  //set the first query and populate stadium field
  let matches = await matchModel
    .find({
      $and: [
        { visibleDate: { $lt: new Date() } },
        { endBuyDate: { $gt: new Date() } },
      ],
    })
    .populate({
      path: "stadium",
      select: "name country city stands capacity ",
    });
  res.json({ res: results.length, results });
});

//get One match
exports.getMatch = catchAsync(async (req, res, next) => {
  const match = await matchModel.findOne({ slug: req.params.id });
  if (!match) return next(new AppError("there is no match with this id!", 404));

  return res.json(match);
});
