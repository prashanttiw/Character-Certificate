const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  applyCertificate,
  submitApplication,
  submitCertificateApplication,
  getApplicationStatus,
  saveAsDraft,
  updateDraftApplication, // ✅ New controller
} = require("../controllers/certificateController");
const verifyToken = require("../middleware/authMiddleware");


//  Multer Configuration 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

const fileUploadMiddleware = upload.fields([
  { name: "aadhar", maxCount: 1 },
  { name: "marksheet", maxCount: 1 },
]);

//  Certificate Routes 

// Save draft application with uploads
router.post("/save-draft", verifyToken, fileUploadMiddleware, saveAsDraft);


// ✅ Update draft application with full data + files
router.put("/update-draft", verifyToken, fileUploadMiddleware, updateDraftApplication);

// Apply for certificate (initial creation with files)
router.post("/apply", verifyToken, fileUploadMiddleware, applyCertificate);

// Submit certificate (without payment step for now)
router.post("/submit", verifyToken, submitApplication);

// Submit final application (might be replaced by payment + OTP later)
router.post("/submit-final", verifyToken, submitCertificateApplication);

// Get current application status
router.get("/status", verifyToken, getApplicationStatus);

module.exports = router;
