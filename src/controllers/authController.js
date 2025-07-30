const { registerSchema, loginSchema } = require("../validation/userValidation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");

const User = require("../models/userModel");
const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");
const asyncHandler = require("../middlewares/asyncHandler");
const otpModel = require("../models/otpModel");

// ========== REGISTER ==========
exports.register = asyncHandler(async (req, res, next) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const emailExists = await User.findOne({ email: value.email });
  if (emailExists) return next(new AppError("Email already exists", 409));

  const hashedPassword = await bcrypt.hash(value.password, 10);
  const isFirstUser = (await User.countDocuments()) === 0;

  const newUser = await User.create({
    fullName: value.fullName,
    email: value.email,
    password: hashedPassword,
    role: isFirstUser ? "admin" : "Customer",
  });

  const otp = generateOTP();

  const hashedOTP = await bcrypt.hash(String(otp), 10);

  await otpModel.create({
    otp: hashedOTP,
    userId: newUser._id,
    purpose: "verify-email",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendEmail({
    from: process.env.EMAIL_USERNAME,
    to: value.email,
    subject: "Verify your email",
    html: `<div>
             <h1>Verify Email</h1>
             <p>Your OTP is: <strong>${otp}</strong></p>
           </div>`,
  });

  res.status(201).json({
    status: "success",
    message: "Customer created. OTP sent to email.",
  });
});

// ========== VERIFY OTP ==========
exports.verifyOtp = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new AppError("Email and OTP are required", 400));
  }

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("Customer not found", 404));

  const otpDetails = await otpModel.findOne({
    userId: user._id,
    purpose: "verify-email",
  });

  if (!otpDetails || otpDetails.expiresAt < Date.now()) {
    return next(new AppError("Invalid or expired OTP", 400));
  }

  const isMatch = await bcrypt.compare(String(otp), otpDetails.otp);
  if (!isMatch) return next(new AppError("Invalid OTP", 400));

  await User.findByIdAndUpdate(user._id, {
    isEmailVerified: true,
  });

  await otpModel.deleteOne({ _id: otpDetails._id });

  res.json({
    status: "success",
    message: " Customer email verified successfully.",
  });
});

// ========== RESEND OTP ==========
exports.resendOtp = asyncHandler(async (req, res, next) => {
  const { email, purpose } = req.body;

  if (!email || !purpose) {
    return next(new AppError("Email and purpose are required", 400));
  }

  const normalizedPurpose = purpose.toLowerCase();
  if (!["verify-email", "reset-password"].includes(normalizedPurpose)) {
    return next(new AppError("Invalid OTP purpose", 400));
  }

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("Customer not found", 404));

  if (normalizedPurpose === "verify-email" && user.isEmailVerified) {
    return next(new AppError("Email is already verified", 400));
  }

  const existingOtp = await otpModel.findOne({
    userId: user._id,
    purpose: normalizedPurpose,
  });

  if (existingOtp) {
    const now = Date.now();
    const createdAt = new Date(existingOtp.createdAt).getTime();
    const timeSinceLastOtp = (now - createdAt) / 1000;

    if (timeSinceLastOtp < 30) {
      return next(
        new AppError(
          `Please wait ${Math.ceil(
            30 - timeSinceLastOtp
          )}s before requesting another OTP.`
        )
      );
    }
    await otpModel.deleteOne({ _id: existingOtp._id });
  }

  const otp = generateOTP();
  if (process.env.NODE_ENV !== "production") {
    //console.log("OTP:", otp);
  }

  const hashedOTP = await bcrypt.hash(String(otp), 10);

  await otpModel.create({
    otp: hashedOTP,
    userId: user._id,
    purpose: normalizedPurpose,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendEmail({
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "Your new OTP",
    html: `<div>
             <h1>Your New OTP</h1>
             <p>Your new OTP is: <strong>${otp}</strong></p>
           </div>`,
  });

  res.status(200).json({
    status: "success",
    message: "Customer OTP sent to email successfully.",
  });
});

// ========== LOGIN ==========
exports.login = asyncHandler(async (req, res, next) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const { email, password } = value;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  if (!user.isEmailVerified) {
    return next(new AppError("Please verify your email first", 403));
  }

  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_KEY,
    { expiresIn: "2h" }
  );

  res.status(200).json({
    status: "success",
    message: "Login successful",
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  });
});
