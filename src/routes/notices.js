const express = require("express");
const Notice = require("../models/Notice");
const User = require("../models/User");
const router = express.Router();

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

// READ all Notices
router.get("/", async (req, res) => {
  const { type } = req.query;
  console.log("type", req);
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
