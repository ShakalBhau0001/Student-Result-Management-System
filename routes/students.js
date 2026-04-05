const express = require("express");
const { body, validationResult } = require("express-validator");
const Student = require("../models/Student");
const { protect } = require("../middleware/auth");
const router = express.Router();

// GET /api/students
// Get all students (protected)

router.get("/", protect, async (req, res) => {
  try {
    const { search, semester, gender } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { rollNo: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (semester) filter.semester = semester;
    if (gender) filter.gender = gender;

    const students = await Student.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: students.length, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/students/:rollNo
// Get single student by roll number (public - for result check)

router.get("/:rollNo", async (req, res) => {
  try {
    const student = await Student.findOne({ rollNo: req.params.rollNo.trim() });
    if (!student)
      return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/students
// Add new student (protected)

router.post(
  "/",
  protect,
  [
    body("rollNo").notEmpty().withMessage("Roll number required"),
    body("name").notEmpty().withMessage("Name required"),
    body("course").notEmpty().withMessage("Course required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const { rollNo, name, course, semester, gender, email } = req.body;

      const exists = await Student.findOne({ rollNo: rollNo.trim() });
      if (exists)
        return res.status(400).json({ success: false, message: "Roll number already exists" });

      const student = await Student.create({ rollNo, name, course, semester, gender, email });
      res.status(201).json({ success: true, message: "Student added successfully", data: student });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// PUT /api/students/:rollNo
// Update student (protected)

router.put("/:rollNo", protect, async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { rollNo: req.params.rollNo },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!student)
      return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, message: "Student updated", data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/students/:rollNo
// Delete student (protected)

router.delete("/:rollNo", protect, async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({ rollNo: req.params.rollNo });
    if (!student)
      return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
