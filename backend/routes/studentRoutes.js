const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");


const { getStudentDashboard } = require("../controllers/studentController");

const {
  applyCertificate,
  submitApplication,
  submitCertificateApplication,
  getApplicationStatus,
  updateDraftApplication
} = require("../controllers/certificateController");

// Student Dashboard
router.get("/dashboard", authMiddleware, getStudentDashboard);

// Submit latest draft (alias of submitCertificateApplication)
router.post("/submit-latest", authMiddleware, submitCertificateApplication);

// Explicit submission by ID or legacy route (kept for compatibility)
router.post("/submit", authMiddleware, submitApplication);

// Apply with files (aadhar + marksheet)
router.post(
  "/apply",
  authMiddleware,
  upload.fields([
    { name: "aadhar", maxCount: 1 },
    { name: "marksheet", maxCount: 1 },
  ]),
  applyCertificate
);

// Get current application status
router.get("/status", authMiddleware, getApplicationStatus);




// Edit draft application
router.put(
  "/edit",
  authMiddleware,
  upload.fields([
    { name: "aadhar", maxCount: 1 },
    { name: "marksheet", maxCount: 1 },
  ]),
  updateDraftApplication
);

module.exports = router;
