const mongoose = require("mongoose")

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vendor name is required"],
      trim: true,
      maxlength: [200, "Vendor name cannot exceed 200 characters"],
    },
    contact: {
      type: String,
      required: [true, "Contact person is required"],
      trim: true,
      maxlength: [100, "Contact name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
    },
    website: {
      type: String,
      trim: true,
    },
    paymentTerms: {
      type: String,
      trim: true,
      default: "Net 30",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
vendorSchema.index({ name: 1 })
vendorSchema.index({ email: 1 })
vendorSchema.index({ isActive: 1 })

module.exports = mongoose.model("Vendor", vendorSchema)
