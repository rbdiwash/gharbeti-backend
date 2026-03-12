const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const User = require("../models/User");
const { calculateRentDue } = require("../utils/rentCalculator");

/**
 * @openapi
 * /api/payments/tenant/{tenantId}/due:
 *   get:
 *     summary: Get rent due for a tenant
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Rent due info }
 *       404: { description: Tenant not found }
 *       500: { description: Server error }
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
 * @openapi
 * /api/payments:
 *   post:
 *     summary: Record a new payment
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tenantId, landlordId, amount, paymentMethod]
 *             properties:
 *               tenantId: { type: string }
 *               landlordId: { type: string }
 *               amount: { type: number }
 *               paymentDate: { type: string, format: date-time }
 *               paymentMethod: { type: string }
 *               nextDueDate: { type: string }
 *               nextDueAmount: { type: number }
 *               latePayment: { type: boolean }
 *               notes: { type: string }
 *               attachments: { type: array }
 *               transactionId: { type: string }
 *     responses:
 *       201: { description: Payment recorded successfully }
 *       500: { description: Server error }
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
 * @openapi
 * /api/payments/tenant/{tenantId}:
 *   get:
 *     summary: Get payment history for a tenant
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of payments }
 *       500: { description: Server error }
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
 * @openapi
 * /api/payments/landlord/{landlordId}:
 *   get:
 *     summary: Get all payments for a landlord's tenants
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: landlordId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of payments }
 *       500: { description: Server error }
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
 * @openapi
 * /api/payments/{paymentId}/verify:
 *   post:
 *     summary: Verify a payment (landlord only)
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               verifiedBy: { type: string }
 *     responses:
 *       200: { description: Payment verified }
 *       404: { description: Payment not found }
 *       500: { description: Server error }
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
