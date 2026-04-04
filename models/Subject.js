const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subject name required"],
      unique: true,
      trim: true,
    },
    maxMarks: {
      type: Number,
      default: 100,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
