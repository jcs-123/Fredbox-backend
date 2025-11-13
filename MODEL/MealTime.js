// models/MealTime.js
const mongoose = require("mongoose");

const mealTimeSchema = new mongoose.Schema({
  meal: {
    type: String,
    required: true,
    enum: ["breakfast", "lunch", "tea", "dinner"],
  },
  startTime: { type: String, required: true }, // e.g., "07:00"
  endTime: { type: String, required: true },   // e.g., "09:00"
});

const MealTime = mongoose.model("MealTime", mealTimeSchema);
module.exports = MealTime;