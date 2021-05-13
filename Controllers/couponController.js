const couponModel = require("./../Models/couponModel");
const { catchAsync, AppError } = require("./../utilities/errorHandler");

//create a new coupon
exports.createCoupon = catchAsync(async (req, res, next) => {
  //set null values to undefined
  Object.keys(req.body).forEach((key) => {
    if (req.body[key] === null || req.body[key] === "0" || req.body[key] === "")
      req.body[key] = undefined;
  });
  const coupon = new couponModel(req.body);
  coupon.price.lowerThan = req.body.lowerThan;
  coupon.price.equalTo = req.body.equalTo;
  coupon.price.higherThan = req.body.higherThan;
  coupon.matchDate.exactDate = req.body.exactDate;
  coupon.matchDate.startDate = req.body.startDate;
  coupon.matchDate.endDate = req.body.endDate;

  await couponModel.create(coupon);
  res.send(coupon);
});

//Applying a coupon to a ticket
exports.applyCoupon = catchAsync(async (req, res, next) => {
  //checking if the coupon code is correct or not
  const coupon = await couponModel.findOne({ code: req.body.couponCode });
  if (!coupon) return next(new AppError("there is no coupun with this code"));
  res.send("holaa");
});
