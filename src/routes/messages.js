const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
// 🟢 Send a Message (Landlord or Tenant)
router.post("/", async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  if (!senderId || !receiverId || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newMessage = new Message({ senderId, receiverId, message });
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔵 Get all messages between two users
router.get("/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ createdAt: 1 }); // sort from oldest to newest

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
