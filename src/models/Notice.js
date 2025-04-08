const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // Example: "Maintenance", "General", "Urgent"
    title: { type: String, required: true },
    description: { type: String, required: true },
    isImportant: { type: Boolean, default: false },
    effectiveDate: { type: Date, required: true },
    images: [{ type: String }], // Array of image URLs
    contactPerson: { type: String, required: false },
    contactNumber: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notice", noticeSchema);
