const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/authController");

/**
 * @openapi
 * /api/profile/{userId}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User profile with landlord/tenant details }
 *       404: { description: User not found }
 *       500: { description: Server error }
 */
// Get user profile
router.get("/:userId", getProfile);

/**
 * @openapi
 * /api/profile/{userId}:
 *   put:
 *     summary: Update user profile
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phoneNumber: { type: string }
 *               address: { type: string }
 *               profileImage: { type: string }
 *     responses:
 *       200: { description: Profile updated }
 *       404: { description: User not found }
 *       500: { description: Server error }
 */
// Update user profile
router.put("/:userId", updateProfile);

module.exports = router;
