const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
  },

  admissionNumber: {
    type: String,
    required: [true, 'Admission number is required'],
    unique: true,
  },

  phoneNumber: {
    type: String,
    trim: true,
  },

  branch: {
    type: String,
    trim: true,
  },  roomNo: {
    type: String,
    trim: true,
  },

  year: {
    type: String,
    trim: true,
  },

  sem: {
    type: String,
    trim: true,
  },

  parentName: {
    type: String,
    trim: true,
  },
      Role: {
    type: String,
  },

  // ✅ Optional Gmail field
  gmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'],
    default: null, // Optional field
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
    parentPhoneNumber: {
      type: String,
      trim: true,
    },
     profilePhoto: {
      type: String, // filename or URL
      default: null,
    },
}, {
  timestamps: true, 
});

// Optional: faster lookups by admission number

const studentuser = mongoose.model('studentuser', userSchema);
module.exports = studentuser;
