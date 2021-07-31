const multer = require("multer");
const sharp = require("sharp");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const { catchAsync, AppError } = require("./../utilities/errorHandler");
// const QueryFeatures = require("./../utilities/queryFeatures");
const authController = require("./authController");
const matchModel = require("./../Models/matchModel");
const teamModel = require("./../Models/teamModel");
const stadiumModel = require("./../Models/stadiumModel");
const compModel = require("./../Models/competitionModel");
const userModel = require("./../Models/userModel");
const { findByIdAndUpdate } = require("./../Models/userModel");
const removeFile = require("./../utilities/appTools");

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
exports.uploadMatchLogo = upload.single("cover");
//----------
exports.resizeAndSaveCompImages = catchAsync(async (req, res, next) => {
  if (!req.file) {
    req.body.matchCover = `default-${req.body.matchType}.jpeg`;
    return next();
  } else {
    //generating teams logo name and saving it into the DB
    const matchCoverFileName = `${Date.now()}-match-cover-${req.body.homeTeam.slice(
      0,
      6
    )}-${req.body.awayTeam.slice(0, 6)}.jpeg`;

    await sharp(req.file.buffer)
      .toFormat("jpeg")
      .resize(1280, 720)
      .toFile(`static/images/matches/${matchCoverFileName}`);
    req.body.cover = matchCoverFileName;

    next();
  }
});

//Creating a match
exports.createMatch = catchAsync(async (req, res, next) => {
  //creating an instance of match model and consturcuring its keys
  let match = new matchModel({
    stadium: req.body.stadium,
    competition: req.body.competition,
    matchDate: new Date(req.body.matchDate),
    visibleDate: new Date(req.body.visibleDate),
    startBuyDate: new Date(req.body.startBuyDate),
    endBuyDate: new Date(req.body.endBuyDate),
    cover: req.body.cover,
    tickets: [],
  });
  match.homeTeam.id = req.body.homeTeam;
  match.awayTeam.id = req.body.awayTeam;

  //check if the home and away teams are same
  if (String(req.body.homeTeam) == String(req.body.awayTeam)) {
    return res.redirect(
      "/user/adminpanel/matchForm?error=match teams could not be the same"
    );
  }
  //check if teams sport type is same and then add required values to home and away team field in schema
  const homeTeam = await teamModel.findById(req.body.homeTeam);
  const awayTeam = await teamModel.findById(req.body.awayTeam);
  if (homeTeam.sport != awayTeam.sport) {
    return res.redirect(
      "/user/adminpanel/matchForm?error=Teams sport type must be the same"
    );
  }

  //set other home and away team values in  match schema
  match.homeTeam.name = homeTeam.name;
  match.homeTeam.logo = homeTeam.logo;
  match.awayTeam.name = awayTeam.name;
  match.awayTeam.logo = awayTeam.logo;

  //check if the stadium sport type is same with the Teams sport type
  const stadium = await stadiumModel.findById(req.body.stadium);

  if (stadium.sport != homeTeam.sport) {
    return res.redirect(
      "/user/adminpanel/matchForm?error=Teams sport type must be the same with the Stadium's sport"
    );
  }
  //check if the competition sport type is same with match sport type
  const comp = await compModel.findById(match.competition);

  match.fixture = comp.name + " - " + req.body.fixture;
  //set a slug for the match
  let matchSlug = `${homeTeam.name}-${awayTeam.name}-${
    comp.name
  }-${match.matchDate.toDateString()}-${new Date().getUTCMilliseconds()}`
    .split(" ")
    .join("-");
  match.slug = matchSlug;
  match.sport = stadium.sport;
  await matchModel.create(match);
  return res.redirect(
    "/user/adminpanel/matchForm?success=match has been created successfully!"
  );
});

//Get all matches
exports.getMatches = catchAsync(async (req, res, next) => {
  const matches = await matchModel.find();
  res.status(201).render("adminpanel_matches", {
    title: "Matches",
    user: req.body.user,
    panel: "admin",
    page: "Matches",
    matches,
  });
});
//update a match
exports.updateMatch = catchAsync(async (req, res, next) => {
  //getting the match with the ID that the user passed via URL
  const match = await matchModel.findById(req.params.id);
  //check if the passed ID was correct or not
  if (!match) {
    return res
      .status(403)
      .redirect("/user/adminpanel/matches?error=The match ID was incorrect");
  }

  //check if they changed at least one of teams
  if (
    match.homeTeam.id != req.body.homeTeam ||
    match.awayTeam.id != req.body.awayTeam
  ) {
    const homeTeam = await teamModel.findById(req.body.homeTeam);
    const awayTeam = await teamModel.findById(req.body.awayTeam);
    if (!homeTeam) {
      return res
        .status(403)
        .redirect(
          `/user/adminpanel/update/matches/${req.params.id}?error=Home team id was invalid!`
        );
    }
    if (!awayTeam) {
      return res
        .status(403)
        .redirect(
          `/user/adminpanel/update/matches/${req.params.id}?error=Away team id was invalid!`
        );
    }
    //compare teams sport type
    if (homeTeam.sport != awayTeam.sport) {
      return res
        .status(403)
        .redirect(
          `/user/adminpanel/update/matches/${req.params.id}?error=Teams sport must be the same!`
        );
    }
  }
  //- stadium ID is not updatable after the process of match ticket selling has begin.

  //check if the user wants to change the stadium
  if (req.body.stadium != match.stadium) {
    //User can only change the stadium before of ticket selling for the match has begin
    if (match.startBuyDate <= new Date()) {
      return res
        .status(403)
        .redirect(
          "/user/adminpanel/matches?error=you can't change the matchs stadium after its ticket selling has been started!"
        );
    }
    const stadium = await stadiumModel.findById(req.body.stadium);
    //check if the stadium id was correct!
    if (!stadium) {
      return res
        .status(403)
        .redirect("/user/adminpanel/matches?error=stadium id was invalid!");
    }

    match.stadium = req.body.stadium;
  }

  //set new competition if it exists in the body
  if (req.body.competition != match.competition) {
    const comp = await compModel.findById(req.body.competition);
    if (!comp) {
      return res
        .status(403)
        .redirect("/user/adminpanel/matches?error=Competition id was invalid!");
    }
    match.fixture.split("-")[0] = comp.name;
  }

  //check if user changes the fixture
  if (match.fixture.split("-")[1].trim() != req.body.fixture) {
    match.fixture =
      match.fixture.split("-")[0].trim() + " - " + req.body.fixture.trim();
  }
  //set new dates if they were exist in the body or use the previous dates

  match.startBuyDate = req.body.startBuyDate || match.startBuyDate;
  match.matchDate = req.body.matchDate || match.matchDate;
  match.visibleDate = req.body.visibleDate || match.visibleDate;
  match.endBuyDate = req.body.endBuyDate || match.endBuyDate;

  //check if the user changes the cover
  if (req.body.cover) {
    match.cover = req.body.cover;
  }
  const s = await match.save();
  return res.redirect(
    `/user/adminpanel/update/matches/${match._id}?success=match has been updated successfully!`
  );
});

