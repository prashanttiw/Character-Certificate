const express = require("express");
const router = express.Router();

const  authController  = require('../controllers/auth.controller');
const { otpLimiter } = require("../middleware/rateLimiter");


// STEP 1: Start registration and send OTP
router.post('/register/start', otpLimiter, authController.startRegistration);
router.post('/register/send-otp', otpLimiter, authController.startRegistration);

// STEP 2: Verify OTP and create the student account
router.post('/register/verify',authController.verifyRegistration);
router.post('/register/verify-otp',authController.verifyRegistration);

// @route   POST /api/auth/login

router.post('/login', authController.login);

module.exports = router;
