const { catchAsync, appError } = require("../utilities/errorHandler");

//delete one document
exports.deleteOne = (collectionModel) => async (req, res, next) => {
  await collectionModel.findByIdAndDelete(req.params.id);
  //if document dosent exist it will throw an error to global error handler
  if (!doc) return next("the entered document does not exists!", 400);
  //if operation  was succeed, it will send this response
  res.json({ status: "success" });
};
//Insert a document
exports.insertOne = (collectionModel) => async (req, res, next) => {
  await collectionModel.create(req.body);
  res.json({ status: "success" });
};

//Update one document
exports.updateOne = (collectionModel) => async (req, res, next) => {
  await collectionModel.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
  });
  res.status(200).send("doc has been updated successfully!");
};
