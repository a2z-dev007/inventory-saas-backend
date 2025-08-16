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
  unitType: {
    type: String,
  },
  isCancelled: {
    type: Boolean,
    default: false,
  },
  isReturn: {
    type: Boolean,
    default: false,
  },
  total: {
    type: Number,
    required: true,
    min: [0, "Total cannot be negative"],
  },
})

// 🔹 Return object schema
const returnSchema = new mongoose.Schema({
  items: [purchaseItemSchema], // only items with isReturn = true
  returnAmount: {
    type: Number,
    default: 0,
    min: [0, "Return amount cannot be negative"],
  },
  returnQty: {
    type: Number,
    default: 0,
    min: [0, "Return quantity cannot be negative"],
  },
}, { _id: false })

const purchaseSchema = new mongoose.Schema(
  {
    ref_num: {
      type: String,
      unique: true,
      trim: true,
      index: true,
      required: [true, "DB Number is required"],
    },
    invoiceFile: {
      type: String,
      trim: true,
      default: "",
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
    total: {
      type: Number,
      required: true,
      min: [0, "Total cannot be negative"],
    },
    receiptNumber: {
      type: String,
      unique: true,
      trim: true,
      index: true,
    },
    remark: {
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
    isCancelled: {
      type: Boolean,
      default: false,
    },
    receivedBy:{
      type:String,
    },
    cancelledAmount: {
      type: Number,
      default: 0,
    },
    cancelledQty: {
      type: Number,
      default: 0,
    },

    // 🔹 New return object
    return: {
      type: returnSchema,
      default: () => ({ items: [], returnAmount: 0, returnQty: 0 }),
    },

    remarks: {
      type: String,
      trim: true,
      maxlength: [1000, "Remarks cannot exceed 1000 characters"],
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
