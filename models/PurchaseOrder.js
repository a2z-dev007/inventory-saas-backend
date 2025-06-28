const mongoose = require("mongoose")

const purchaseOrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, "Unit price cannot be negative"],
  },
  total: {
    type: Number,
    required: true,
    min: [0, "Total cannot be negative"],
  },
})

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: [true, "PO Number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    vendor: {
      type: String,
      required: [true, "Vendor is required"],
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["draft", "pending", "approved", "delivered", "cancelled"],
      default: "draft",
    },
    orderDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    deliveryDate: {
      type: Date,
    },
    expectedDeliveryDate: {
      type: Date,
    },
    items: [purchaseOrderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal cannot be negative"],
    },
    tax: {
      type: Number,
      required: true,
      min: [0, "Tax cannot be negative"],
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: [0, "Total cannot be negative"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
purchaseOrderSchema.index({ poNumber: 1 })
purchaseOrderSchema.index({ vendor: 1 })
purchaseOrderSchema.index({ status: 1 })
purchaseOrderSchema.index({ orderDate: -1 })
purchaseOrderSchema.index({ createdBy: 1 })

// Auto-generate PO number
purchaseOrderSchema.pre("save", async function (next) {
  if (!this.poNumber) {
    const year = new Date().getFullYear()
    const count = await this.constructor.countDocuments({
      poNumber: { $regex: `^PO-${year}-` },
    })
    this.poNumber = `PO-${year}-${String(count + 1).padStart(3, "0")}`
  }
  next()
})

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema)
