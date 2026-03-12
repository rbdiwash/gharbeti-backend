const express = require("express");
const router = express.Router();
const Property = require("../models/Property");

/**
 * @openapi
 * /api/properties:
 *   post:
 *     summary: Create a new property
 *     tags: [Properties]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [landlordId, name, address]
 *             properties:
 *               landlordId: { type: string }
 *               name: { type: string }
 *               address: { type: string }
 *               totalRooms: { type: number }
 *               occupiedRooms: { type: number }
 *               description: { type: string }
 *               amenities: { type: array, items: { type: string } }
 *               images: { type: array, items: { type: string } }
 *     responses:
 *       201: { description: Property created }
 *       500: { description: Server error }
 */
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

/**
 * @openapi
 * /api/properties/landlord/{landlordId}:
 *   get:
 *     summary: Get all properties for a landlord
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: landlordId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of properties }
 *       500: { description: Server error }
 */
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

/**
 * @openapi
 * /api/properties/{propertyId}:
 *   get:
 *     summary: Get a property by ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Property details }
 *       404: { description: Property not found }
 *       500: { description: Server error }
 */
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

/**
 * @openapi
 * /api/properties/{propertyId}:
 *   put:
 *     summary: Update a property
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               address: { type: string }
 *               totalRooms: { type: number }
 *               occupiedRooms: { type: number }
 *               description: { type: string }
 *               amenities: { type: array }
 *               images: { type: array }
 *     responses:
 *       200: { description: Property updated }
 *       404: { description: Property not found }
 *       500: { description: Server error }
 */
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

/**
 * @openapi
 * /api/properties/{propertyId}:
 *   delete:
 *     summary: Delete a property
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Property deleted successfully }
 *       404: { description: Property not found }
 *       500: { description: Server error }
 */
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
