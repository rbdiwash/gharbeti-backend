const mongoose = require("mongoose");

const buzzSchema = new mongoose.Schema({
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
  message: {
    type: String,
    required: true,
  },
  dueAmount: {
    type: Number,
    required: false,
  },
  buzzDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Buzz", buzzSchema);
