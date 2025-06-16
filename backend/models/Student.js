const mongoose = require('mongoose');
const { encryptField, decryptField } = require("../utils/encryptionUtils");
const { hashPassword } = require("../utils/hashUtils");

// Define student schema
const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    rollNo: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        set: encryptField,
        get: decryptField,
    },
    mobile: {
        type: String,
        required: true,
        set: encryptField,
        get: decryptField,
    },
    password: {
        type: String,
        required: true
    },
    otp: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});


studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await hashPassword(this.password);
  next();
});




module.exports = mongoose.model('Student', studentSchema);
