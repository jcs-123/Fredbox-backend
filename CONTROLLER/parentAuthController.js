const ParentUser = require("../MODEL/ParentUser");

exports.loginParent = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check missing fields
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Find user in DB
    const user = await ParentUser.findOne({ username });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid username",
      });
    }

    // Compare plain text password
    if (user.password !== password) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // SUCCESS LOGIN
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        parentName: user.parentName,
        studentName: user.studentName,
        studentJecCode: user.studentJecCode,
        admissionNumber: user.admissionNumber,
        semester: user.semester,
        branch: user.branch,
        roomNumber: user.roomNumber,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.changeParentPassword = async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;

    // 1️⃣ Validate input
    if (!username || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2️⃣ Find user
    const user = await ParentUser.findOne({ username });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3️⃣ Verify current password
    if (user.password !== currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // 4️⃣ Prevent same password reuse
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // 5️⃣ Update password
    user.password = newPassword;
    await user.save();

    // 6️⃣ Success response
    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
