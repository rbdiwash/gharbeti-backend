const express = require("express");
const LeaseAgreement = require("../models/LeaseAgreement");
const router = express.Router();

// 🟢 Add/Update Lease Agreement (Landlord)
router.post("/", async (req, res) => {
  const { landlordId, agreementPoints } = req.body;

  if (!landlordId || !Array.isArray(agreementPoints)) {
    return res.status(400).json({
      success: false,
      message: "Invalid input",
      details: {
        landlordId: !landlordId ? "Missing landlordId" : "Valid",
        agreementPoints: !Array.isArray(agreementPoints)
          ? "Must be an array"
          : "Valid",
      },
    });
  }

  try {
    // Find existing agreement
    const existingAgreement = await LeaseAgreement.findOne({ landlordId });

    let saved;
    if (existingAgreement) {
      // Update existing agreement
      existingAgreement.agreementPoints = agreementPoints;
      saved = await existingAgreement.save();
    } else {
      // Create new agreement if none exists
      const newAgreement = new LeaseAgreement({ landlordId, agreementPoints });
      saved = await newAgreement.save();
    }

    res.status(200).json({
      success: true,
      message: existingAgreement
        ? "Lease agreement updated successfully"
        : "Lease agreement created successfully",
      agreement: saved,
    });
  } catch (err) {
    console.error("Error saving lease agreement:", err);
    res.status(500).json({
      success: false,
      message: "Error saving lease agreement",
      error: err.message,
    });
  }
});

// 🔵 Get Lease Agreement by Landlord ID
router.get("/:landlordId", async (req, res) => {
  try {
    const leases = await LeaseAgreement.findOne({
      landlordId: req.params.landlordId,
    })
      .populate("landlordId", "name email")
      .sort({ createdAt: -1 }); // Get all agreements, sorted by newest first

    if (!leases || leases.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No agreements found for this landlord",
      });
    }

    res.json({
      success: true,
      agreements: leases,
      count: leases.length,
    });
  } catch (err) {
    console.error("Error fetching lease agreements:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching lease agreements",
      error: err.message,
    });
  }
});

// Update lease agreement by ID
router.patch("/:id", async (req, res) => {
  try {
    const { agreementPoints } = req.body;

    if (!Array.isArray(agreementPoints)) {
      return res.status(400).json({
        success: false,
        message: "agreementPoints must be an array",
      });
    }

    const updated = await LeaseAgreement.findByIdAndUpdate(
      req.params.id,
      { agreementPoints },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Lease agreement not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lease agreement updated successfully",
      agreement: updated,
    });
  } catch (error) {
    console.error("Error updating lease agreement:", error);
    res.status(500).json({
      success: false,
      message: "Error updating lease agreement",
      error: error.message,
    });
  }
});

module.exports = router;
