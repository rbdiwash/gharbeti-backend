const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String },
    location: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ["landlord", "tenant"], required: true },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "landlord", // refers to the landlord
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
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
