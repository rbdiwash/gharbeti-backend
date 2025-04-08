const mongoose = require("mongoose");

const landLordProfile = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String },
    location: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ["landlord", "tenant"], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notice", landLordProfile);
