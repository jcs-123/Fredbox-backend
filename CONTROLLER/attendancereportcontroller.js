const Attendance = require("../MODEL/attendancereportmodel");
const User = require("../MODEL/usermodel");

// Save attendance for a date
exports.saveAttendance = async (req, res) => {
  try {
    const { date, records } = req.body;

    if (!date || !records) {
      return res.status(400).json({ success: false, message: "Missing date or data" });
    }

    for (let item of records) {
      await Attendance.findOneAndUpdate(
        { date, admissionNumber: item.admissionNumber },
        { ...item },
        { upsert: true }
      );
    }

    res.json({ success: true, message: "Attendance saved successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "⚠️ Date is required.",
      });
    }

    // Fetch all students
    const students = await User.find({}, "name sem roomNo admissionNumber");

    // Fetch attendance records already saved
    const attendanceRecords = await Attendance.find({ date });

    // Merge students + saved attendance
    const finalData = students.map((std, index) => {
      const record = attendanceRecords.find(
        (r) => r.admissionNumber === std.admissionNumber
      );

      return {
        slno: index + 1,
        admissionNumber: std.admissionNumber,
        name: std.name,
        semester: std.sem,
        roomNo: std.roomNo,
        messcut: record ? record.messcut : false,
        attendance: record ? record.attendance : false,
        selected: record ? record.selected : false,
      };
    });

    return res.status(200).json({
      success: true,
      data: finalData,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
exports.getAbsenteesByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required" });
    }

    // 1️⃣ Get all students
    const students = await User.find({}, "name sem roomNo admissionNumber");

    // 2️⃣ Get attendance records on selected date
    const records = await Attendance.find({ date });

    // 3️⃣ Absentees = attendance:false OR record missing
    const absentees = students.filter((student) => {
      const rec = records.find(
        (r) => r.admissionNumber === student.admissionNumber
      );

      // If no record OR attendance=false → ABSENT
      return !rec || rec.attendance === false;
    });

    // 4️⃣ Prepare final output
    const final = absentees.map((s, index) => ({
      slno: index + 1,
      semester: s.sem,
      roomNo: s.roomNo,
      name: s.name,
    }));

    res.json({ success: true, data: final });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
