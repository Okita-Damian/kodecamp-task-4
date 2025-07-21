const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    otp: {
      type: String,
      required: true,
    },
    otpToken: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true,
    },
    purpose: {
      type: String,
      enum: ["verify-email", "reset-password"],
      required: true,
    },
    expiresAt: {
      type: Date,
      default: () => Date.now() + 10 * 60 * 1000,
      expires: 0,
    },
  },
  { timestamps: true }
);

const otpModel = mongoose.model("otps", schema);

module.exports = otpModel;
