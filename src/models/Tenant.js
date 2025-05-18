const mongoose = require("mongoose");

const TenantSchema = new mongoose.Schema(
  {
    name: String,
    address: String,
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined values to be unique
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
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
    inviteAccepted: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    documentsVerified: { type: Boolean, default: false },
    role: { type: String, default: "tenant" },
    rooms: { type: Number, required: false, default: 0 },
    passwordSet: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Add compound index for email and phoneNumber
TenantSchema.index({ email: 1, phoneNumber: 1 }, { unique: true });

module.exports = mongoose.model("Tenant", TenantSchema);
