const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const sendEmail = require("../utils/sendEmail");
const loginAlertTemplate = require("../utils/emailTemplates/loginAlertTemplate");

// Register Student and Send OTP Email
const register = async (req, res) => {
  try {
    const { name, email, rollNo, mobile, password } = req.body;

    const existing = await Student.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const student = new Student({ name, email, rollNo, mobile, password, otp });
    await student.save();

    const otpHTML = `
      <h2>Welcome to Character Certificate Portal</h2>
      <p>Hi <b>${name}</b>,</p>
      <p>Your One-Time Password (OTP) for email verification is:</p>
      <h1 style="color:blue;">${otp}</h1>
      <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
    `;

    await sendEmail({
      to: email,
      subject: "OTP for Character Certificate Email Verification",
      html: otpHTML,
    });

    return res.status(201).json({ message: "Registered! OTP sent to email" });
  } catch (err) {
    console.error("Error in Register:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Login Student
const login = async (req, res) => {
  try {
    const { emailOrRollNo, password } = req.body;

    if (!emailOrRollNo || !password) {
      return res.status(400).json({ message: "Email/Roll No and Password are required" });
    }

    const student = await Student.findOne({
      $or: [
        { email: emailOrRollNo.trim() },
        { rollNo: emailOrRollNo.trim() }
      ]
    });

    if (!student) {
      return res.status(404).json({ message: "No student found with given Email or Roll No" });
    }

    if (student.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    if (!student.isVerified) {
      return res.status(403).json({ message: "Please verify your email first using OTP" });
    }

    // Generate JWT
    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    // Send login alert email
    const loginTime = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const loginHtml = loginAlertTemplate(student.name, loginTime);

    await sendEmail({
      to: student.email,
      subject: "Login Alert: Your account was accessed",
      html: loginHtml,
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      student: {
        id: student._id,
        name: student.name,
        rollNo: student.rollNo,
        email: student.email,
        isVerified: student.isVerified
      }
    });

  } catch (err) {
    console.error("Error in Login:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

module.exports = {
  register,
  login
};
