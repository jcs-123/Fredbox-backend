const mongoose = require('mongoose');

const ApologyRequestSchema = new mongoose.Schema(
  {
    roomNo: {
      type: String,
      required: [true, "Room number is required"],
      trim: true,
    },
    studentName: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
    },
    admissionNo: {
      type: String,
      required: [true, "Admission number is required"],
      trim: true,
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
    },
    submittedBy: {
      type: String,
      required: [true, "Submitted person name required"],
      trim: true,
    },
    submittedAt: {
      type: String,
      default: () =>
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);


const ApologyRequest = mongoose.model('ApologyRequest', ApologyRequestSchema);
module.exports = ApologyRequest;