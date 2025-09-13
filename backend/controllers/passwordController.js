const Student = require("../models/Student");
const sendEmail = require("../utils/sendEmail");
const generateResetOTPTemplate = require("../utils/emailTemplates/resetOtpTemplate");
const passwordChangedTemplate = require("../utils/emailTemplates/passwordChangedTemplate");
const { hashPassword } = require("../utils/hashUtils");
const {
  saveOtpData,
  getOtpData,
  verifyOtp,
  clearOtpData,
  isOtpExpired
} = require("../utils/otpStore");

// 1. Request OTP for Forgot Password
const sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const encryptedEmail = encryptField(email);
const student = await Student.findOne({ email: encryptedEmail });

    if (!student) return res.status(404).json({ message: "No student found with this email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP only in memory, not DB
    saveOtpData(email, otp, { purpose: "reset-password" });

    const html = generateResetOTPTemplate(student.name, otp);
    await sendEmail({
      to: email,
      subject: "OTP to Reset Your Password",
      html,
    });

    return res.status(200).json({ message: "OTP sent to your email" });

  } catch (err) {
    console.error("Error in sendForgotPasswordOtp:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 2. Verify OTP and Set New Password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and New Password are required" });
    }

    if (isOtpExpired(email)) {
      clearOtpData(email);
      return res.status(410).json({ message: "OTP expired. Please request again." });
    }

    if (!verifyOtp(email, otp)) {
      return res.status(401).json({ message: "Invalid OTP. Try again." });
    }

    const encryptedEmail = encryptField(email);
const student = await Student.findOne({ email: encryptedEmail });

    if (!student) return res.status(404).json({ message: "Student not found" });

    const hashedPassword = await hashPassword(newPassword);
    student.password = hashedPassword;
    await student.save();

    clearOtpData(email);

    const html = passwordChangedTemplate(student.name);
    await sendEmail({
      to: email,
      subject: "Password Successfully Changed",
      html,
    });

    return res.status(200).json({ message: "Password reset successful" });

  } catch (err) {
    console.error("Error in resetPassword:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  sendForgotPasswordOtp,
  resetPassword
};
