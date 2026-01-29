const mongoose = require("mongoose");

const outingRequestSchema = new mongoose.Schema(
  {
    admissionNumber: {
      type: String,
      required: true,
      index: true,
    },

    studentName: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    leavingTime: {
      type: String,
      required: true,
    },

    returningTime: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    month: {
      type: Number, // 0–11
      required: true,
      index: true,
    },

    year: {
      type: Number,
      required: true,
      index: true,
    },

    outingCount: {
      type: Number,
      enum: [0, 1],
      default: 1, // when outing taken → 1
    },

    parentStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    adminStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

/* 🔒 ONE OUTING PER MONTH PER STUDENT */
outingRequestSchema.index(
  { admissionNumber: 1, month: 1, year: 1 },
  { unique: true }
);

module.exports = mongoose.model("OutingRequeststudent", outingRequestSchema);
