const mongoose = require("mongoose");

const unitTypeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("UnitType", unitTypeSchema);
