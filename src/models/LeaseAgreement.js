const mongoose = require("mongoose");

const leaseAgreementSchema = new mongoose.Schema(
  {
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    agreementPoints: {
      type: [String], // Each bullet point as a string
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeaseAgreement", leaseAgreementSchema);
