const mongoose = require("mongoose");

const stockMovementSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  movementType: {
    type: String,
    enum: ["purchase", "sale", "purchase_return", "sales_return", "adjustment"],
    required: true,
  },
  quantity: { type: Number, required: true },
  relatedDoc: { type: mongoose.Schema.Types.ObjectId, refPath: "relatedModel" },
  relatedModel: { type: String, enum: ["Purchase", "Sale", "Return", "PurchaseOrder"] },
  movementDate: { type: Date, default: Date.now },
  notes: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

stockMovementSchema.index({ product: 1, movementDate: -1 });

module.exports = mongoose.model("StockMovement", stockMovementSchema); 