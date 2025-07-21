const crypto = require("crypto");

const generateOTP = (length = 10) => {
  const otp = crypto.randomInt(0, 10 ** length).toString();
  return otp.padStart(length, "0");
};

module.exports = generateOTP;
