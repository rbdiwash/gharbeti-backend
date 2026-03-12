const express = require("express");
const {
  registerUser,
  loginUser,
  resetPassword,
  forgotPassword,
  verifyOtp,
} = require("../controllers/authController");
const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string }
 *               role: { type: string, enum: [landlord, tenant] }
 *               phoneNumber: { type: string }
 *               address: { type: string }
 *     responses:
 *       201: { description: User registered successfully }
 *       400: { description: User already exists or invalid data }
 *       500: { description: Server error }
 */
router.post("/register", registerUser);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful, returns user and token }
 *       401: { description: Invalid email or password }
 *       500: { description: Server error }
 */
router.post("/login", loginUser);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset (sends OTP to email)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, phoneNumber]
 *             properties:
 *               email: { type: string }
 *               phoneNumber: { type: string }
 *     responses:
 *       200: { description: OTP sent to email }
 *       404: { description: User not found }
 *       500: { description: Server error }
 */
router.post("/forgot-password", forgotPassword);

/**
 * @openapi
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP for password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string }
 *               otp: { type: string }
 *     responses:
 *       200: { description: OTP verified }
 *       400: { description: Invalid or expired OTP }
 *       500: { description: Server error }
 */
router.post("/verify-otp", verifyOtp);

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password (after OTP verification or with token)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, newPassword]
 *             properties:
 *               email: { type: string }
 *               newPassword: { type: string }
 *               token: { type: string, description: "Optional reset token" }
 *     responses:
 *       200: { description: Password reset successful }
 *       404: { description: User not found }
 *       500: { description: Server error }
 */
router.post("/reset-password", resetPassword);

module.exports = router;
