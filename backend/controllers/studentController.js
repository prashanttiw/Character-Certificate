const Student = require("../models/Student");
const Certificate = require("../models/certificate");
const CryptoJS = require("crypto-js");

// Controller: Get logged-in student's dashboard
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Fetch student data
    const student = await Student.findById(studentId).select("-password -otp");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Decrypt email and mobile
    const decryptedEmail = CryptoJS.AES.decrypt(student.email, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const decryptedMobile = CryptoJS.AES.decrypt(student.mobile, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);

    // Prepare student data with decrypted fields
    const studentData = {
      ...student._doc,
      email: decryptedEmail,
      mobile: decryptedMobile
    };

    // Fetch the latest certificate application
    const certificate = await Certificate.findOne({ student: studentId }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Dashboard data fetched successfully",
      student: studentData,
      application: certificate || null
    });

  } catch (err) {
    console.error("Dashboard fetch error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getStudentDashboard,
};
