const express = require("express");
const router = express.Router();
const {
  sendEditProfileOtp,
  verifyEditProfileOtpAndUpdate
} = require("../controllers/profileEditController");

const authMiddleware = require("../middleware/authMiddleware"); // Protect routes

// Step 1: Request OTP to edit profile
router.post("/send-edit-otp", authMiddleware, sendEditProfileOtp);

// Step 2: Verify OTP and update profile
router.post("/verify-edit-otp", authMiddleware, verifyEditProfileOtpAndUpdate);

module.exports = router;
