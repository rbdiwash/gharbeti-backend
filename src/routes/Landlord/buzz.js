const express = require("express");
const Buzz = require("../../models/Landlord/buzz");
const Notification = require("../../models/Notification");

const router = express.Router();

// 🔔 POST - Buzz a tenant
router.post("/", async (req, res) => {
  const { tenantId, landlordId, message, dueAmount } = req.body;

  if (!tenantId || !landlordId || !message || !dueAmount) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const buzz = new Buzz({ tenantId, landlordId, message, dueAmount });
    await buzz.save();
    const notification = new Notification({
      senderId: landlordId,
      recipientId: tenantId,
      title: "Buzz",
      message: `You have been buzzed for Rs. ${dueAmount}: ${message}`,
      type: "buzz",
    });
    await notification.save();
    res.status(201).json({
      message: "Buzz sent and notification delivered",
      buzz,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to send buzz", details: error.message });
  }
});

// 📋 GET - All buzzes for a tenant
router.get("/tenant/:tenantId", async (req, res) => {
  try {
    const buzzes = await Buzz.find({ tenantId: req.params.tenantId }).populate(
      "landlordId",
      "name",
    );
    res.json(buzzes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch buzzes" });
  }
});

module.exports = router;
