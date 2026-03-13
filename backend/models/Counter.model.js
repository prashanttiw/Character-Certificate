// backend/models/Counter.model.js

const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  // _id will be the name of our counter, e.g., "studentId"
  _id: { type: String, required: true },
  // seq will be the current number in the sequence
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;