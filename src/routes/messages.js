const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

/**
 * @openapi
 * /api/messages:
 *   post:
 *     summary: Send a message (landlord or tenant)
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [senderId, receiverId, message]
 *             properties:
 *               senderId: { type: string }
 *               receiverId: { type: string }
 *               message: { type: string }
 *     responses:
 *       201: { description: Message sent }
 *       400: { description: All fields required }
 *       500: { description: Server error }
 */
// 🟢 Send a Message (Landlord or Tenant)
router.post("/", async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  if (!senderId || !receiverId || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newMessage = new Message({ senderId, receiverId, message });
    const savedMessage = await newMessage.save();
    res.status(201).json({ messages: [savedMessage] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /api/messages/{user1}/{user2}:
 *   get:
 *     summary: Get all messages between two users
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: user1
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: user2
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of messages }
 *       500: { description: Server error }
 */
// 🔵 Get all messages between two users
router.get("/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    }).sort({ createdAt: 1 }); // sort from oldest to newest

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
