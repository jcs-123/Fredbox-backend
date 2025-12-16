const mongoose = require("mongoose");

const feeDueSchema = new mongoose.Schema(
  {
    admissionNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    branch: {
      type: String,
 
      trim: true,
    },

    semester: {
      type: String,
   
      trim: true,
    },

    phoneNumber: {
      type: String,
   
      trim: true,
    },



    totalPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalDue: {
      type: Number,
    
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);


const FeeDue = mongoose.model("FeeDue", feeDueSchema);
module.exports = FeeDue;
