const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const Admin = require("../models/Admin");

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// POST /api/auth/login
router.post(
  "/login",
  [
    body("username").notEmpty().withMessage("Username required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const { username, password } = req.body;
      const admin = await Admin.findOne({ username }).select("+password");
      if (!admin || !(await admin.comparePassword(password))) {
        return res.status(401).json({ success: false, message: "Invalid username or password" });
      }
      const token = signToken(admin._id);
      res.json({
        success: true,
        message: "Login successful",
        token,
        admin: { id: admin._id, username: admin.username, name: admin.name },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// GET + POST /api/auth/setup — browser working
const setupAdmin = async (req, res) => {
  try {
    const exists = await Admin.findOne({ username: "admin" });
    if (exists)
      return res.status(200).json({
        success: false,
        message: "Admin already exists! username: admin | password: admin123",
      });
    const admin = await Admin.create({
      username: "admin",
      password: "admin123",
      name: "Administrator",
    });
    res.status(201).json({
      success: true,
      message: "Admin created! username: admin | password: admin123",
      admin: { username: admin.username, name: admin.name },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

router.get("/setup", setupAdmin);
router.post("/setup", setupAdmin);

module.exports = router;
