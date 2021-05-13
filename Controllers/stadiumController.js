const userModel = require("../Models/userModel");
const stadiumModel = require("./../Models/stadiumModel");
const matchModel = require("./../Models/matchModel");
const { catchAsync, AppError } = require("./../utilities/errorHandler");

//create a new stadium
exports.createStadium = catchAsync(async (req, res, next) => {
  //passing values to stadium model
  let stadium = new stadiumModel({
    name: req.body.name,
    stadiumType: req.body.stadiumType,
    entrances: req.body.entrances,
    country: req.body.country,
    province: req.body.province,
    city: req.body.city,
    address: req.body.address,
  });
  //generating stands and adding them to the model
  let stands = [];
  //check if there is any stands with same ID
  //if user only define one stand, then this part of code will run
  if (typeof req.body.stands === "string") {
    stands.push(stadium.createStand(req.body.stands));
    //if user only define more than one stand, then this part of code will run
  } else {
    req.body.stands.forEach((stand) => {
      stands.push(stadium.createStand(stand));
    });
    //check for stands with same id
    if (stadium.checkStands(req.body.stands))
      return res.send("stands id must be unique");
  }
  stadium.stands = stands;

  //checking  entrances
  if (!stadium.checkEntrances(stadium, stands)) {
    return res.send("stand entrances must exist in stadium entrances");
  }

  stadiumModel.create(stadium);
  res.send(stadium);
});

//updating a stadium
//-NOTE: you cant update stadiums when they are associated with a match that it`s ticket selling begins
exports.updateStadium = catchAsync(async (req, res, next) => {
  //get the stadium that user wants to update and check if it was exists
  let stadium = new stadiumModel();
  stadium = await stadiumModel.findById(req.params.id);
  if (!stadium) {
    return next(
      new AppError(
        "there is no stadium with this ID, please enter a correct one",
        400
      )
    );
  }
  //get the matches that are associated with the stadium and check if theire ticket selling has begins
  const matches = await matchModel.find({ stadium: req.params.id });
  if (matches) {
    //if it was a match with active ticket selling, we will return an error to prevent changing stadium properties
    matches.forEach((match) => {
      if (
        new Date(match.startBuyDate) < new Date() &&
        new Date() < new Date(match.endBuyDate)
      ) {
        return next(
          new AppError(
            "you cant change this stadium properties, its associated with a match with active ticket selling",
            400
          )
        );
      }
    });
    //generating stands and adding them to the model
    let stands = [];
    //if user only define one stand, then this part of code will run
    if (typeof req.body.stands === "string") {
      stands.push(stadium.createStand(req.body.stands));
    } else {
      req.body.stands.forEach((stand) => {
        stands.push(stadium.createStand(stand));
      });
      //check for stands with same id
      if (stadium.checkStands(req.body.stands))
        return res.send("stands id must be unique");
    }
    stadium.stands = stands;
    //checking  entrances
    if (!stadium.checkEntrances(stadium, stands)) {
      return res.send("stand entrances must exist in stadium entrances");
    }
    await stadiumModel.findByIdAndUpdate(req.params.id, stadium);
    res.send("stadium has been updated successfully!");
  } else {
    return res.send(matches);
  }
});
