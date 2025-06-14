const Certificate = require("../models/certificate");
const Student = require("../models/Student");
const sendEmail = require("../utils/sendEmail");
const generateSubmissionEmail = require("../utils/emailTemplates");

const applyCertificate = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.isVerified) {
      return res.status(403).json({ message: "Email not verified. Please verify your account." });
    }

    // Check for existing unprocessed application
    const existingApp = await Certificate.findOne({
      student: studentId,
      status: { $in: ["Draft", "Submitted", "Pending"] }
    });

    if (existingApp) {
      return res.status(400).json({
        message: "You already have a pending or draft application. Please wait for it to be processed."
      });
    }

    // Access file paths
    const aadharFile = req.files?.aadhar?.[0];
    const marksheetFile = req.files?.marksheet?.[0];

    if (!aadharFile || !marksheetFile) {
      return res.status(400).json({ message: "Both Aadhar and Marksheet files are required." });
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
      academicSession
    } = req.body;

    const newCert = new Certificate({
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
      aadharUrl: aadharFile.path,
      marksheetUrl: marksheetFile.path,
      status: "Draft"
    });

    await newCert.save();

    // Send draft saved email
    await sendEmail({
      to: student.email,
      subject: "Draft Application Saved",
      html: `<p>Hi ${student.name},</p>
             <p>Your Character Certificate application has been saved as <strong>Draft</strong>.</p>
             <p>You can edit and submit it anytime.</p>
             <p><em>Application ID:</em> ${newCert._id}</p>`
    });

    return res.status(201).json({
      message: "Certificate application saved as draft",
      applicationId: newCert._id
    });

  } catch (err) {
    console.error("Error in applyCertificate:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const submitApplication = async (req, res) => {
  try {
    const studentId = req.user.id;

    const draft = await Certificate.findOne({
      student: studentId,
      status: "Draft"
    });

    if (!draft) {
      return res.status(400).json({ message: "No draft application found to submit." });
    }

    draft.status = "Submitted";
    draft.submittedAt = Date.now();
    await draft.save();

    // Fetch student for email
    const student = await Student.findById(studentId);

    // Send beautiful email
    const html = generateSubmissionEmail(student.name, student.rollNo, draft.submittedAt);
    await sendEmail({
      to: student.email,
      subject: "Certificate Application Submitted",
      html,
    });

    return res.status(200).json({ message: "Application submitted and email sent." });

  } catch (err) {
    console.error("Error in submitApplication:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const submitCertificateApplication = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Find the latest draft application
    const draftApp = await Certificate.findOne({
      student: studentId,
      status: "Draft"
    }).sort({ createdAt: -1 });

    if (!draftApp) {
      return res.status(404).json({ message: "No draft application found to submit." });
    }

    // Update the status and submission date
    draftApp.status = "Submitted";
    draftApp.submittedAt = new Date();
    await draftApp.save();

    return res.status(200).json({
      message: "Application submitted successfully.",
      applicationId: draftApp._id
    });

  } catch (err) {
    console.error("Error in submitCertificateApplication:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getApplicationStatus = async (req, res) => {
  try {
    const studentId = req.user.id;
    const cert = await Certificate.findOne({ student: studentId })
      .sort({ createdAt: -1 })
      .select("status submittedAt createdAt");

    if (!cert) {
      return res.status(404).json({ message: "No application found." });
    }

    return res.status(200).json({
      message: "Application status fetched successfully",
      status: cert.status,
      submittedAt: cert.submittedAt,
      createdAt: cert.createdAt,
    });
  } catch (err) {
    console.error("Error in getApplicationStatus:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const editDraftApplication = async (req, res) => {
  try {
    const studentId = req.user.id;
    const cert = await Certificate.findOne({ student: studentId, status: "Draft" });

    if (!cert) {
      return res.status(400).json({ message: "No draft application to edit." });
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

    const aadharFile = req.files?.aadhar?.[0];
    const marksheetFile = req.files?.marksheet?.[0];

    // Update only provided fields
    if (name) cert.name = name;
    if (rollNo) cert.rollNo = rollNo;
    if (gender) cert.gender = gender;
    if (maritalStatus) cert.maritalStatus = maritalStatus;
    if (careOf) cert.careOf = careOf;
    if (course) cert.course = course;
    if (school) cert.school = school;
    if (department) cert.department = department;
    if (academicSession) cert.academicSession = academicSession;
    if (aadharFile) cert.aadharUrl = aadharFile.path;
    if (marksheetFile) cert.marksheetUrl = marksheetFile.path;

    await cert.save();

    const student = await Student.findById(studentId);
    await sendEmail({
      to: student.email,
      subject: "Draft Application Updated",
      html: `<p>Hi ${student.name},</p>
             <p>Your draft Character Certificate application has been <strong>updated</strong>.</p>
             <p>Remember to submit when ready. Application ID: ${cert._id}</p>`
    });

    return res.status(200).json({
      message: "Draft application updated successfully",
      applicationId: cert._id,
    });
  } catch (err) {
    console.error("Error in editDraftApplication:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  applyCertificate,
  submitApplication,
  submitCertificateApplication,
  getApplicationStatus,
  editDraftApplication,
};
