const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

//Register
router.post("/register", authController.register);

//Verify OTP
router.post("/verify-otp", authController.verifyOtp);

//Resend OTP
router.post("/resend-otp", authController.resendOtp);

//Login
router.post("/login", authController.login);

module.exports = router;
