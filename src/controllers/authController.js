const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const Tenant = require("../models/Tenant");

// Register User
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, role });

    if (user) {
      res.status(201).json({
        _id: user.id,
        landlordId: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        location: user.location,
        role: user.role,
        token: generateToken(user._id),
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
      "name email phoneNumber location"
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
          location: user.landlordId.location,
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

module.exports = { registerUser, loginUser };
