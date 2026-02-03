const mongoose = require("mongoose");

const ParentUserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true, // stored as plain text
    },

    parentName: {
      type: String,
      required: true,
    },

    studentName: {
      type: String,
      required: true,
    },

    studentJecCode: {
      type: String,
      required: true,
      uppercase: true, // Example: JEC698
    },

    admissionNumber: {
      type: String,
      required: true,
      trim: true,
    },

    semester: {
      type: String,
    },

    branch: {
      type: String,
      required: true,
    },

    roomNumber: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const ParentUser = mongoose.model("ParentUser", ParentUserSchema);
module.exports = ParentUser;