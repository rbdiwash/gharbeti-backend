const express = require("express");
const router = express.Router();
const Maintenance = require("../models/Maintenance");

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

// 🔵 Get All Maintenance Requests (Optional filter by landlord or tenant)
router.get("/", async (req, res) => {
  const { landlordId, tenantId, status } = req.query;

  const filter = {};
  if (landlordId) filter.landlordId = landlordId;
  if (tenantId) filter.tenantId = tenantId;
  if (status) {
    filter.status = status;
  } else {
    filter.status = "Pending"; // Default to Pending if status is not provided
  }
  try {
    const requests = await Maintenance.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
