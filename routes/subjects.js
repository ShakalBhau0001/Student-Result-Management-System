const express = require("express");
const Subject = require("../models/Subject");
const { protect } = require("../middleware/auth");
const router = express.Router();

// GET all subjects (public - frontend needs this)
router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: subjects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST add subject (protected)
router.post("/", protect, async (req, res) => {
  try {
    const { name, maxMarks } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Subject name required" });

    const exists = await Subject.findOne({ name: name.trim() });
    if (exists) return res.status(400).json({ success: false, message: "Subject already exists" });

    const count = await Subject.countDocuments();
    const subject = await Subject.create({ name: name.trim(), maxMarks: maxMarks || 100, order: count });
    res.status(201).json({ success: true, message: "Subject added", data: subject });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE subject (protected)
router.delete("/:id", protect, async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ success: false, message: "Subject not found" });
    res.json({ success: true, message: "Subject deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
