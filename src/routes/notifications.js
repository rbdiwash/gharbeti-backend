const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// Send Buzz
router.post("/send", async (req, res) => {
  try {
    const { senderId, recipientId, title, message, type } = req.body;

    const notification = new Notification({
      senderId,
      recipientId,
      title,
      message,
      type: type || "buzz",
    });

    await notification.save();
    res.status(201).json({ message: "Notification sent", notification });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong", details: err });
  }
});

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const notifications = await Notification.find({ recipientId: userId }).sort(
      { createdAt: -1 }
    );
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark as Read
router.put("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// export default router;
module.exports = router;
