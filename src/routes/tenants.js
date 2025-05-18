const express = require("express");
const router = express.Router();
const Tenant = require("../models/Tenant");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

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

    // Check if tenant with same email already exists in either collection
    const existingTenantByEmail = await Tenant.findOne({ email });
    const existingUserByEmail = await User.findOne({ email });

    if (existingTenantByEmail || existingUserByEmail) {
      return res.status(400).json({
        error: "A user with this email already exists",
        field: "email",
      });
    }

    // Check if tenant with same phone number already exists in either collection
    if (phoneNumber) {
      const existingTenantByPhone = await Tenant.findOne({ phoneNumber });
      const existingUserByPhone = await User.findOne({ phoneNumber });

      if (existingTenantByPhone || existingUserByPhone) {
        return res.status(400).json({
          error: "A user with this phone number already exists",
          field: "phoneNumber",
        });
      }
    }

    const invitationCode = uuidv4().slice(0, 6).toUpperCase();

    // Create tenant in Tenant collection
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
      isVerified: false,
      inviteAccepted: false,
      active: false,
      documentsVerified: false,
      role: "tenant",
    });

    // Create user in User collection
    const newUser = new User({
      name,
      email,
      phoneNumber,
      role: "tenant",
      landlordId,
      isVerified: false,
      // Generate a temporary password that will be changed when they accept the invitation
      password: invitationCode,
    });

    // Save both documents
    await Promise.all([newTenant.save(), newUser.save()]);

    res.status(201).json({
      message: "Tenant invited successfully.",
      invitationCode,
      data: { invitationCode, email, name },
    });
  } catch (error) {
    console.log("Error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation Error",
        details: Object.values(error.errors).map((err) => err.message),
      });
    }
    res.status(500).json({ error: error.message });
  }
});

