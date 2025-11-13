const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    admissionNo: { type: String, required: true },
    roomNo: { type: String, required: true },
    complaint: { type: String, required: true },
    status: { 
      type: String, 
      default: "Pending",
      enum: ["Pending", "In Progress", "Resolved", "Rejected"]
    },
    remark: { type: String, default: "" },
    remarkAddedAt: { type: Date },
  },
  { timestamps: true }
);

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;