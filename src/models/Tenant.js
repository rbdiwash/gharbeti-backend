const mongoose = require("mongoose");

const TenantSchema = new mongoose.Schema(
  {
    name: String,
    address: String,
    phoneNumber: String,
    email: { type: String, required: true },
    noOfRooms: Number,
    totalRentPerMonth: Number,
    startingDate: Date,
    emergencyContactName: String,
    emergencyContactNumber: String,
    profileImage: String,
    documentUrl: String, // Assume file upload stores a URL
    invitationCode: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tenant", TenantSchema);