// Verify Invitation
router.post("/verify", async (req, res) => {
  console.log("Verifying tenant invitation:", req.body);

  const { email, invitationCode } = req.body;

  try {
    const tenant = await Tenant.findOne({ email, invitationCode });

    console.log(tenant);
    if (tenant.inviteAccepted) {
      return res.status(202).json({
        message: "You have already verified your invitation. Please Proceed",
        status: "already_verified",
      });
    }

    if (!tenant) {
      return res.status(404).json({ message: "Invalid invitation." });
    }

    // Update tenant status
    tenant.isVerified = true;
    tenant.inviteAccepted = true;
    tenant.active = true;
    await tenant.save();

    // Update user status
    const user = await User.findOne({ email, role: "tenant" });
    if (user) {
      user.isVerified = true;
      await user.save();
    }

    res.status(200).json({
      message: "Tenant verified successfully.",
      status: "verified",
      data: {
        tenant,
        user: user
          ? {
              _id: user._id,
              email: user.email,
              name: user.name,
              role: user.role,
              isVerified: user.isVerified,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error verifying tenant:", error);
    res
      .status(500)
      .json({ message: "Error verifying tenant", error: error.message });
  }
});

// Set password after invitation verification
router.post("/set-password", async (req, res) => {
  const { email, invitationCode, password } = req.body;

  try {
    // Find the tenant
    const tenant = await Tenant.findOne({ email, invitationCode });
    if (!tenant) {
      return res
        .status(404)
        .json({ message: "Invalid email or invitation code" });
    }

    // Check if password is already set
    // if (tenant.passwordSet) {
    //   return res.status(202).json({
    //     message: "Password is already set for this account",
    //     status: "password_already_set",
    //   });
    // }

    // Verify that invitation is accepted
    if (!tenant.inviteAccepted) {
      return res
        .status(400)
        .json({ message: "Please verify your invitation first" });
    }

    // Find the user and populate landlord information
    const user = await User.findOne({ email, role: "tenant" }).populate(
      "landlordId",
      "name email phoneNumber location"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user with new password (hashing will be handled by User model)
    user.password = password;
    user.isVerified = true;
    user.passwordSet = true;
    user.active = true;
    await user.save();

    // Update tenant status
    tenant.passwordSet = true;
    tenant.active = true;
    await tenant.save();

    res.status(200).json({
      message: "Password set successfully",
      status: "password_set",
      data: {
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        passwordSet: tenant.passwordSet,
        tenant: tenant,
        token: generateToken(user._id),
        landlord: user.landlordId
          ? {
              _id: user.landlordId._id,
              name: user.landlordId.name,
              email: user.landlordId.email,
              phoneNumber: user.landlordId.phoneNumber,
              location: user.landlordId.location,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error setting password:", error);
    res
      .status(500)
      .json({ message: "Error setting password", error: error.message });
  }
});

router.get("/", async (req, res) => {
  const { landlordId } = req.query;

  try {
    const filter = { role: "tenant" };
    if (landlordId) {
      filter.landlordId = landlordId;
    }

    // Get all tenants from User collection
    const users = await User.find(filter)
      .populate("landlordId", "name email")
      .select("-password")
      .sort({ createdAt: -1 });

    // Get all tenant details from Tenant collection
    const tenantDetails = await Tenant.find({
      email: { $in: users.map((user) => user.email) },
    });

    // Create a map of tenant details by email for easy lookup
    const tenantDetailsMap = tenantDetails.reduce((map, tenant) => {
      map[tenant.email] = tenant;
      return map;
    }, {});

    // Combine user and tenant details into a single object
    const tenantsWithDetails = users.map((user) => {
      const tenantInfo = tenantDetailsMap[user.email];
      return {
        ...user.toObject(),
        ...(tenantInfo ? tenantInfo.toObject() : {}),
        // Remove duplicate fields if any
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        landlordId: user.landlordId,
      };
    });

    res.status(200).json(tenantsWithDetails);
  } catch (error) {
    console.error("Error in GET /api/tenants:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET tenants by landlordId
router.get("/getByLandlordId/:landlordId", async (req, res) => {
  const { landlordId } = req.params;
  try {
    // Get all tenants from User collection
    const users = await User.find({
      role: "tenant",
      landlordId: landlordId,
    })
      .populate("landlordId", "name email")
      .select("-password")
      .sort({ createdAt: -1 });

    // Get all tenant details from Tenant collection
    const tenantDetails = await Tenant.find({
      email: { $in: users.map((user) => user.email) },
    });

    // Create a map of tenant details by email for easy lookup
    const tenantDetailsMap = tenantDetails.reduce((map, tenant) => {
      map[tenant.email] = tenant;
      return map;
    }, {});

    // Combine user and tenant details into a single object
    const tenantsWithDetails = users.map((user) => {
      const tenantInfo = tenantDetailsMap[user.email];
      return {
        ...user.toObject(),
        ...(tenantInfo ? tenantInfo.toObject() : {}),
        // Remove duplicate fields if any
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        landlordId: user.landlordId,
      };
    });

    res.status(200).json(tenantsWithDetails);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching tenants", error: error.message });
  }
});

// Update tenant details
router.put("/:tenantId", async (req, res) => {
  const { tenantId } = req.params;
  const updateData = req.body;
  console.log(req.params);
  try {
    // Find the tenant in User collection
    const user = await User.findOne({ _id: tenantId, role: "tenant" });
    if (!user) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Find the tenant in Tenant collection
    const tenant = await Tenant.findOne({ email: user.email });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant details not found" });
    }

    // Separate User and Tenant fields
    const userFields = ["name", "email", "phoneNumber", "location"];
    const tenantFields = [
      "address",
      "noOfRooms",
      "totalRentPerMonth",
      "startingDate",
      "emergencyContactName",
      "emergencyContactNumber",
      "documentUrl",
      "profileImage",
      "isVerified",
      "inviteAccepted",
      "active",
      "documentsVerified",
    ];

    // Update User fields
    const userUpdates = {};
    userFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        userUpdates[field] = updateData[field];
      }
    });

    // Update Tenant fields
    const tenantUpdates = {};
    tenantFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        tenantUpdates[field] = updateData[field];
      }
    });

    // Update both documents
    const [updatedUser, updatedTenant] = await Promise.all([
      User.findByIdAndUpdate(
        tenantId,
        { $set: userUpdates },
        { new: true, runValidators: true }
      ).select("-password"),
      Tenant.findByIdAndUpdate(
        tenant._id,
        { $set: tenantUpdates },
        { new: true, runValidators: true }
      ),
    ]);

    // Combine the updated data
    const updatedData = {
      ...updatedUser.toObject(),
      ...updatedTenant.toObject(),
      // Ensure core fields are from User model
      _id: updatedUser._id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      landlordId: updatedUser.landlordId,
    };

    res.status(200).json({
      message: "Tenant details updated successfully",
      data: updatedData,
    });
  } catch (error) {
    console.error("Error updating tenant:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation Error",
        details: Object.values(error.errors).map((err) => err.message),
      });
    }
    res
      .status(500)
      .json({ message: "Error updating tenant", error: error.message });
  }
});

// Delete tenant
router.delete("/:tenantId", async (req, res) => {
  const { tenantId } = req.params;
  console.log("Deleting tenant:", tenantId);

  try {
    // Find the tenant in User collection
    const user = await User.findOne({ _id: tenantId, role: "tenant" });
    if (!user) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Find the tenant in Tenant collection
    const tenant = await Tenant.findOne({ email: user.email });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant details not found" });
    }

    // Delete from both collections
    await Promise.all([
      User.findByIdAndDelete(tenantId),
      Tenant.findByIdAndDelete(tenant._id),
    ]);

    res.status(200).json({
      message: "Tenant deleted successfully",
      data: {
        userId: tenantId,
        tenantId: tenant._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error deleting tenant:", error);
    res
      .status(500)
      .json({ message: "Error deleting tenant", error: error.message });
  }
});

module.exports = router;
