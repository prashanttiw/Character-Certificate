// app.js

require("dotenv").config(); // Load environment variables

const express = require('express');
const path = require("path");
const cors = require('cors');

const app = express();

// Connect to MongoDB (ONLY IN SERVER.JS, not here)

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use("/api/password", require("./routes/passwordRoutes"));
app.use("/api/profile", require("./routes/profileEditRoutes"));
app.use("/api/certificates", require("./routes/certificateRoutes"));

// Health check / root route
app.get('/', (req, res) => {
    res.send('🎉 Character Certificate API is running!');
});

// Export the app for use in tests
module.exports = app;
