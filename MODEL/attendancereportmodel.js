const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  date: {
    type: String, // format: YYYY-MM-DD
    required: true,
  },

  admissionNumber: {
    type: String,
    required: true,
  },

  name: String,
  semester: String,
  roomNo: String,

  messcut: { type: Boolean, default: false },
  attendance: { type: Boolean, default: false },
    published: {
      type: String,
      enum: ["none", "published"],
      default: "none",
    },
}, { timestamps: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
module.exports = Attendance;