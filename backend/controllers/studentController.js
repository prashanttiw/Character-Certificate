const Student = require("../models/Student");
const Certificate = require("../models/certificate");
const { createActivityLog } = require("../services/activityLog.service");

// Controller: Get logged-in student's dashboard
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Fetch student data
    const student = await Student.findById(studentId).select("-password -otp");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Fetch the latest certificate application
    const certificate = await Certificate.findOne({ student: studentId }).sort({ createdAt: -1 });

    await createActivityLog({
      actorType: "student",
      actorId: student._id,
      actorLabel: student.rollNo,
      action: "student.dashboard.viewed",
      entityType: "student",
      entityId: student._id,
      status: "info",
      details: {
        applicationId: certificate?._id || null,
        applicationStatus: certificate?.status || "No application",
      },
      req,
    });

    return res.status(200).json({
      message: "Dashboard data fetched successfully",
      student: student.toObject(),
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
