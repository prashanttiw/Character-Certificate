require("dotenv").config(); // load environment variables
const express = require('express'); // import express
const mongoose = require('mongoose'); // import mongoose for DB
const connectDB = require('./config/db'); // import DB connection

const path = require("path");
const cors= require('cors'); // allow frontend requests


const app = express(); // create express app

app.use(cors()); // use cors middleware
app.use(express.json()); // parse incoming JSON requests

app.use((req, res, next) => {
  console.log("🧪 DEBUG Middleware Triggered");
  console.log("🔍 Method:", req.method);
  console.log("🔍 URL:", req.url);
  console.log("🔍 Content-Type:", req.headers["content-type"]);
  console.log("🔍 Body:", req.body);
  next();
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const studentRoutes = require('./routes/studentRoutes');
app.use('/api/student', studentRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const passwordRoutes = require("./routes/passwordRoutes");
app.use("/api/password", passwordRoutes);

const profileEditRoutes = require("./routes/profileEditRoutes");
app.use("/api/profile", profileEditRoutes);

const certificateRoutes = require("./routes/certificateRoutes");
app.use("/api/certificates", certificateRoutes);




connectDB(); // connect to MongoDB


// Default test route 
app.get('/', (req, res) => {
    res.send('🎉 Character Certificate API is running!');
});
 
// Start server 
app.listen(process.env.PORT || 5000, () => {
    console.log(`🚀 Server started on port ${process.env.PORT || 5000}`);
});