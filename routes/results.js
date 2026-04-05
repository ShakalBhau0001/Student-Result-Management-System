const express = require("express");
const { body, validationResult } = require("express-validator");
const Result  = require("../models/Result");
const Student = require("../models/Student");
const { protect } = require("../middleware/auth");
const router = express.Router();

// GET all results (protected)
router.get("/", protect, async (req, res) => {
  try {
    const { search, status, grade } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (grade)  filter.grade  = grade;
    if (search) filter.rollNo = { $regex: search, $options: "i" };

    const results = await Result.find(filter).sort({ createdAt: -1 });
    const enriched = await Promise.all(
      results.map(async (r) => {
        const stu = await Student.findOne({ rollNo: r.rollNo });
        return { ...r.toObject(), studentName: stu ? stu.name : "—", course: stu ? stu.course : "—" };
      })
    );
    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET stats (protected)
router.get("/stats", async (req, res) => {
  try {
    const totalStudents  = await Student.countDocuments();
    const totalResults   = await Result.countDocuments();
    const passed         = await Result.countDocuments({ status: "Pass" });
    const avgAgg         = await Result.aggregate([{ $group: { _id: null, avgPct: { $avg: "$percentage" } } }]);
    const gradeBreakdown = await Result.aggregate([
      { $group: { _id: "$grade", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({
      success: true,
      data: {
        totalStudents, totalResults, passed,
        failed: totalResults - passed,
        passRate: totalResults ? ((passed / totalResults) * 100).toFixed(1) : 0,
        avgPercentage: avgAgg[0] ? avgAgg[0].avgPct.toFixed(1) : 0,
        gradeBreakdown,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single result by rollNo (public)
router.get("/:rollNo", async (req, res) => {
  try {
    const result  = await Result.findOne({ rollNo: req.params.rollNo.trim() });
    if (!result)
      return res.status(404).json({ success: false, message: "Result not found for this roll number" });
    const student = await Student.findOne({ rollNo: req.params.rollNo });
    res.json({
      success: true,
      data: {
        ...result.toObject(),
        studentName: student ? student.name     : "—",
        course:      student ? student.course   : "—",
        semester:    student ? student.semester : "—",
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST add/update result (protected)
router.post("/", protect,
  [
    body("rollNo").notEmpty().withMessage("Roll number required"),
    body("subs").isArray({ min: 1 }).withMessage("At least 1 subject required"),
    body("subs.*.sub").notEmpty().withMessage("Subject name required"),
    body("subs.*.val").isInt({ min: 0, max: 100 }).withMessage("Marks 0-100"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const { rollNo, year, subs } = req.body;
      const existing = await Result.findOne({ rollNo: rollNo.trim() });
      if (existing) {
        existing.subs = subs;
        if (year) existing.year = year;
        await existing.save();
        return res.json({ success: true, message: "Result updated successfully", data: existing });
      }
      const result = await Result.create({ rollNo, year, subs });
      res.status(201).json({ success: true, message: "Result saved successfully", data: result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// PUT update result (protected) - edit endpoint
router.put("/:rollNo", protect, async (req, res) => {
  try {
    const result = await Result.findOne({ rollNo: req.params.rollNo });
    if (!result)
      return res.status(404).json({ success: false, message: "Result not found" });
    if (req.body.subs) result.subs = req.body.subs;
    if (req.body.year) result.year = req.body.year;
    await result.save();
    res.json({ success: true, message: "Result updated", data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE result (protected)
router.delete("/:rollNo", protect, async (req, res) => {
  try {
    const result = await Result.findOneAndDelete({ rollNo: req.params.rollNo });
    if (!result)
      return res.status(404).json({ success: false, message: "Result not found" });
    res.json({ success: true, message: "Result deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
