// backend/controllers/auth.controller.js

const jwt = require("jsonwebtoken");
const Student = require('../models/Student.model'); 
const sendEmail = require("../utils/sendEmail");
const loginAlertTemplate = require("../utils/emailTemplates/loginAlertTemplate");
const registrationOtpTemplate = require("../utils/emailTemplates/registrationOtpTemplate"); // Added this missing import
const { comparePassword } = require("../utils/hashUtils");
const { decryptField } = require("../utils/encryptionUtils");
const { saveOtpData, verifyOtpAndGetData } = require('../services/redis.service');

/**
 * @description   Step 1: Get user details and send OTP for registration
 * @route         POST /api/auth/register/start
 * @access        Public
 */
const startRegistration = async (req, res) => {
  try {
    const { name, email, rollNo, mobile, password } = req.body;

    // Check if a student with this email or roll number already exists in the database
    const existingStudent = await Student.findOne({ $or: [{ email }, { rollNo }] });
    if (existingStudent) {
      return res.status(409).json({ message: "A user with this email or roll number already exists." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Temporarily save user data and OTP to Redis with a 10-minute expiration
    await saveOtpData(email, otp, { name, email, rollNo, mobile, password });

    // Send the OTP to the student's email
    const html = registrationOtpTemplate(name, otp);
    await sendEmail({ to: email, subject: "Verify Your Email for GBU Certificate Portal", html });

    return res.status(200).json({ message: "OTP has been sent to your email." });

  } catch (err) {
    console.error("Error in startRegistration:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @description   Step 2: Verify OTP and create the student account
 * @route         POST /api/auth/register/verify
 * @access        Public
 */
const verifyRegistration = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // This single function securely checks Redis for a matching and valid OTP
    const tempUserData = await verifyOtpAndGetData(email, otp);

    if (!tempUserData) {
      return res.status(400).json({ message: "Invalid or expired OTP. Please try registering again." });
    }

    const student = new Student({
      name: tempUserData.name,
      rollNo: tempUserData.rollNo,
      email: tempUserData.email,
      mobile: tempUserData.mobile,
      password: tempUserData.password,
      isVerified: true
    });
    
    await student.save();

    return res.status(201).json({ message: "Registration successful! You can now log in." });

  } catch (err) {
    console.error("Error in verifyRegistration:", err);
    if (err.code === 11000) {
      return res.status(409).json({ message: "A user with this email or roll number already exists." });
    }
    return res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @description   Login a student
 * @route         POST /api/auth/login
 * @access        Public
 */
const login = async (req, res) => {
  try {
    const { emailOrRollNo, password } = req.body;

    const student = await Student.findOne({
      $or: [
        { rollNo: emailOrRollNo.toUpperCase() },
        { email: emailOrRollNo.toLowerCase() }
      ]
    });

    if (!student || !(await comparePassword(password, student.password))) {
      return res.status(401).json({ message: "Invalid credentials. Please check your email/roll number and password." });
    }
    
    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    const loginTime = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const loginHtml = loginAlertTemplate(student.name, loginTime);

    // We send the email but don't wait for it to finish, so the user gets a faster login response
    sendEmail({
      to: student.email,
      subject: "Security Alert: New Login to Your Account",
      html: loginHtml
    }).catch(err => console.error("Failed to send login alert email:", err));

    return res.status(200).json({
      message: "Login successful",
      token,
      student: {
        id: student._id,
        studentId: student.studentId,
        name: student.name,
        rollNo: student.rollNo
      }
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};


module.exports = {
  startRegistration,
  verifyRegistration,
  login,
};