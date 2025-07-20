const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema({
  returnType: { type: String, enum: ["purchase", "sale"], required: true },
  originalDoc: { type: mongoose.Schema.Types.ObjectId, refPath: "returnType" },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  reason: { type: String, trim: true },
  returnDate: { type: Date, default: Date.now },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  notes: { type: String, trim: true },
}, { timestamps: true });

returnSchema.index({ returnType: 1, returnDate: -1 });

module.exports = mongoose.model("Return", returnSchema); 