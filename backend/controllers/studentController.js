const Student = require("../models/Student");
const Certificate = require("../models/certificate");

// Controller: Get logged-in student's dashboard
const getStudentDashboard = async (req, res) => {
  try {
    // Extract student ID from JWT decoded payload (set in authMiddleware)
    const studentId = req.user.id;

    // Fetch student details (excluding sensitive fields)
    const student = await Student.findById(studentId).select("-password -otp");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Fetch the latest certificate application for the student
    const certificate = await Certificate.findOne({ student: studentId }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Dashboard data fetched successfully",
      student,
      application: certificate || null  // Include certificate info if exists
    });

  } catch (err) {
    console.error("Dashboard fetch error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getStudentDashboard,
};
