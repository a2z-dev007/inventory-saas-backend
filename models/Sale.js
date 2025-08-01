const mongoose = require("mongoose")

const saleItemSchema = new mongoose.Schema({
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
  unitType: {
    type: String,
    required: true
  },
  total: {
    type: Number,
    required: true,
    min: [0, "Total cannot be negative"],
  },
})

const saleSchema = new mongoose.Schema(

  {
    ref_num:{
      type: String,
      required: [true, "DB number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    invoiceNumber: {
      type: String,
      required: [true, "Invoice number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
   phone: {
      type: String,
      trim: true,
    },
    saleDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    items: [saleItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal cannot be negative"],
    },
    total: {
      type: Number,
      required: true,
      min: [0, "Total cannot be negative"],
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "paid", "cancelled", "refunded"],
      default: "pending",
    },

    remarks: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },

    // paymentMethod: {
    //   type: String,
    //   enum: ["cash", "card", "bank_transfer", "check"],
    //   default: "cash",
    // },
  },
  {
    timestamps: true,
  },
)

// Indexes
saleSchema.index({ invoiceNumber: 1 })
saleSchema.index({ customerName: 1 })
saleSchema.index({ saleDate: -1 })
saleSchema.index({ status: 1 })
saleSchema.index({ createdBy: 1 })
saleSchema.index({ isDeleted: 1 })

// Auto-generate invoice number
saleSchema.pre("save", async function (next) {
  if (!this.invoiceNumber) {
    const year = new Date().getFullYear()
    const count = await this.constructor.countDocuments({
      invoiceNumber: { $regex: `^INV-${year}-` },
    })
    this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(3, "0")}`
  }
  next()
})

module.exports = mongoose.model("Sale", saleSchema)
