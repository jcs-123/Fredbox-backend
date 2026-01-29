const mongoose = require("mongoose");

const outingRequestSchema = new mongoose.Schema(
  {
    admissionNumber: {
      type: String,
      required: true,
      unique: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    isEligible: {
      type: String,
      enum: ["YES", "NO"],
      default: "NO",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OutingRequest", outingRequestSchema);
