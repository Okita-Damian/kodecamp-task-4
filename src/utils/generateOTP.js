const crypto = require("crypto");

const generateOTP = (length = 10) => {
  if (process.env.NODE_ENV !== "production") {
    return process.env.FIXED_TEST_OTP || "123456";
  }
  const otp = crypto.randomInt(0, 10 ** length).toString();
  return otp.padStart(length, "0");
};

module.exports = generateOTP;
