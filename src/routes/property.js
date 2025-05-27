const express = require("express");
const router = express.Router();
const Property = require("../models/Property");

// Create a new property
router.post("/", async (req, res) => {
  try {
    const {
      landlordId,
      name,
      address,
      totalRooms,
      occupiedRooms,
      description,
      amenities,
      images,
    } = req.body;

    const property = new Property({
      landlordId,
      name,
      address,
      totalRooms,
      occupiedRooms,
      description,
      amenities,
      images,
    });

    const savedProperty = await property.save();
    res.status(201).json(savedProperty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all properties for a landlord
router.get("/landlord/:landlordId", async (req, res) => {
  try {
    const properties = await Property.find({
      landlordId: req.params.landlordId,
    });
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific property
router.get("/:propertyId", async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a property
router.put("/:propertyId", async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.propertyId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedProperty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a property
router.delete("/:propertyId", async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    await Property.findByIdAndDelete(req.params.propertyId);
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
