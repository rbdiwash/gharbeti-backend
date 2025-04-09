const mongoose = require("mongoose");

const updateSchema = new mongoose.Schema({
  updateType: {
    type: String,
    enum: ["statusChange", "comment"],
    required: true,
  },
  status: String,
  comment: String,
  updatedBy: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const maintenanceSchema = new mongoose.Schema(
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
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
    photos: [String],
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },
    updates: [updateSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Maintenance", maintenanceSchema);
