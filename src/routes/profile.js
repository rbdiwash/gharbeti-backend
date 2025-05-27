const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/authController");

// Get user profile
router.get("/:userId", getProfile);

// Update user profile
router.put("/:userId", updateProfile);

module.exports = router;
