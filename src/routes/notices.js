const express = require("express");
const Notice = require("../models/Notice");
const User = require("../models/User");
const router = express.Router();

/**
 * @openapi
 * /api/notices:
 *   post:
 *     summary: Create a notice
 *     tags: [Notices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               type: { type: string }
 *     responses:
 *       201: { description: Notice created }
 *       500: { description: Server error }
 */
// CREATE Notice
router.post("/", async (req, res) => {
  try {
    const newNotice = new Notice(req.body);
    const savedNotice = await newNotice.save();
    res.status(201).json(savedNotice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @openapi
 * /api/notices:
 *   get:
 *     summary: Get all notices (optional filter by type)
 *     tags: [Notices]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *         description: Filter by notice type (omit or "all" for all)
 *     responses:
 *       200: { description: List of notices }
 *       500: { description: Server error }
 */
// READ all Notices
router.get("/", async (req, res) => {
  const { type } = req.query;
  const filter = {};
  // If the type is "all", don't filter by type, just fetch all notices
  if (type && type !== "all") {
    filter.type = type;
  }
  try {
    const notices = await Notice.find(filter).sort({ createdAt: -1 });
    res.status(200).json(notices || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @openapi
 * /api/notices/{id}:
 *   get:
 *     summary: Get a single notice by ID
 *     tags: [Notices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Notice found }
 *       404: { description: Notice not found }
 *       500: { description: Server error }
 */
// READ a Single Notice by ID
router.get("/:id", async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });
    res.status(200).json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @openapi
 * /api/notices/{id}:
 *   put:
 *     summary: Update a notice
 *     tags: [Notices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               type: { type: string }
 *     responses:
 *       200: { description: Notice updated }
 *       404: { description: Notice not found }
 *       500: { description: Server error }
 */
// UPDATE Notice
router.put("/:id", async (req, res) => {
  try {
    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedNotice)
      return res.status(404).json({ message: "Notice not found" });
    res.status(200).json(updatedNotice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @openapi
 * /api/notices/{id}:
 *   delete:
 *     summary: Delete a notice
 *     tags: [Notices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Notice deleted successfully }
 *       404: { description: Notice not found }
 *       500: { description: Server error }
 */
// DELETE Notice
router.delete("/:id", async (req, res) => {
  try {
    const deletedNotice = await Notice.findByIdAndDelete(req.params.id);
    if (!deletedNotice)
      return res.status(404).json({ message: "Notice not found" });
    res.status(200).json({ message: "Notice deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
