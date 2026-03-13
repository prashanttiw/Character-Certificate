const express = require('express');
const path = require("path");
const cors = require('cors');
require("dotenv").config();

process.env.JWT_SECRET ||= "test-jwt-secret";
process.env.SECRET_KEY ||= "test-secret-key";

const app = express(); // create express app

// --- Middleware Setup ---
app.use(cors()); // use cors middleware
app.use(express.json()); // parse incoming JSON requests

// This is your helpful debugging middleware. It's good for development.
app.use((req, res, next) => {
  console.log("🧪 DEBUG Middleware Triggered");
  console.log("🔍 Method:", req.method);
  console.log("🔍 URL:", req.url);
  console.log("🔍 Content-Type:", req.headers["content-type"]);
  console.log("🔍 Body:", req.body);
  next();
});

// --- Route Definitions ---
const authRoutes = require('./routes/auth.routes');
const passwordRoutes = require("./routes/passwordRoutes");
const studentRoutes = require('./routes/studentRoutes');
app.use('/api/auth', authRoutes);
app.use("/api/auth", passwordRoutes);
app.use('/api/student', studentRoutes);

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// const passwordRoutes = require("./routes/passwordRoutes");
// app.use("/api/password", passwordRoutes);

// const profileEditRoutes = require("./routes/profileEditRoutes");
// app.use("/api/profile", profileEditRoutes);

// const certificateRoutes = require("./routes/certificateRoutes");
// app.use("/api/certificates", certificateRoutes);

// --- Root/Health Check Route ---
// Default test route to check if the API is running
app.get('/', (req, res) => {
    res.send('🎉 Character Certificate API is running!');
});

// Export the configured app
module.exports = app;
