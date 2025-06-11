const bcrypt = require("bcrypt");
const Student = require("../models/Student");
const sendMail = require("../utils/sendMail");

// ------------------- REGISTER --------------------
const register = async (req, res) => {
  try {
    const { name, email, rollNo, password, mobile } = req.body;

    // Check all required fields
    if (!name || !email || !rollNo || !password || !mobile) {
      return res.status(400).json({ message: "All fields are required: name, email, rollNo, password, mobile" });
    }

    // Check if email already exists
    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new student
    const student = new Student({
      name,
      email,
      rollNo,
      mobile,
      password: hashedPassword,
      otp
    });

    await student.save();

    // Send OTP via email
    await sendMail(email, "Your OTP for Character Certificate", `Your OTP is: ${otp}`);

    return res.status(201).json({ message: "Registered! OTP sent to email" });

  } catch (err) {
    console.error("Error in Register:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};


// -------------------- LOGIN ---------------------
const login = async (req, res) => {
  try {
    const { emailOrRollNo, password } = req.body;

    if (!emailOrRollNo || !password) {
      return res.status(400).json({ message: "Email/Roll No and Password are required" });
    }

    // Find user by email or rollNo
    const student = await Student.findOne({
      $or: [
        { email: emailOrRollNo.trim() },
        { rollNo: emailOrRollNo.trim() }
      ]
    });

    if (!student) {
      return res.status(404).json({ message: "No student found with given Email or Roll No" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Check verification status
    if (!student.isVerified) {
      return res.status(403).json({ message: "Please verify your email first using OTP" });
    }

    return res.status(200).json({
      message: "Login successful",
      student: {
        id: student._id,
        name: student.name,
        rollNo: student.rollNo,
        email: student.email,
        mobile: student.mobile,
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
