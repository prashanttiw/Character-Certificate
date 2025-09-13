const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const sendEmail = require("../utils/sendEmail");
const loginAlertTemplate = require("../utils/emailTemplates/loginAlertTemplate");
const registrationOtpTemplate = require("../utils/emailTemplates/registrationOtpTemplate");
const forgotPasswordTemplate = require("../utils/emailTemplates/forgotPasswordTemplate");

const { saveOtpData, getOtpData, verifyOtp, clearOtpData, isOtpExpired } = require("../utils/otpStore");
const { comparePassword, hashPassword } = require("../utils/hashUtils");
const { encryptField, decryptField } = require("../utils/encryptionUtils");

// 🔹 Send Registration OTP and Store User Data Temporarily
const sendRegistrationOtp = async (req, res) => {
  try {
     console.log("Request Body:", req.body);
    const { name, email, rollNo, mobile, password } = req.body;

    const encryptedEmail = encryptField(email);
    const existing = await Student.findOne({ email: encryptedEmail });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    saveOtpData(email, otp, { name, email, rollNo, mobile, password });

    const html = registrationOtpTemplate(name, otp);
    await sendEmail({
      to: email,
      subject: "OTP for Character Certificate Registration",
      html
    });

    return res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("Error in sendRegistrationOtp:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// 🔹 Verify OTP and Register User in Database
const verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (isOtpExpired(email)) {
      clearOtpData(email);
      return res.status(410).json({ message: "OTP expired. Please request again." });
    }

    if (!verifyOtp(email, otp)) {
      return res.status(401).json({ message: "Incorrect OTP. Please try again." });
    }

    const record = getOtpData(email);
    if (!record) {
      return res.status(404).json({ message: "OTP session not found. Please re-register." });
    }

    const { name, rollNo, mobile, password } = record.data;
    const encryptedEmail = encryptField(email);
    const encryptedMobile = encryptField(mobile);

    const student = new Student({
      name,
      email: encryptedEmail,
      rollNo,
      mobile: encryptedMobile,
      password,
      isVerified: true
    });

    await student.save();
    clearOtpData(email);

    console.log("✅ Student saved to DB:", email);
    return res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    console.error("Error in verifyRegistrationOtp:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// 🔹 Login
const login = async (req, res) => {
  try {
    const { emailOrRollNo, password } = req.body;

    if (!emailOrRollNo || !password) {
      return res.status(400).json({ message: "Email/Roll No and Password are required" });
    }

    const encryptedInput = encryptField(emailOrRollNo.trim());
    const student = await Student.findOne({
      $or: [
        { email: encryptedInput },
        { rollNo: emailOrRollNo.trim() }
      ]
    });

    if (!student) {
      return res.status(404).json({ message: "No student found with given Email or Roll No" });
    }

    const isMatch = await comparePassword(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    if (!student.isVerified) {
      return res.status(403).json({ message: "Please verify your email first using OTP" });
    }

    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    const loginTime = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const loginHtml = loginAlertTemplate(student.name, loginTime);

    await sendEmail({
      to: decryptField(student.email),
      subject: "Login Alert: Your account was accessed",
      html: loginHtml
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      student: {
        id: student._id,
        name: student.name,
        rollNo: student.rollNo,
        email: decryptField(student.email),
        isVerified: student.isVerified
      }
    });

  } catch (err) {
    console.error("Error in Login:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// 🔹 Forgot Password – Step 1: Send OTP
const sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const encryptedEmail = encryptField(email);
    const student = await Student.findOne({ email: encryptedEmail });

    if (!student) return res.status(404).json({ message: "No student found with that email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    saveOtpData(email, otp, { email });

    const html = forgotPasswordTemplate(student.name, otp);
    await sendEmail({
      to: email,
      subject: "OTP for Password Reset - Character Certificate System",
      html
    });

    return res.status(200).json({ message: "OTP sent for password reset" });
  } catch (err) {
    console.error("Error in sendForgotPasswordOtp:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// 🔹 Forgot Password – Step 2: Verify OTP and Reset Password
const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (isOtpExpired(email)) {
      clearOtpData(email);
      return res.status(410).json({ message: "OTP expired. Please request again." });
    }

    if (!verifyOtp(email, otp)) {
      return res.status(401).json({ message: "Incorrect OTP. Please try again." });
    }

    const encryptedEmail = encryptField(email);
    const hashedPassword = await hashPassword(newPassword);

    const student = await Student.findOneAndUpdate(
      { email: encryptedEmail },
      { password: hashedPassword },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "User not found for password reset." });
    }

    clearOtpData(email);
    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Error in verifyForgotPasswordOtp:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

module.exports = {
  sendRegistrationOtp,
  verifyRegistrationOtp,
  login,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp
};
