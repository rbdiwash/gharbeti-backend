const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String },
    address: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ["landlord", "tenant"], required: true },
    totalRooms: { type: Number, default: 0 },
    totalRentPerMonth: { type: Number, default: 0 },
    noOfRooms: { type: Number, default: 0 },
    startingDate: { type: Date },
    emergencyContactName: { type: String },
    emergencyContactNumber: { type: String },
    documentUrl: { type: String },
    profileImage: { type: String },
    isVerified: { type: Boolean, default: false },
    inviteAccepted: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    documentsVerified: { type: Boolean, default: false },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    landlordId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("User", UserSchema);
