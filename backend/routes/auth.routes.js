const express = require("express");
const router = express.Router();

const  authController  = require('../controllers/auth.controller');


// STEP 1: Start registration and send OTP
router.post('/register/start',authController.startRegistration);

// STEP 2: Verify OTP and create the student account
router.post('/register/verify',authController.verifyRegistration);

// @route   POST /api/auth/login

router.post('/login', authController.login);

module.exports = router;
