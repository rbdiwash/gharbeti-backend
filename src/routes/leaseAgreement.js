const express = require("express");
const LeaseAgreement = require("../models/LeaseAgreement");
const router = express.Router();

// 🟢 Add Lease Agreement (Landlord)
router.post("/", async (req, res) => {
  const { landlordId, agreementPoints } = req.body;

  if (!landlordId || !Array.isArray(agreementPoints)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    const newAgreement = new LeaseAgreement({ landlordId, agreementPoints });
    const saved = await newAgreement.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔵 Get Lease Agreement by Landlord ID
router.get("/:landlordId", async (req, res) => {
  try {
    const lease = await LeaseAgreement.findOne({
      landlordId: req.params.landlordId,
    });
    if (!lease) {
      return res.status(404).json({ message: "No agreement found" });
    }
    res.json(lease);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔵 Get Lease Agreement by Landlord ID
router.get("/:landlordId", async (req, res) => {
  try {
    const lease = await LeaseAgreement.findOne({
      landlordId: req.params.landlordId,
    });
    if (!lease) {
      return res.status(404).json({ message: "No agreement found" });
    }
    res.json(lease);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update lease agreement by ID
router.patch("/:id", async (req, res) => {
  try {
    const { agreementText } = req.body;

    const updated = await LeaseAgreement.findByIdAndUpdate(
      req.params.id,
      { agreementText },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Lease agreement not found." });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating lease agreement:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
