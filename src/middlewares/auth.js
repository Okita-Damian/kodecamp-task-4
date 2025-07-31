// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const asyncHandler = require("../middlewares/asyncHandler");

exports.authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return next(new AppError("Not logged in", 401));

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_KEY);

  const user = await User.findById(decoded.userId);
  if (!user) return next(new AppError("customer not found", 401));

  req.user = user;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};
