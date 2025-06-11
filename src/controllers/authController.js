const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const Tenant = require("../models/Tenant");
const Property = require("../models/Property");

// Register User
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    // Create user with all fields from request body
    const user = await User.create({
      name,
      email,
      password,
      role,
      ...req.body, // This will include all other fields from the request body
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        landlordId: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        role: user.role,
        totalRooms: user.totalRooms,
        token: generateToken(user._id),
        // Include all other fields from the user object
        ...user.toObject(),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate(
      "landlordId",
      "name email phoneNumber address totalRooms profileImage"
    );

    if (user && (await bcrypt.compare(password, user.password))) {
      const response = {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      };

      // If user is a tenant, add landlord details
      if (user.role === "tenant" && user.landlordId) {
        response.landlord = {
          _id: user.landlordId._id,
          name: user.landlordId.name,
          email: user.landlordId.email,
          phoneNumber: user.landlordId.phoneNumber,
          address: user.landlordId.address,
          totalRooms: user.landlordId.totalRooms,
          profileImage: user.landlordId.profileImage,
        };

        // Get complete tenant details
        const tenantDetails = await Tenant.findOne({ email: user.email });
        if (tenantDetails) {
          response.tenantDetails = {
            address: tenantDetails.address,
            phoneNumber: tenantDetails.phoneNumber,
            noOfRooms: tenantDetails.noOfRooms,
            totalRentPerMonth: tenantDetails.totalRentPerMonth,
            startingDate: tenantDetails.startingDate,
            emergencyContactName: tenantDetails.emergencyContactName,
            emergencyContactNumber: tenantDetails.emergencyContactNumber,
            documentUrl: tenantDetails.documentUrl,
            profileImage: tenantDetails.profileImage,
            isVerified: tenantDetails.isVerified,
            inviteAccepted: tenantDetails.inviteAccepted,
            active: tenantDetails.active,
            documentsVerified: tenantDetails.documentsVerified,
          };
        }
      }

      // If user is a landlord, get all their tenants' details
      if (user.role === "landlord") {
        const tenants = await User.find({
          landlordId: user._id,
          role: "tenant",
        });
        const tenantEmails = tenants.map((tenant) => tenant.email);

        const tenantDetails = await Tenant.find({
          email: { $in: tenantEmails },
        });

        response.tenants = tenants.map((tenant) => {
          const tenantInfo = tenantDetails.find(
            (t) => t.email === tenant.email
          );
          return {
            _id: tenant._id,
            name: tenant.name,
            email: tenant.email,
            phoneNumber: tenant.phoneNumber,
            tenantDetails: tenantInfo
              ? {
                  address: tenantInfo.address,
                  noOfRooms: tenantInfo.noOfRooms,
                  totalRentPerMonth: tenantInfo.totalRentPerMonth,
                  startingDate: tenantInfo.startingDate,
                  emergencyContactName: tenantInfo.emergencyContactName,
                  emergencyContactNumber: tenantInfo.emergencyContactNumber,
                  documentUrl: tenantInfo.documentUrl,
                  profileImage: tenantInfo.profileImage,
                  isVerified: tenantInfo.isVerified,
                  inviteAccepted: tenantInfo.inviteAccepted,
                  active: tenantInfo.active,
                  documentsVerified: tenantInfo.documentsVerified,
                }
              : null,
          };
        });
      }

      res.json(response);
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, 10);
    // user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate(
      "landlordId",
      "name email phoneNumber address totalRooms profileImage"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const response = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address,
      totalRooms: user.totalRooms,
      role: user.role,
      createdAt: user.createdAt,
      isVerified: user.isVerified,
      // Include all user model fields
      userDetails: {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        totalRooms: user.totalRooms,
        role: user.role,
        createdAt: user.createdAt,
        isVerified: user.isVerified,
        updatedAt: user.updatedAt,
      },
    };

    // If user is a tenant, add landlord and tenant details
    if (user.role === "tenant" && user.landlordId) {
      response.landlord = {
        _id: user.landlordId._id,
        name: user.landlordId.name,
        email: user.landlordId.email,
        phoneNumber: user.landlordId.phoneNumber,
        address: user.landlordId.address,
        totalRooms: user.landlordId.totalRooms,
        profileImage: user.landlordId.profileImage,
      };

      const tenantDetails = await Tenant.findOne({ email: user.email });
      if (tenantDetails) {
        response.tenantDetails = {
          address: tenantDetails.address,
          phoneNumber: tenantDetails.phoneNumber,
          noOfRooms: tenantDetails.noOfRooms,
          totalRentPerMonth: tenantDetails.totalRentPerMonth,
          startingDate: tenantDetails.startingDate,
          emergencyContactName: tenantDetails.emergencyContactName,
          emergencyContactNumber: tenantDetails.emergencyContactNumber,
          documentUrl: tenantDetails.documentUrl,
          profileImage: tenantDetails.profileImage,
          isVerified: tenantDetails.isVerified,
          inviteAccepted: tenantDetails.inviteAccepted,
          active: tenantDetails.active,
          documentsVerified: tenantDetails.documentsVerified,
        };
      }
    }

    // If user is a landlord, get all their properties and tenants
    if (user.role === "landlord") {
      // Get properties
      const properties = await Property.find({ landlordId: user._id });
      response.properties = properties;

      // Get tenants
      const tenants = await User.find({ landlordId: user._id, role: "tenant" });
      const tenantEmails = tenants.map((tenant) => tenant.email);

      const tenantDetails = await Tenant.find({ email: { $in: tenantEmails } });

      response.tenants = tenants.map((tenant) => {
        const tenantInfo = tenantDetails.find((t) => t.email === tenant.email);
        return {
          _id: tenant._id,
          name: tenant.name,
          email: tenant.email,
          phoneNumber: tenant.phoneNumber,
          createdAt: tenant.createdAt,
          isVerified: tenant.isVerified,
          tenantDetails: tenantInfo
            ? {
                address: tenantInfo.address,
                noOfRooms: tenantInfo.noOfRooms,
                totalRentPerMonth: tenantInfo.totalRentPerMonth,
                startingDate: tenantInfo.startingDate,
                emergencyContactName: tenantInfo.emergencyContactName,
                emergencyContactNumber: tenantInfo.emergencyContactNumber,
                documentUrl: tenantInfo.documentUrl,
                profileImage: tenantInfo.profileImage,
                isVerified: tenantInfo.isVerified,
                inviteAccepted: tenantInfo.inviteAccepted,
                active: tenantInfo.active,
                documentsVerified: tenantInfo.documentsVerified,
              }
            : null,
        };
      });

      // Add property statistics
      response.propertyStats = {
        totalProperties: properties.length,
        totalRooms: properties.reduce(
          (sum, prop) => sum + (prop.totalRooms || 0),
          0
        ),
        occupiedRooms: properties.reduce(
          (sum, prop) => sum + (prop.occupiedRooms || 0),
          0
        ),
        availableRooms: properties.reduce(
          (sum, prop) =>
            sum + ((prop.totalRooms || 0) - (prop.occupiedRooms || 0)),
          0
        ),
      };
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User Profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fields that can be updated for all users
    const allowedFields = [
      "name",
      "phoneNumber",
      "address",
      "totalRooms",
      "profileImage",
    ];
    const updates = {};

    // Check which fields are being updated
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Update user basic information
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate(
      "landlordId",
      "name email phoneNumber address totalRooms profileImage"
    );

    const response = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      address: updatedUser.address,
      role: updatedUser.role,
      totalRooms: updatedUser.totalRooms,
      profileImage: updatedUser.profileImage,
    };

    // If user is a tenant, update tenant-specific fields
    if (user.role === "tenant") {
      const tenantUpdates = {};
      const tenantFields = [
        "address",
        "emergencyContactName",
        "emergencyContactNumber",
        "documentUrl",
        "profileImage",
        "totalRentPerMonth",
        "noOfRooms",
        "startingDate",
      ];

      tenantFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          tenantUpdates[field] = req.body[field];
        }
      });

      if (Object.keys(tenantUpdates).length > 0) {
        const updatedTenant = await Tenant.findOneAndUpdate(
          { email: user.email },
          { $set: tenantUpdates },
          { new: true, runValidators: true }
        );

        if (updatedTenant) {
          response.tenantDetails = {
            address: updatedTenant.address,
            phoneNumber: updatedTenant.phoneNumber,
            noOfRooms: updatedTenant.noOfRooms,
            totalRentPerMonth: updatedTenant.totalRentPerMonth,
            startingDate: updatedTenant.startingDate,
            emergencyContactName: updatedTenant.emergencyContactName,
            emergencyContactNumber: updatedTenant.emergencyContactNumber,
            documentUrl: updatedTenant.documentUrl,
            profileImage: updatedTenant.profileImage,
            isVerified: updatedTenant.isVerified,
            inviteAccepted: updatedTenant.inviteAccepted,
            active: updatedTenant.active,
            documentsVerified: updatedTenant.documentsVerified,
          };
        }
      }

      // Add landlord information
      if (updatedUser.landlordId) {
        response.landlord = {
          _id: updatedUser.landlordId._id,
          name: updatedUser.landlordId.name,
          email: updatedUser.landlordId.email,
          phoneNumber: updatedUser.landlordId.phoneNumber,
          address: updatedUser.landlordId.address,
          totalRooms: updatedUser.landlordId.totalRooms,
          profileImage: updatedUser.landlordId.profileImage,
        };
      }
    }

    res.json({
      message: "Profile updated successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  resetPassword,
};
