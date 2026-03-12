const express = require("express");
const router = express.Router();
const Maintenance = require("../models/Maintenance");
const User = require("../models/User");
const mongoose = require("mongoose");

/**
 * @openapi
 * /api/maintenance:
 *   post:
 *     summary: Create a maintenance request (tenant)
 *     tags: [Maintenance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tenantId: { type: string }
 *               landlordId: { type: string }
 *               description: { type: string }
 *               priority: { type: string }
 *     responses:
 *       201: { description: Maintenance request created }
 *       400: { description: Validation error }
 */
// 🟢 Create Maintenance Request (Tenant)
router.post("/", async (req, res) => {
  try {
    const maintenance = new Maintenance(req.body);
    const saved = await maintenance.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/maintenance:
 *   get:
 *     summary: Get maintenance requests (filter by landlordId, tenantId, status)
 *     tags: [Maintenance]
 *     parameters:
 *       - in: query
 *         name: landlordId
 *         schema: { type: string }
 *       - in: query
 *         name: tenantId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of maintenance requests }
 *       500: { description: Server error }
 */
// 🔵 Get All Maintenance Requests (Optional filter by landlord or tenant)
router.get("/", async (req, res) => {
  try {
    const { landlordId, tenantId, status } = req.query;
    console.log("Query params:", { landlordId, tenantId, status });

    const filter = {};

    // If both tenantId and landlordId are provided, prioritize tenantId
    if (tenantId) {
      // Convert tenantId to ObjectId
      const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
      filter.tenantId = tenantObjectId;
      console.log("Filtering by tenantId:", tenantObjectId);
    } else if (landlordId) {
      // Only apply landlord filter if tenantId is not provided
      // First get all tenants under this landlord
      const tenants = await User.find({
        landlordId: landlordId,
        role: "tenant",
      }).select("_id");

      const tenantIds = tenants.map((tenant) => tenant._id);
      filter.tenantId = { $in: tenantIds };
      console.log("Filtering by landlord's tenants:", tenantIds);
    }

    // Add status filter if provided
    if (status) {
      filter.status = status;
    }

    console.log("Final filter:", JSON.stringify(filter, null, 2));

    // Get maintenance requests with populated tenant and landlord information
    const requests = await Maintenance.find(filter)
      .sort({ createdAt: -1 })
      .populate("tenantId", "name email phoneNumber")
      .populate("landlordId", "name email phoneNumber");

    console.log("Found requests:", requests.length);
    console.log("First request tenantId:", requests[0]?.tenantId?._id);

    res.json(requests);
  } catch (error) {
    console.error("Error fetching maintenance requests:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching maintenance requests",
      error: error.message,
    });
  }
});

/**
 * @openapi
 * /api/maintenance/{id}:
 *   get:
 *     summary: Get a maintenance request by ID
 *     tags: [Maintenance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Maintenance request }
 *       404: { description: Not found }
 *       500: { description: Server error }
 */
// GET maintenance request by ID
router.get("/:id", async (req, res) => {
  console.log(req, res);
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance request not found" });
    }
    res.json(maintenance);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @openapi
 * /api/maintenance/{id}/update:
 *   put:
 *     summary: Update maintenance status or add comment (landlord)
 *     tags: [Maintenance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               updateType: { type: string, enum: [statusChange, comment] }
 *               status: { type: string }
 *               comment: { type: string }
 *               updatedBy: { type: string }
 *     responses:
 *       200: { description: Maintenance request updated }
 *       404: { description: Request not found }
 *       500: { description: Server error }
 */
// 🟡 Update Status or Add Comment (Landlord)
router.put("/:id/update", async (req, res) => {
  const { updateType, status, comment, updatedBy } = req.body;
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    if (!maintenance)
      return res.status(404).json({ message: "Request not found" });

    const update = {
      updateType,
      updatedBy,
      timestamp: new Date(),
    };
    if (updateType === "statusChange") {
      maintenance.status = status;
      update.status = status;
    } else if (updateType === "comment") {
      update.comment = comment;
    }

    maintenance.updates.push(update);
    await maintenance.save();

    res.json(maintenance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
