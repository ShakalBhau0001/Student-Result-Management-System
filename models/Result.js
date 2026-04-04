const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    sub: { type: String, required: true },
    val: { type: Number, required: true, min: 0, max: 100 },
    maxMarks: { type: Number, default: 100 },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    rollNo: {
      type: String,
      required: [true, "Roll number is required"],
      unique: true,
      trim: true,
    },
    year: {
      type: String,
      default: () => new Date().getFullYear().toString(),
    },
    subs: {
      type: [subjectSchema],
      validate: {
        validator: (arr) => arr.length >= 1,
        message: "At least 1 subject required",
      },
    },
    total: { type: Number, default: 0 },
    maxTotal: { type: Number, default: 500 },
    percentage: { type: Number, default: 0 },
    grade: { type: String, default: "" },
    status: { type: String, enum: ["Pass", "Fail"], default: "Fail" },
  },
  { timestamps: true }
);

// Auto-calculate before saving
resultSchema.pre("save", function (next) {
  this.total    = this.subs.reduce((s, m) => s + m.val, 0);
  this.maxTotal = this.subs.reduce((s, m) => s + (m.maxMarks || 100), 0);
  this.percentage = parseFloat(((this.total / this.maxTotal) * 100).toFixed(2));

  if (this.percentage >= 90)      this.grade = "O";
  else if (this.percentage >= 75) this.grade = "A+";
  else if (this.percentage >= 60) this.grade = "A";
  else if (this.percentage >= 50) this.grade = "B";
  else if (this.percentage >= 40) this.grade = "C";
  else                            this.grade = "F";

  this.status = this.percentage >= 35 ? "Pass" : "Fail";
  next();
});

module.exports = mongoose.model("Result", resultSchema);
