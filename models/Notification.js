const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  type: { type: String, enum: ["low_stock", "order_status", "purchase", "sale", "custom"], required: true },
  message: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  relatedDoc: { type: mongoose.Schema.Types.ObjectId, refPath: "relatedModel" },
  relatedModel: { type: String, enum: ["Product", "PurchaseOrder", "Sale", "Purchase", "Return"] },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model("Notification", notificationSchema); 