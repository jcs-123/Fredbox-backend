// MODEL/otpModel.js
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  gmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // ⏰ OTP expires after 5 minutes
  },
});

module.exports = mongoose.model("OTP", otpSchema);
