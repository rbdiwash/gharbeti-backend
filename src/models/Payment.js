const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: false,
    },
    paymentDate: {
      type: Date,
      required: false,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bankTransfer", "esewa", "other"],
      required: false,
    },
    nextDueDate: {
      type: Date,
      required: false,
    },
    nextDueAmount: {
      type: Number,
      required: false,
    },
    latePayment: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
    },
    attachments: [
      {
        type: String, // URLs to stored files
      },
    ],
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "verified"],
      default: "pending",
    },
    transactionId: {
      type: String, // For eSewa or other payment gateway transactions
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verificationDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
