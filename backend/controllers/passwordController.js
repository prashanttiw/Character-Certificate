const Student = require("../models/Student");
const sendEmail = require("../utils/sendEmail");
const generateResetOTPTemplate = require("../utils/emailTemplates/resetOtpTemplate");
const passwordChangedTemplate = require("../utils/emailTemplates/passwordChangedTemplate");
const { encryptField } = require("../utils/encryptionUtils");
const {
  saveOtpData,
  verifyOtpAndGetData,
} = require("../services/redis.service");
const { createActivityLog } = require("../services/activityLog.service");

const FORGOT_PASSWORD_OTP_PURPOSE = "forgot-password";

const findStudentByEmail = async (email) => {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) return null;

  const rawStudent = await Student.collection.findOne({
    email: encryptField(normalizedEmail)
  });

  return rawStudent ? Student.hydrate(rawStudent) : null;
};

// 1. Request OTP for Forgot Password
const sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const student = await findStudentByEmail(email);

    if (!student)
      return res
        .status(404)
        .json({ message: "No student found with this email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP only in memory, not DB
    const otpSaveResult = await saveOtpData(FORGOT_PASSWORD_OTP_PURPOSE, email, otp, {
      purpose: "reset-password",
    });

    if (!otpSaveResult.isStored) {
      return res.status(429).json({
        message: `Please wait ${otpSaveResult.retryAfterSeconds} seconds before requesting a new OTP.`,
      });
    }

    await createActivityLog({
      actorType: "student",
      actorId: student._id,
      actorLabel: student.rollNo,
      action: "auth.password_reset.otp_requested",
      entityType: "student",
      entityId: student._id,
      details: {
        studentId: student.studentId,
      },
      req,
    });

    const html = generateResetOTPTemplate(student.name, otp);
    await sendEmail({
      to: email,
      subject: "OTP to Reset Your Password",
      html,
    });

    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Error in sendForgotPasswordOtp:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// 2. Verify OTP and Set New Password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, OTP, and New Password are required" });
    }

    const student = await findStudentByEmail(email);

    if (!student) return res.status(404).json({ message: "Student not found" });

    const verification = await verifyOtpAndGetData(
      FORGOT_PASSWORD_OTP_PURPOSE,
      email,
      otp
    );

    if (!verification.isValid) {
      if (student) {
        await createActivityLog({
          actorType: "student",
          actorId: student._id,
          actorLabel: student.rollNo,
          action: "auth.password_reset.otp_verification_failed",
          entityType: "student",
          entityId: student._id,
          status:
            verification.reason === "expired" || verification.reason === "too_many_attempts"
              ? "failure"
              : "info",
          details: {
            reason: verification.reason,
            attemptsLeft: verification.attemptsLeft ?? null,
          },
          req,
        });
      }

      const statusCode =
        verification.reason === "expired"
          ? 410
          : verification.reason === "too_many_attempts"
            ? 429
            : 401;
      const message =
        verification.reason === "expired"
          ? "OTP expired. Please request again."
          : verification.reason === "too_many_attempts"
            ? "Too many invalid OTP attempts. Please request a new OTP."
            : "Invalid OTP. Try again.";

      return res.status(statusCode).json({ message });
    }

    student.password = newPassword;
    await student.save();

    await createActivityLog({
      actorType: "student",
      actorId: student._id,
      actorLabel: student.rollNo,
      action: "auth.password_reset.completed",
      entityType: "student",
      entityId: student._id,
      details: {
        studentId: student.studentId,
      },
      req,
    });

    const html = passwordChangedTemplate(student.name);
    await sendEmail({
      to: email,
      subject: "Password Successfully Changed",
      html,
    });

    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  sendForgotPasswordOtp,
  resetPassword,
};
