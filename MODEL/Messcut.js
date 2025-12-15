const mongoose = require("mongoose");

const messcutSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    admissionNo: { type: String, required: true, trim: true },
    roomNo: { type: String, trim: true },

    leavingDate: { type: String, required: true },
    leavingTime: { type: String, required: true },
    returningDate: { type: String, required: true },
    returningTime: { type: String, required: true },
    reason: { type: String, required: true, trim: true },

    // 🔹 Status control
    status: {
      type: String,
      enum: ["Pending", "ACCEPT", "REJECT"],
      default: "Pending",
    },
 parentStatus: {
      type: String,
      enum: ["Pending", "APPROVE", "REJECT"],
      default: "Pending",
    },
   period: {
      type: String,
      trim: true,
      default: "-", // Example: "2 day(s) 5 hour(s)"
    },

    // 🔹 Timestamp of when status was last updated
    statusUpdatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Messcut = mongoose.model("Messcut", messcutSchema);
module.exports = Messcut;
