// models/categoryModel.js
const mongoose = require("mongoose");

const productCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      maxlength: [100, "Category name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    image: {
      type: String, // URL or base64 string
      default: null,
    },
    unitType: {
      type: String,
      // required: [true, "Unit type is required"],
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
  }
);

module.exports = mongoose.model("Category", productCategorySchema);
