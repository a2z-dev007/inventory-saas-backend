const mongoose = require("mongoose")

const purchaseReturnItemSchema = new mongoose.Schema({
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
    total: {
        type: Number,
        required: true,
        min: [0, "Total cannot be negative"],
    },
})

const purchaseReturnSchema = new mongoose.Schema(
    {
        ref_num: {
            type: String,
            unique: true,
            trim: true,
            index: true,
            required: [true, "Return Number is required"],
        },
        vendor: {
            type: String,
            required: [true, "Vendor is required"],
            trim: true,
        },
        returnDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        items: [purchaseReturnItemSchema],
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
    },
    {
        timestamps: true,
    },
)

purchaseReturnSchema.index({ receiptNumber: 1 })
purchaseReturnSchema.index({ vendor: 1 })
purchaseReturnSchema.index({ returnDate: -1 })
purchaseReturnSchema.index({ createdBy: 1 })

module.exports = mongoose.model("PurchaseReturn", purchaseReturnSchema)
