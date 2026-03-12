const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

/**
 * @openapi
 * /api/notifications/send:
 *   post:
 *     summary: Send a notification
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [senderId, recipientId, title, message]
 *             properties:
 *               senderId: { type: string }
 *               recipientId: { type: string }
 *               title: { type: string }
 *               message: { type: string }
 *               type: { type: string, enum: [buzz, maintenance, general, reminder, announcement] }
 *     responses:
 *       201: { description: Notification sent }
 *       500: { description: Server error }
 */
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

/**
 * @openapi
 * /api/notifications/{userId}:
 *   get:
 *     summary: Get all notifications for a user
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of notifications }
 *       500: { description: Server error }
 */
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const notifications = await Notification.find({ recipientId: userId }).sort(
      { createdAt: -1 },
    );
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Notification updated }
 *       500: { description: Server error }
 */
// Mark as Read
router.put("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true },
    );
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Notification deleted }
 *       500: { description: Server error }
 */
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
