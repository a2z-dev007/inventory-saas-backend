const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    // image: {
    //   type: String, // URL or base64
    //   default: null,
    // },
    // sku: {
    //   type: String,
    //   required: [true, "SKU is required"],
    //   unique: true,
    //   trim: true,
    //   uppercase: true,
    //   maxlength: [50, "SKU cannot exceed 50 characters"],
    // },
    purchaseRate: {
      type: Number,
      required: [true, " Price is required"],
      min: [0, " Price cannot be negative"],
    },
    // currentStock: {
    //   type: Number,
    //   required: [true, "Current stock is required"],
    //   min: [0, "Stock cannot be negative"],
    //   default: 0,
    // },
    // category: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Category",
    //   required: true,
    // },
    vendor: {
      type: String,
      required: false,
      trim: true,
      maxlength: [200, "Vendor name cannot exceed 200 characters"],
    },
    // description: {
    //   type: String,
    //   trim: true,
    //   maxlength: [1000, "Description cannot exceed 1000 characters"],
    // },
    
    minStockLevel: {
      type: Number,
      default: 10,
      min: [0, "Minimum stock level cannot be negative"],
    },
    unitType: {
      type: String,
      required: [true, "Unit type is required"],
      enum: {
        values: [
          "Nos",
          "kg",
          "MT",
          "m²",
          "m³",
          "Bag",
          "Sheet",
          "Roll",
          "Set",
          "Unit",
          "Box",
          "Packet",
          "Can",
          "Litre",
          "Piece",
          "Pair",
          "Machine Hour",
        ],
        message: "Invalid unit type",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for performance
productSchema.index({ name: 1, unitType: 1 }, { unique: true });
productSchema.index({ name: "text" })
productSchema.index({ vendor: 1 })
productSchema.index({ createdBy: 1 })

// Remove related indexes and virtuals
// productSchema.index({ name: "text", category: "text" })
// productSchema.index({ category: 1 })
// Virtual for profit margin
// productSchema.virtual("profitMargin").get(function () {
//   if (this.purchaseRate === 0) return 0
//   return (((this.salesRate - this.purchaseRate) / this.purchaseRate) * 100).toFixed(2)
// })
// Virtual for low stock alert
// productSchema.virtual("isLowStock").get(function () {
//   return this.currentStock <= this.minStockLevel
// })

// Ensure virtual fields are serialized
productSchema.set("toJSON", { virtuals: true })

module.exports = mongoose.model("Product", productSchema)
