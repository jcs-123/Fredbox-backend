const User = require('../MODEL/usermodel');

/* 🔹 Add (Register) New User */
exports.addUser = async (req, res) => {
  console.log("📥 Received Add User Request:", req.body);

  try {
    const {
      name,
      admissionNumber,
      phoneNumber,
      branch,
      year,
      sem,
      parentName,
      gmail,
      password,
      Role,
    } = req.body;

    // ✅ Validate required fields
    if (!name || !admissionNumber || !sem || !password) {
      console.log("⚠️ Validation Failed: Missing required fields");
      return res.status(400).json({
        success: false,
        message: '⚠️ Name, Admission Number, Semester, and Password are required.',
      });
    }

    // ✅ Normalize admission number (convert number → string + trim spaces)
    const formattedAdmission = admissionNumber.toString().trim();

    // ✅ Check if user already exists
    const existingUser = await User.findOne({
      admissionNumber: formattedAdmission,
    });

    if (existingUser) {
      console.log("❌ Duplicate User:", formattedAdmission);
      return res.status(400).json({
        success: false,
        message: '❌ Admission number already registered.',
      });
    }

    // ✅ Create new user (store consistently)
    const newUser = new User({
      name: name.trim(),
      admissionNumber: formattedAdmission, // always store as string
      phoneNumber,
      branch,
      year,
      sem,
      parentName,
      gmail: gmail?.toLowerCase(),
      password: password.trim(),
      Role: Role || 'User',
    });

    console.log("🛠️ Saving New User:", newUser);

    await newUser.save();
    console.log("✅ User Saved Successfully:", newUser._id);

    return res.status(201).json({
      success: true,
      message: '✅ User added successfully.',
      data: newUser,
    });

  } catch (error) {
    console.error("❌ Error in addUser():", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Please try again later.",
      error: error.message,
    });
  }
};

/* 🔹 Login User (Matches DB data exactly) */
// ✅ Login controller (ensure this version)
exports.loginUser = async (req, res) => {

  try {
    const { admissionNumber, password } = req.body;

    if (!admissionNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "⚠️ Admission Number and Password are required.",
      });
    }

    const formattedAdmission = admissionNumber.toString().trim();

    const user = await User.findOne({ admissionNumber: formattedAdmission });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "❌ User not found.",
      });
    }

    if (user.password.trim() !== password.trim()) {
      return res.status(401).json({
        success: false,
        message: "❌ Invalid password.",
      });
    }

    // ✅ Return full user data
    return res.status(200).json({
      success: true,
      message: "✅ Login successful!",
      role: user.Role || "User",
      data: user, // send full user document
    });
  } catch (error) {
    console.error("❌ Error in loginUser():", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Please try again later.",
      error: error.message,
    });
  }
};


/* 🔹 Get All Users */
/* 🔹 Get User by Admission Number */
exports.getUserByAdmission = async (req, res) => {
  console.log("📥 Received Get User Request:", req.query);

  try {
    const { admissionNumber } = req.query;

    // ✅ Validate required field
    if (!admissionNumber) {
      console.log("⚠️ Validation Failed: Admission Number is required");
      return res.status(400).json({
        success: false,
        message: '⚠️ Admission Number is required.',
      });
    }

    // ✅ Normalize admission number
    const formattedAdmission = admissionNumber.toString().trim();

    // ✅ Find user
    const user = await User.findOne({ admissionNumber: formattedAdmission });

    if (!user) {
      console.log("❌ User Not Found:", formattedAdmission);
      return res.status(404).json({
        success: false,
        message: '❌ User not found with this admission number.',
      });
    }

    console.log("✅ User Found:", user.name);
    
    // ✅ Return user data (excluding sensitive information)
    return res.status(200).json({
      success: true,
      message: '✅ User data retrieved successfully.',
      data: {
        name: user.name,
        admissionNumber: user.admissionNumber,
        phoneNumber: user.phoneNumber,
        branch: user.branch,
        year: user.year,
        sem: user.sem,
        parentName: user.parentName,
        gmail: user.gmail,
        roomNo: user.roomNo || "", // Add room number if available
        Role: user.Role
      },
    });

  } catch (error) {
    console.error("❌ Error in getUserByAdmission():", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Please try again later.",
      error: error.message,
    });
  }
};

