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

module.exports = router;
