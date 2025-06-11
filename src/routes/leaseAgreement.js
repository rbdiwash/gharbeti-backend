const express = require("express");
const LeaseAgreement = require("../models/LeaseAgreement");
const router = express.Router();

/**
 * @swagger
 * /api/lease-agreements:
 *   post:
 *     summary: Create or update a lease agreement
 *     tags: [Lease Agreements]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - landlordId
 *               - agreementPoints
 *             properties:
 *               landlordId:
 *                 type: string
 *                 description: ID of the landlord
 *               agreementPoints:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of agreement points
 *     responses:
 *       200:
 *         description: Lease agreement created or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 agreement:
 *                   $ref: '#/components/schemas/LeaseAgreement'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/lease-agreements/{landlordId}:
 *   get:
 *     summary: Get lease agreement by landlord ID
 *     tags: [Lease Agreements]
 *     parameters:
 *       - in: path
 *         name: landlordId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the landlord
 *     responses:
 *       200:
 *         description: Lease agreement found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 agreement:
 *                   $ref: '#/components/schemas/LeaseAgreement'
 *       404:
 *         description: No agreement found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/lease-agreements/{id}:
 *   patch:
 *     summary: Update lease agreement by ID
 *     tags: [Lease Agreements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the lease agreement
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agreementPoints
 *             properties:
 *               agreementPoints:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of agreement points
 *     responses:
 *       200:
 *         description: Lease agreement updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 agreement:
 *                   $ref: '#/components/schemas/LeaseAgreement'
 *       404:
 *         description: Lease agreement not found
 *       500:
 *         description: Server error
 */
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
