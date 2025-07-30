const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const asyncHandler = require("../middlewares/asyncHandler");
const { registerAdminSchema } = require("../validation/userValidation");

exports.createUserByAdmin = asyncHandler(async (req, res, next) => {
  const { error, value } = registerAdminSchema.validate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const { fullName, email, password, role } = value;

  if (!["admin", "Customer"].includes(role)) {
    return next(
      new AppError("Invalid role. Must be 'admin' or 'Customer'", 400)
    );
  }

  const emailExists = await User.findOne({ email });
  if (emailExists) return next(new AppError("Email already exists", 409));

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    fullName,
    email,
    password: hashedPassword,
    role,
    isEmailVerified: true,
  });

  res.status(201).json({
    status: "success",
    message: `New ${role} created`,
    user: {
      id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
    },
  });
});
