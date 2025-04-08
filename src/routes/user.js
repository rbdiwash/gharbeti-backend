// routes/users.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET all registered users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude passwords
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Get all landlords
router.get("/landlords", async (req, res) => {
  try {
    const landlords = await User.find({ role: "landlord" });
    res.status(200).json(landlords);
  } catch (error) {
    res.status(500).json({ message: "Error fetching landlords", error });
  }
});

// GET tenants by landlordId
router.get("/tenants/:landlordId", async (req, res) => {
  const { landlordId } = req.params;

  //  If you want tenant data along with landlord info populated:

  try {
    const tenants = await User.find({
      role: "tenant",
      landlordId: landlordId,
    }).populate("landlordId", "name email");

    res.status(200).json(tenants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tenants", error });
  }
});
module.exports = router;
