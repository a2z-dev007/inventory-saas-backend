const mongoose = require("mongoose");

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
  unitType:{
    type:String,
    required:true
  },
  total: {
    type: Number,
    required: true,
    min: [0, "Total cannot be negative"],
  },
 
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    ref_num: {
      type: String,
      unique: true,
      trim: true,
      index: true,
    },
    attachment: {
      type: String,
      trim: true,
      default: "",
    },
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
    total: {
      type: Number,
      required: true,
      min: [0, "Total cannot be negative"],
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
    orderedBy: {
      type: String,
        trim: true,
    },
    approvedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deletedAt: {
      type: Date,
    },
      remarks: {
        type: String,
        trim: true,
        maxlength: [1000, "Remarks cannot exceed 1000 characters"],
      },
      site_incharge: {
        type: String,
        trim: true,
      },
      contractor:{
        type: String,
        trim: true
      },
      purpose:{
        type: String,
        trim: true
      }
  },
  {
    timestamps: true,
  }
);

// Indexes
purchaseOrderSchema.index({ ref_num: 1 });
purchaseOrderSchema.index({ poNumber: 1 });
purchaseOrderSchema.index({ vendor: 1 });
purchaseOrderSchema.index({ status: 1 });
purchaseOrderSchema.index({ orderDate: -1 });
purchaseOrderSchema.index({ createdBy: 1 });
purchaseOrderSchema.index({ approvedBy: 1 });
purchaseOrderSchema.index({ isDeleted: 1 });
purchaseOrderSchema.index({ deletedBy: 1 });
purchaseOrderSchema.index({ deletedAt: -1 });


// Auto-generate ref_num
purchaseOrderSchema.pre("save", async function (next) {
  if (!this.ref_num) {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}${String(now.getDate()).padStart(2, "0")}`;
    const regex = new RegExp(`^PO-${dateStr}-\\d{4}$`);
    const count = await this.constructor.countDocuments({
      ref_num: { $regex: regex },
    });
    this.ref_num = `PO-${dateStr}-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);
