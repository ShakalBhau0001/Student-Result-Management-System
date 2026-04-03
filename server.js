require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const resultRoutes = require("./routes/results");
const subjectRoutes = require("./routes/subjects");

const app = express();
connectDB();

app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/subjects", subjectRoutes);

app.get("/api/health", (req, res) => res.json({ success: true, message: "EduResult Pro API running!", time: new Date().toISOString() }));
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.use((err, req, res, next) => res.status(err.status || 500).json({ success: false, message: err.message || "Server Error" }));

// Auto setup: default admin + default subjects
const autoSetup = async () => {
  try {
    const Admin = require("./models/Admin");
    const Subject = require("./models/Subject");

    // Admin
    const adminExists = await Admin.findOne({ username: "admin" });
    if (!adminExists) {
      await Admin.create({ username: "admin", password: "admin123", name: "Administrator" });
      console.log("✅ Default admin created — username: admin | password: admin123");
    } else {
      console.log("✅ Admin ready — username: admin | password: admin123");
    }

    // Default subjects (sirf agar koi subject nahi hai)
    const subCount = await Subject.countDocuments();
    if (subCount === 0) {
      const defaults = ["Maths", "Physics", "Java", "DBMS", "Networking"];
      for (let i = 0; i < defaults.length; i++) {
        await Subject.create({ name: defaults[i], maxMarks: 100, order: i });
      }
      console.log("✅ Default subjects created:", defaults.join(", "));
    }
  } catch (err) {
    console.error("Setup error:", err.message);
  }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🎓 EduResult Pro Started!`);
  console.log(`   🌐  http://localhost:${PORT}`);
  console.log(`   📡  http://localhost:${PORT}/api\n`);
  setTimeout(autoSetup, 1500);
});
