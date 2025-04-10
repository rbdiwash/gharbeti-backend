const express = require("express");
const router = express.Router();
const Tenant = require("../models/Tenant");
const { v4: uuidv4 } = require("uuid");

// Invite Tenant
router.post("/invite", async (req, res) => {
  try {
    const {
      name,
      address,
      phoneNumber,
      email,
      noOfRooms,
      totalRentPerMonth,
      startingDate,
      emergencyContactName,
      emergencyContactNumber,
      documentUrl,
      landlordId,
      profileImage,
    } = req.body;

    const invitationCode = uuidv4().slice(0, 6).toUpperCase();

    const newTenant = new Tenant({
      name,
      address,
      phoneNumber,
      email,
      noOfRooms,
      totalRentPerMonth,
      startingDate,
      emergencyContactName,
      emergencyContactNumber,
      documentUrl,
      landlordId,
      invitationCode,
      profileImage,
    });

    await newTenant.save();
    res.status(201).json({
      message: "Tenant invited successfully.",
      invitationCode,
      data: { invitationCode, email, name },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify Invitation
router.post("/verify", async (req, res) => {
  const { email, invitationCode } = req.body;

  try {
    const tenant = await Tenant.findOne({ email, invitationCode });

    if (!tenant) {
      return res.status(404).json({ message: "Invalid invitation." });
    }

    tenant.isVerified = true;
    await tenant.save();

    res.status(200).json({ message: "Tenant verified successfully.", tenant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
