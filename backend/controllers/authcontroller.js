const Student = require("../models/Student");
const sendMail = require("../utils/sendMail");

const register = async (req, res) => {
  try {
    const { name, email, rollNo, password } = req.body;

    const existing = await Student.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const student = new Student({ name, email, rollNo, password, otp });
    await student.save();

    await sendMail(email, "Your OTP for Character Certificate", `Your OTP is: ${otp}`);

    return res.status(201).json({ message: "Registered! OTP sent to email" });
  } catch (err) {
    console.error("Error in Register:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { register };
