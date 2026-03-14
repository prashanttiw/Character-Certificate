const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin.model");
const { comparePassword } = require("../../utils/hashUtils");
const { createActivityLog } = require("../../services/activityLog.service");

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });

    if (!admin || !admin.isActive || !(await comparePassword(password, admin.password))) {
      return res.status(401).json({ message: "Invalid admin credentials." });
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
        type: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    await createActivityLog({
      actorType: "admin",
      actorId: admin._id,
      actorLabel: admin.email,
      action: "admin.auth.login.succeeded",
      entityType: "admin",
      entityId: admin._id,
      details: {
        role: admin.role,
      },
      req,
    });

    return res.status(200).json({
      message: "Admin login successful.",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  loginAdmin,
};
