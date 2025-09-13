const mongoose = require("mongoose");


const certificateSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    name: { type: String, required: true },
    rollNo: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    maritalStatus: { type: String, enum: ["Married", "Unmarried"] },
    careOf: { type: String },
    course: { type: String, required: true },
    school: { type: String },
    department: { type: String },
    academicSession: { type: String, required: true },
    aadharUrl: { type: String }, // Path to uploaded Aadhar
    marksheetUrl: { type: String }, // Path to uploaded marksheet
    certificateNumber: { type: String, unique: true, sparse: true }, // Only generated after approval
    status: {
      type: String,
      enum: ["Draft", "Pending", "Approved", "Rejected"],
      default: "Draft",
    },
    comments: { type: String }, // Admin comment for rejection/hold/etc.
  },
  { timestamps: true }
);

module.exports = mongoose.model("Certificate", certificateSchema);