/* 🔹 Update User Password */
exports.updatePassword = async (req, res) => {
  console.log("🔐 Received Update Password Request:", req.body);

  try {
    const { 
      admissionNumber, 
      currentPassword, 
      newPassword, 
      confirmPassword 
    } = req.body;

    // ✅ Validate required fields
    if (!admissionNumber || !currentPassword || !newPassword || !confirmPassword) {
      console.log("⚠️ Validation Failed: Missing required fields");
      return res.status(400).json({
        success: false,
        message: '⚠️ Admission Number, Current Password, New Password, and Confirm Password are required.',
      });
    }

    // ✅ Normalize admission number
    const formattedAdmission = admissionNumber.toString().trim();

    // ✅ Find user
    const user = await User.findOne({ admissionNumber: formattedAdmission });

    if (!user) {
      console.log("❌ User Not Found:", formattedAdmission);
      return res.status(404).json({
        success: false,
        message: '❌ User not found.',
      });
    }

    // ✅ Verify current password
    if (user.password.trim() !== currentPassword.trim()) {
      console.log("❌ Current password mismatch");
      return res.status(401).json({
        success: false,
        message: '❌ Current password is incorrect.',
      });
    }

    // ✅ Check if new password is same as current password
    if (currentPassword.trim() === newPassword.trim()) {
      console.log("❌ New password same as current password");
      return res.status(400).json({
        success: false,
        message: '❌ New password cannot be the same as current password.',
      });
    }

    // ✅ Check if new passwords match
    if (newPassword.trim() !== confirmPassword.trim()) {
      console.log("❌ New passwords don't match");
      return res.status(400).json({
        success: false,
        message: '❌ New password and confirm password do not match.',
      });
    }

    // ✅ Validate password strength (minimum 6 characters)
    if (newPassword.trim().length < 6) {
      console.log("❌ Password too short");
      return res.status(400).json({
        success: false,
        message: '❌ Password must be at least 6 characters long.',
      });
    }

    // ✅ Update password
    user.password = newPassword.trim();
    user.updatedAt = Date.now();

    await user.save();
    console.log("✅ Password Updated Successfully for user:", formattedAdmission);

    return res.status(200).json({
      success: true,
      message: '✅ Password updated successfully.',
    });

  } catch (error) {
    console.error("❌ Error in updatePassword():", error);
    return res.status(500).json({
      success: false,
      message: "Server Error. Please try again later.",
      error: error.message,
    });
  }
};

// for user apolgy
// 🔹 Get all room numbers
exports.getAllRooms = async (req, res) => {
  const rooms = await User.distinct("roomNo"); // from studentuser model
  res.json({ success: true, data: rooms });
};

// 🔹 Get students by room
exports.getStudentsByRoom = async (req, res) => {
  const { roomNo } = req.query;
  const data = await User.find({ roomNo }, "name admissionNumber");
  res.json({ success: true, data });
};


exports.getSemesterList = async (req, res) => {
  try {
    const sems = await User.distinct("sem");

    res.status(200).json({
      success: true,
      count: sems.length,
      data: sems.sort(), // sorted Sem1..Sem8
    });
  } catch (error) {
    console.error("❌ Error fetching semester list:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching semesters",
    });
  }
};


/* ===========================================================
   2️⃣  GET STUDENTS BY SEMESTER
   API: /api/users/by-sem?sem=Sem1
   =========================================================== */

exports.getStudentsBySem = async (req, res) => {
  try {
    const { sem } = req.query;

    if (!sem) {
      return res.status(400).json({
        success: false,
        message: "Semester is required",
      });
    }

    const students = await User.find(
      { sem },
      "name admissionNumber branch sem roomNo"
    ).sort({ name: 1 });  // sorted alphabetically

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error("❌ Error fetching students by semester:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


/* ===========================================================
   3️⃣  GET ALL STUDENTS (OPTIONAL)
   =========================================================== */

exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find(
      {},
      "name admissionNumber branch sem roomNo"
    ).sort({ sem: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });

  } catch (error) {
    console.error("❌ Error fetching all students:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching student list",
    });
  }
};

exports.getStudentAndRoomCount = async (req, res) => {
  try {
    // Total students
    const totalStudents = await User.countDocuments({ Role: "Student" });

    // Total occupied rooms (students who have roomNo)
    const occupiedRooms = await User.countDocuments({
      Role: "Student",
      roomNo: { $exists: true, $ne: "" }
    });

    res.status(200).json({
      success: true,
      totalStudents,
      occupiedRooms
    });

  } catch (err) {
    console.error("Count API Error:", err);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};