const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [50, "SKU cannot exceed 50 characters"],
    },
    purchaseRate: {
      type: Number,
      required: [true, "Purchase rate is required"],
      min: [0, "Purchase rate cannot be negative"],
    },
    salesRate: {
      type: Number,
      required: [true, "Sales rate is required"],
      min: [0, "Sales rate cannot be negative"],
    },
    currentStock: {
      type: Number,
      required: [true, "Current stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [100, "Category cannot exceed 100 characters"],
    },
    vendor: {
      type: String,
      required: [true, "Vendor is required"],
      trim: true,
      maxlength: [200, "Vendor name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    minStockLevel: {
      type: Number,
      default: 10,
      min: [0, "Minimum stock level cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for performance
productSchema.index({ sku: 1 })
productSchema.index({ name: "text", category: "text" })
productSchema.index({ category: 1 })
productSchema.index({ vendor: 1 })
productSchema.index({ currentStock: 1 })

// Virtual for profit margin
productSchema.virtual("profitMargin").get(function () {
  if (this.purchaseRate === 0) return 0
  return (((this.salesRate - this.purchaseRate) / this.purchaseRate) * 100).toFixed(2)
})

// Virtual for low stock alert
productSchema.virtual("isLowStock").get(function () {
  return this.currentStock <= this.minStockLevel
})

// Ensure virtual fields are serialized
productSchema.set("toJSON", { virtuals: true })

module.exports = mongoose.model("Product", productSchema)
