const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
  date: { type: String }, // e.g. "20250818"
});

module.exports = mongoose.model("Counter", counterSchema);