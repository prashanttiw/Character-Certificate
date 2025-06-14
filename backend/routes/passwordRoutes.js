const express = require("express");
const router = express.Router();
const {
  sendForgotPasswordOtp,
  resetPassword,
} = require("../controllers/passwordController");

const { otpLimiter } = require("../middleware/rateLimiter");

// Apply rate limiter to prevent abuse (especially OTP endpoint)
router.post("/forgot-password", otpLimiter, sendForgotPasswordOtp);
router.post("/reset-password", resetPassword); // Optional: you can also apply a limiter here

module.exports = router;
