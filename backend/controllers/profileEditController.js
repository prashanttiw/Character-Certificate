const Student = require("../models/Student");
const sendEmail = require("../utils/sendEmail");
const profileEditOtpTemplate = require("../utils/emailTemplates/profileEditOtpTemplate");
const profileUpdatedTemplate = require("../utils/emailTemplates/profileUpdatedTemplate");

// Step 1: Send OTP to verify profile edit
const sendEditProfileOtp = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await Student.findById(studentId);

    if (!student) return res.status(404).json({ message: "Student not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    student.otp = otp;
    await student.save();

    const html = profileEditOtpTemplate(student.name, otp);

    await sendEmail({
      to: student.email,
      subject: "OTP for Profile Edit Request",
      html,
    });

    return res.status(200).json({ message: "OTP sent to your email for profile edit verification" });
  } catch (err) {
    console.error("Error in sendEditProfileOtp:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Step 2: Verify OTP and Update Profile
const verifyEditProfileOtpAndUpdate = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { otp, name, rollNo, mobile } = req.body;

    if (!otp) return res.status(400).json({ message: "OTP is required" });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (student.otp !== otp) return res.status(401).json({ message: "Invalid OTP" });

    // Update fields if provided
    if (name) student.name = name;
    if (rollNo) student.rollNo = rollNo;
    if (mobile) student.mobile = mobile;

    student.otp = null; // clear OTP
    await student.save();

    const html = profileUpdatedTemplate(student.name);

    await sendEmail({
      to: student.email,
      subject: "Profile Updated Successfully",
      html,
    });

    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error in verifyEditProfileOtpAndUpdate:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  sendEditProfileOtp,
  verifyEditProfileOtpAndUpdate,
};