//?get One match
exports.getMatch = catchAsync(async (req, res, next) => {
  const match = await matchModel
    .findOne({ slug: req.params.id })
    .populate({
      path: "stadium",
      select: "name country city province stands capacity address image ",
    })
    .populate({ path: "competition", select: "logo" });
  //check if the match exists
  if (!match) {
    return res.status(404).redirect("/?there is no match with this id!");
  }

  //check if the match is visible to the users
  if (match.visibleDate > new Date()) {
    return res
      .status("403")
      .redirect("/?error='You don`t have access to reach this page'");
  }
  //check if there is a remaining time to buy tickets for the match
  if (match.endBuyDate < new Date()) {
    return res
      .status("403")
      .redirect(
        "/?error='There is no time left for buying ticket for this match"
      );
  }
  //get number of floors
  let floors = [];
  match.stadium.stands.forEach((stand) => {
    if (!floors.includes(stand.floor)) floors.push(stand.floor);
  });
  floors = floors.sort();
  //get stands for each floor
  let stands = { west: [], east: [], north: [], south: [] }; //* { id: "f", location: "s", price: "125", floor: "1" }

  //dividing stands by theire stand location
  match.stadium.stands.forEach((stand) => {
    if (stand.availablity) {
      let currentStand = {
        id: stand.id,
        location: stand.location,
        price: stand.price,
        floor: stand.floor,
        capacity: stand.capacity,
      };
      //check stand capacity
      //- West stands
      stands.west.forEach((stand) => {
        match.tickets.forEach((ticket) => {
          if (stand.id == ticket.stand) {
            stand.capacity -= 1;
          }
        });
      });
      //- East stands
      stands.east.forEach((stand) => {
        match.tickets.forEach((ticket) => {
          if (stand.id == ticket.stand) {
            stand.capacity -= 1;
          }
        });
      });
      //-North stands
      stands.north.forEach((stand) => {
        match.tickets.forEach((ticket) => {
          if (stand.id == ticket.stand) {
            stand.capacity -= 1;
          }
        });
      });
      //- South Stands
      stands.south.forEach((stand) => {
        match.tickets.forEach((ticket) => {
          if (stand.id == ticket.stand) {
            stand.capacity -= 1;
          }
        });
      });
      //Adding stands to theire stand location
      if (stand.location === "west") stands.west.push(currentStand);
      else if (stand.location === "east") stands.east.push(currentStand);
      else if (stand.location === "north") stands.north.push(currentStand);
      else if (stand.location === "south") stands.south.push(currentStand);
    }
  });
  //deleting null stands
  Object.keys(stands).forEach((key) => {
    if (stands[key].length == 0) delete stands[key];
  });
  //if match ticket selling hasn't been started
  if (match.startBuyDate > new Date()) status = "notStarted";
  //if the matchs ticket selling has been started
  else if (match.startBuyDate < new Date()) status = "started";
  // return res.send(floors);
  res.status(201).render("match", {
    title: "match",
    match,
    floors,
    stands,
    status,
    user: req.body.user,
  });
});

//get match Details for editing
exports.getMatchDetails = catchAsync(async (req, res, next) => {
  const match = await matchModel.findById(req.params.id);
  res.render("adminpanel_E_match", {
    title: "Edit match",
    user: req.user,
    role: "admin",
    error: req.query.error,
    success: req.query.success,
    match,
  });
});

//delete match
//* if the match has at least one sold ticket, instead of deleting it will be hide for preventing any loss of data

exports.deleteMatch = catchAsync(async (req, res, next) => {
  const match = await matchModel.findById(req.params.id);

  if (!match) {
    return res.redirect(`/user/adminpanel/matches?success=Invalid match ID!`);
  }
  //check if the match has any sold tickets
  // if it does, it will be hidden
  // if it dosen't, it will be fully removed from the DB
  if (match.tickets.length < 1 || !match.ticekts) {
    await removeFile(`matches/${match.cover}`);
    await await matchModel.findByIdAndRemove(match._id);
    return res.redirect(
      `/user/adminpanel/matches?success=match has been removed successfully!`
    );
  } else {
    match.isDisabled = true;
    await matchModel.findByIdAndUpdate(match._id, match);
    return res.redirect(
      `/user/adminpanel/matches?success=match has been hidded successfully!`
    );
  }
});
