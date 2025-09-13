const express = require("express");
const router = express.Router();

const {
  sendRegistrationOtp,
  verifyRegistrationOtp,
  login,
   sendForgotPasswordOtp,      
  verifyForgotPasswordOtp 
} = require("../controllers/authcontroller");

// STEP 1: Send OTP (Temporarily stores data in memory)
router.post("/register/send-otp", sendRegistrationOtp);

// STEP 2: Verify OTP (Saves user to DB after validation)
router.post("/register/verify-otp", verifyRegistrationOtp);

// Login Route
router.post("/login",  login);

router.post("/forgot-password/send-otp", sendForgotPasswordOtp);

router.post("/forgot-password/verify-otp", verifyForgotPasswordOtp);


module.exports = router;
