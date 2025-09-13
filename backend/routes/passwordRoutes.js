const express = require("express");
const router = express.Router();
const {
  sendForgotPasswordOtp,
  resetPassword
} = require("../controllers/passwordController");

const { otpLimiter } = require("../middleware/rateLimiter");

// STEP 1: Request OTP for password reset
router.post("/forgot/send-otp", otpLimiter, sendForgotPasswordOtp);

// STEP 2: Verify OTP and set new password
router.post("/forgot/verify-otp", resetPassword);

module.exports = router;
