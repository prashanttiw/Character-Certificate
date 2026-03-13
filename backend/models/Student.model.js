// backend/models/Student.model.js

const mongoose = require('mongoose');
const Counter = require("./Counter.model");
const { hashPassword } = require('../utils/hashUtils');
const { encryptField, decryptField } = require('../utils/encryptionUtils');

const studentSchema = new mongoose.Schema({
   studentId: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true 
  },
  rollNo: {
    type: String,
    required: [true, "Roll number is required"],
    unique: true,
    trim: true,
    uppercase: true 
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true, 
    trim: true,
    set: encryptField, 
    get: decryptField,
  },
  mobile: {
    type: String,
    required: [true, "Mobile number is required"],
    set: encryptField,
    get: decryptField,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"]
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});


//  --- mongoose Hooks ---



// This hook runs before validation, ensuring we have an ID before we try to save.
studentSchema.pre('validate', async function(next) {
  if (this.isNew) { // Only run for new documents
    try {
      // 1. Find the counter for 'studentId' and atomically increment its 'seq' value.
      // The { new: true, upsert: true } options create the counter if it doesn't exist.
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'studentId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      // 2. Format the new sequence number into our desired studentId format.
      const year = new Date().getFullYear();
      this.studentId = `GBU-${year}-${String(counter.seq).padStart(5, '0')}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});



// This Mongoose "hook" runs automatically before a student document is saved.
studentSchema.pre('save', async function(next) {
  // Only hash the password if it's new or has been modified.
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Replace the plain-text password with a secure hash.
    this.password = await hashPassword(this.password);
    next();
  } catch (error) {
    next(error); 
  }
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
