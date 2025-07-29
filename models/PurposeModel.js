// models/purposeModel.js
const mongoose = require("mongoose");

const purposeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Purpose title is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Purpose", purposeSchema);
