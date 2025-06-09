const express = require('express'); // import express
const mongoose = require('mongoose'); // import mongoose for DB
const connectDB = require('./config/db'); // import DB connection
const cors= require('cors'); // allow frontend requests
require("dotenv").config(); // load environment variables

const app = express(); // create express app

app.use(cors()); // use cors middleware
app.use(express.json()); // parse incoming JSON requests

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

connectDB(); // connect to MongoDB


// Default test route 
app.get('/', (req, res) => {
    res.send('🎉 Character Certificate API is running!');
});
 
// Start server 
app.listen(process.env.PORT || 5000, () => {
    console.log(`🚀 Server started on port ${process.env.PORT || 5000}`);
});