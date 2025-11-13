const mongoose = require("mongoose");

const HolidaySchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: [true, "Event date is required"],
    },
    holidayType: {
      type: String,
      required: [true, "Holiday type is required"],
      trim: true,
    },
    reason: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
    },
    createdAt: {
      type: String,
      default: () =>
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    },
  },
  { timestamps: true }
);

const Holiday = mongoose.model("Holiday", HolidaySchema);
module.exports = Holiday;
