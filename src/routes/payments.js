const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const User = require("../models/User");
const { calculateRentDue } = require("../utils/rentCalculator");

/**
 * @swagger
 * /api/payments/tenant/{tenantId}/due:
 *   get:
 *     summary: Get rent due for a tenant
 *     tags: [Payments]
 */
router.get("/tenant/:tenantId/due", async (req, res) => {
  try {
    const tenant = await User.findById(req.params.tenantId);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Get the last payment
    const lastPayment = await Payment.findOne({ tenantId: tenant._id }).sort({
      paymentDate: -1,
    });

    const rentDue = calculateRentDue(
      tenant.startingDate,
      tenant.totalRentPerMonth,
      lastPayment?.paymentDate
    );

    res.json({
      success: true,
      data: {
        tenant: {
          name: tenant.name,
          email: tenant.email,
        },
        rentDue: rentDue.totalDue,
        monthsDue: rentDue.monthsDue,
        nextDueDate: rentDue.nextDueDate,
        isLate: rentDue.isLate,
        lastPayment: lastPayment
          ? {
              amount: lastPayment.amount,
              date: lastPayment.paymentDate,
              method: lastPayment.paymentMethod,
            }
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Record a new payment
 *     tags: [Payments]
 */
router.post("/", async (req, res) => {
  try {
    const {
      tenantId,
      landlordId,
      amount,
      paymentDate,
      paymentMethod,
      nextDueDate,
      nextDueAmount,
      latePayment,
      notes,
      attachments,
      transactionId,
    } = req.body;

    // Create and save payment record
    const payment = new Payment({
      tenantId,
      landlordId,
      amount,
      paymentDate: paymentDate || new Date(),
      paymentMethod,
      nextDueDate,
      nextDueAmount,
      latePayment,
      notes,
      attachments,
      transactionId,
      status: paymentMethod === "esewa" ? "pending" : "completed",
    });

    const savedPayment = await payment.save();

    // Update tenant's payment tracking fields
    const tenant = await User.findById(tenantId);
    if (tenant) {
      // Update payment tracking fields
      tenant.lastPaymentDate = savedPayment.paymentDate;
      tenant.lastPaymentAmount = savedPayment.amount;
      tenant.nextDueDate = savedPayment.nextDueDate;
      tenant.nextDueAmount = savedPayment.nextDueAmount;

      // Calculate total paid amount
      const totalPayments = await Payment.aggregate([
        { $match: { tenantId: tenant._id } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      tenant.totalPaidAmount = totalPayments[0]?.total || 0;

      await tenant.save();
    }

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      payment: savedPayment,
      tenant: {
        nextDueDate: tenant.nextDueDate,
        nextDueAmount: tenant.nextDueAmount,
        totalPaidAmount: tenant.totalPaidAmount,
        lastPaymentDate: tenant.lastPaymentDate,
        lastPaymentAmount: tenant.lastPaymentAmount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/payments/tenant/{tenantId}:
 *   get:
 *     summary: Get payment history for a tenant
 *     tags: [Payments]
 */
router.get("/tenant/:tenantId", async (req, res) => {
  try {
    const payments = await Payment.find({ tenantId: req.params.tenantId })
      .sort({ paymentDate: -1 })
      .populate("landlordId", "name email");

    res.json({
      success: true,
      payments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/payments/landlord/{landlordId}:
 *   get:
 *     summary: Get all payments for a landlord's tenants
 *     tags: [Payments]
 */
router.get("/landlord/:landlordId", async (req, res) => {
  try {
    const payments = await Payment.find({ landlordId: req.params.landlordId })
      .sort({ paymentDate: -1 })
      .populate("tenantId", "name email");

    res.json({
      success: true,
      payments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/payments/{paymentId}/verify:
 *   post:
 *     summary: Verify a payment (landlord only)
 *     tags: [Payments]
 */
router.post("/:paymentId/verify", async (req, res) => {
  try {
    const { verifiedBy } = req.body;
    const payment = await Payment.findById(req.params.paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.status = "verified";
    payment.verifiedBy = verifiedBy;
    payment.verificationDate = new Date();
    await payment.save();

    res.json({
      success: true,
      message: "Payment verified successfully",
      payment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
