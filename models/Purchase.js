const mongoose = require("mongoose")

const purchaseItemSchema = new mongoose.Schema({
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

const purchaseSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      required: [true, "Receipt number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    vendor: {
      type: String,
      required: [true, "Vendor is required"],
      trim: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    items: [purchaseItemSchema],
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
    invoiceFile: {
      type: String,
      trim: true,
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
    relatedPO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
purchaseSchema.index({ receiptNumber: 1 })
purchaseSchema.index({ vendor: 1 })
purchaseSchema.index({ purchaseDate: -1 })
purchaseSchema.index({ createdBy: 1 })

// Auto-generate receipt number
purchaseSchema.pre("save", async function (next) {
  if (!this.receiptNumber) {
    const year = new Date().getFullYear()
    const count = await this.constructor.countDocuments({
      receiptNumber: { $regex: `^REC-${year}-` },
    })
    this.receiptNumber = `REC-${year}-${String(count + 1).padStart(3, "0")}`
  }
  next()
})

module.exports = mongoose.model("Purchase", purchaseSchema)
