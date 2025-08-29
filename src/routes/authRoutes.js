const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate");
const { registerSchema } = require("../validation/userValidation");
const { loginSchema } = require("../validation/userValidation");

const authController = require("../controllers/authController");

//Register
router.post("/register", validate(registerSchema), authController.register);

//Verify OTP
router.post("/verify-otp", authController.verifyOtp);

//Resend OTP
router.post("/resend-otp", authController.resendOtp);

//Login
router.post("/login", validate(loginSchema), authController.login);

module.exports = router;
