// routes/users.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Tenant = require("../models/Tenant");
const bcrypt = require("bcryptjs");

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

// GET all tenants or tenants by landlordId
router.get("/tenants", async (req, res) => {
  try {
    const { landlordId } = req.query;
    const filter = { role: "tenant" };

    if (landlordId) {
      filter.landlordId = landlordId;
    }

    const tenants = await User.find(filter)
      .populate("landlordId", "name email")
      .select("-password");

    res.status(200).json(tenants);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching tenants", error: error.message });
  }
});

// GET tenants by specific landlordId
router.get("/tenants/:landlordId", async (req, res) => {
  const { landlordId } = req.params;

  try {
    const tenants = await User.find({
      role: "tenant",
      landlordId: landlordId,
    })
      .populate("landlordId", "name email")
      .select("-password");

    res.status(200).json(tenants);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching tenants", error: error.message });
  }
});

router.post("/change-password", async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  console.log("Change password request body:", req.body);

  // Validate required fields
  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
      required: ["email", "currentPassword", "newPassword"],
      received: {
        email,
        currentPassword: !!currentPassword,
        newPassword: !!newPassword,
      },
    });
  }

  try {
    // Find the user
    const user = await User.findOne({ email });
    console.log("Found user:", user ? "Yes" : "No");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    console.log("Password match:", isMatch ? "Yes" : "No");

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
        error: "INVALID_PASSWORD",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Reset password (forgot password scenario)
router.post("/reset-password", async (req, res) => {
  const { email, invitationCode, newPassword } = req.body;

  try {
    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // For tenants, verify invitation code
    if (user.role === "tenant") {
      const tenant = await Tenant.findOne({ email, invitationCode });
      if (!tenant) {
        return res
          .status(404)
          .json({ message: "Invalid email or invitation code" });
      }

      // Update tenant status
      tenant.inviteAccepted = true;
      tenant.isVerified = true;
      tenant.active = true;
      await tenant.save();
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password reset successfully",
      data: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res
      .status(500)
      .json({ message: "Error resetting password", error: error.message });
  }
});

module.exports = router;
