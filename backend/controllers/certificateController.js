const Certificate = require("../models/certificate");
const Student = require("../models/Student");
const sendEmail = require("../utils/sendEmail");
const generateSubmissionEmail = require("../utils/emailTemplates");

// ========== Apply for Certificate (Initial Save with Files) ==========
const applyCertificate = async (req, res) => {
  try {
    const studentId = req.user.id;

    const {
      name,
      rollNo,
      gender,
      maritalStatus,
      careOf,
      course,
      school,
      department,
      academicSession,
    } = req.body;

    const certificate = new Certificate({
      student: studentId,
      name,
      rollNo,
      gender,
      maritalStatus,
      careOf,
      course,
      school,
      department,
      academicSession,
      aadharUrl: req.files?.aadhar?.[0]?.path || "",
      marksheetUrl: req.files?.marksheet?.[0]?.path || "",
      status: "Draft",
    });

    await certificate.save();

    res.status(201).json({
      message: "Application saved as draft successfully",
      certificate,
    });
  } catch (error) {
    console.error("Error applying for certificate:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ========== Submit Final Certificate Application ==========
const submitCertificateApplication = async (req, res) => {
  try {
    const studentId = req.user.id;

    const certificate = await Certificate.findOne({ student: studentId });

    if (!certificate) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (certificate.status !== "Draft") {
      return res.status(400).json({ message: "Application already submitted or processed" });
    }

    certificate.status = "Submitted";

    await certificate.save();

    // Send email to student
    const student = await Student.findById(studentId);
    const emailContent = generateSubmissionEmail(student.name, certificate.rollNo);

    await sendEmail(student.email, "Certificate Application Submitted", emailContent);

    res.status(200).json({ message: "Application submitted successfully" });
  } catch (error) {
    console.error("Error submitting application:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ========== Submit Application (Alternative Endpoint) ==========
const submitApplication = async (req, res) => {
  try {
    const studentId = req.user.id;

    const certificate = await Certificate.findOne({ student: studentId });

    if (!certificate) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (certificate.status !== "Draft") {
      return res.status(400).json({ message: "Application already submitted or processed" });
    }

    certificate.status = "Submitted";

    await certificate.save();

    res.status(200).json({ message: "Application submitted successfully" });
  } catch (error) {
    console.error("Error submitting application:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ========== Get Application Status ==========
const getApplicationStatus = async (req, res) => {
  try {
    const studentId = req.user.id;

    const certificate = await Certificate.findOne({ student: studentId });

    if (!certificate) {
      return res.status(200).json({ status: "No application" });
    }

    res.status(200).json({
      status: certificate.status,
      certificate,
    });
  } catch (error) {
    console.error("Error fetching application status:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



// ========== Save as Draft (Fresh or Update) ==========
const saveAsDraft = async (req, res) => {
  try {
    const studentId = req.user.id;

    let certificate = await Certificate.findOne({ student: studentId });

    if (!certificate) {
      certificate = new Certificate({
        student: studentId,
        status: "Draft",
      });
    }

    const {
      name,
      rollNo,
      gender,
      maritalStatus,
      careOf,
      course,
      school,
      department,
      academicSession,
    } = req.body;

    certificate.name = name || certificate.name;
    certificate.rollNo = rollNo || certificate.rollNo;
    certificate.gender = gender || certificate.gender;
    certificate.maritalStatus = maritalStatus || certificate.maritalStatus;
    certificate.careOf = careOf || certificate.careOf;
    certificate.course = course || certificate.course;
    certificate.school = school || certificate.school;
    certificate.department = department || certificate.department;
    certificate.academicSession = academicSession || certificate.academicSession;

    if (req.files?.aadhar) {
      certificate.aadharUrl = req.files.aadhar[0].path;
    }

    if (req.files?.marksheet) {
      certificate.marksheetUrl = req.files.marksheet[0].path;
    }

    await certificate.save();

    res.status(200).json({
      message: "Draft saved successfully",
      certificate,
    });
  } catch (error) {
    console.error("Error saving draft:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ========== Update Full Draft Application (When Not Yet Submitted) ==========
const updateDraftApplication = async (req, res) => {
  try {
    const studentId = req.user.id;

    const application = await Certificate.findOne({ student: studentId, status: "Draft" });

    if (!application) {
      return res.status(404).json({ message: "No draft found" });
    }

    const {
      name,
      rollNo,
      gender,
      maritalStatus,
      careOf,
      course,
      school,
      department,
      academicSession,
    } = req.body;

    if (name) application.name = name;
    if (rollNo) application.rollNo = rollNo;
    if (gender) application.gender = gender;
    if (maritalStatus) application.maritalStatus = maritalStatus;
    if (careOf) application.careOf = careOf;
    if (course) application.course = course;
    if (school) application.school = school;
    if (department) application.department = department;
    if (academicSession) application.academicSession = academicSession;

    if (req.files?.aadhar) {
      application.aadharUrl = req.files.aadhar[0].path;
    }

    if (req.files?.marksheet) {
      application.marksheetUrl = req.files.marksheet[0].path;
    }

    await application.save();

    res.status(200).json({
      message: "Draft updated successfully",
      application,
    });
  } catch (error) {
    console.error("Update Draft Error:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ========== Export All Controllers ==========
module.exports = {
  applyCertificate,
  submitCertificateApplication,
  submitApplication,
  getApplicationStatus,
  saveAsDraft,
  updateDraftApplication,
};
