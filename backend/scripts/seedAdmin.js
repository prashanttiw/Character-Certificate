require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Admin = require("../admin/models/Admin.model");

const seedAdmin = async () => {
  const name = process.env.ADMIN_NAME || "System Administrator";
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const role = process.env.ADMIN_ROLE || "superadmin";

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in backend/.env");
  }

  await connectDB();

  const existingAdmin = await Admin.findOne({ email: email.trim().toLowerCase() });

  if (existingAdmin) {
    existingAdmin.name = name;
    existingAdmin.role = role;
    existingAdmin.isActive = true;
    existingAdmin.password = password;
    await existingAdmin.save();
    console.log(`Updated admin account for ${existingAdmin.email}`);
  } else {
    const admin = new Admin({
      name,
      email,
      password,
      role,
    });

    await admin.save();
    console.log(`Created admin account for ${admin.email}`);
  }
};

seedAdmin()
  .catch((error) => {
    console.error("Failed to seed admin:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
