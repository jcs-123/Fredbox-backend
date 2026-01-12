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

exports.getTodayAttendanceForParent = async (req, res) => {
  try {
    const { admissionNumber } = req.query;

    if (!admissionNumber) {
      return res.status(400).json({
        success: false,
        message: "Admission number required",
      });
    }

    // 📅 Today date (YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({
      admissionNumber,
      date: today,
    });

    // ❌ No attendance record
    if (!attendance) {
      return res.json({
        success: true,
        published: "none",
        absent: false,
        message: "No attendance marked today",
      });
    }

    // 🔒 NOT PUBLISHED → HIDE FROM PARENT
    if (attendance.published !== "published") {
      return res.json({
        success: true,
        published: attendance.published || "none",
        absent: false,
        message: "Attendance not published",
      });
    }

    // ✅ PUBLISHED → SHOW ONLY ABSENT STATUS
    return res.json({
      success: true,
      published: "published",
      absent: attendance.attendance === false, // 👈 ONLY HERE
      data: {
        date: attendance.date,
      },
    });

  } catch (error) {
    console.error("❌ Parent Attendance Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


exports.publishAttendance = async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res
        .status(400)
        .json({ success: false, message: "Date is required" });
    }

    await Attendance.updateMany(
      { date },
      { $set: { published: "published" } }
    );

    res.json({
      success: true,
      message: "Attendance published successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAbsentHistoryForParent = async (req, res) => {
  try {
    const { admissionNumber } = req.query;

    if (!admissionNumber) {
      return res.status(400).json({
        success: false,
        message: "Admission number required",
      });
    }

    // console.log("📤 Fetching absent history for:", admissionNumber);

    const absentHistory = await Attendance.find({
      admissionNumber,
      attendance: false,          // ✅ ONLY ABSENT
      published: "published",     // ✅ ONLY AFTER PUBLISH
    })
      .select({ _id: 0, date: 1 }) // ✅ DATE ONLY, REMOVE _id
      .sort({ date: -1 })          // ✅ latest first (YYYY-MM-DD safe)

    return res.json({
      success: true,
      count: absentHistory.length,
      data: absentHistory.map(item => item.date), // ✅ ARRAY OF STRINGS
    });

  } catch (error) {
    console.error("❌ Absent history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getMonthlyAttendance = async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM

    if (!month) {
      return res.status(400).json({
        success: false,
        message: "Month is required (YYYY-MM)",
      });
    }

    const [year, mon] = month.split("-");
    const daysInMonth = new Date(year, mon, 0).getDate();

    // 1️⃣ All students
    const students = await User.find({}, "name sem roomNo admissionNumber");

    // 2️⃣ Attendance records for month
    const records = await Attendance.find({
      date: {
        $gte: `${month}-01`,
        $lte: `${month}-${daysInMonth}`,
      },
    });

    // 3️⃣ Build report
    const report = students.map((std) => {
      const daily = {};
      let present = 0;
      let absent = 0;

      for (let d = 1; d <= daysInMonth; d++) {
        const day = `${month}-${String(d).padStart(2, "0")}`;
        const rec = records.find(
          (r) =>
            r.admissionNumber === std.admissionNumber &&
            r.date === day
        );

        if (rec && rec.attendance === true) {
          daily[day] = "P";
          present++;
        } else {
          daily[day] = "A";
          absent++;
        }
      }

      return {
        admissionNumber: std.admissionNumber,
        name: std.name,
        semester: std.sem,
        roomNo: std.roomNo,
        daily,
        present,
        absent,
      };
    });

    res.json({
      success: true,
      daysInMonth,
      data: report,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
