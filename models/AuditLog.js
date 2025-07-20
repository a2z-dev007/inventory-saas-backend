const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  targetModel: { type: String, required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: Object },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: false });

auditLogSchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema); 