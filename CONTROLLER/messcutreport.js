const User = require("../MODEL/usermodel.js");
const Messcut = require("../MODEL/Messcut.js");

/**
 * 🧾 Generate Messcut Summary Report
 * Filters only ACCEPTED messcut entries
 * Groups messcut records by admissionNumber and enriches with user details.
 */
exports.getMesscutReport = async (req, res) => {
  try {
    const { admissionNumber } = req.query; // Optional filter

    // ✅ Step 1️⃣: Build query (only accepted)
    const query = admissionNumber
      ? { admissionNo: admissionNumber, status: "ACCEPT" }
      : { status: "ACCEPT" };

    // ✅ Step 2️⃣: Fetch messcut records
    const messcuts = await Messcut.find(query).lean();

    if (!messcuts.length) {
      return res.json({
        success: true,
        data: [],
        message: "No accepted messcut records found.",
      });
    }

    // ✅ Step 3️⃣: Group by admission number
    const summary = {};
    messcuts.forEach((item) => {
      const adm = item.admissionNo;
      if (!summary[adm]) {
        summary[adm] = {
          admissionNumber: adm,
          name: item.name,
          count: 0,
          lastDate: item.leavingDate,
        };
      }
      summary[adm].count += 1;
      summary[adm].lastDate = item.leavingDate;
    });

    // ✅ Step 4️⃣: Fetch user info (branch, sem)
    const users = await User.find({}, "admissionNumber branch sem").lean();

    // ✅ Step 5️⃣: Merge with user data
    const report = Object.values(summary).map((r) => {
      const user = users.find((u) => u.admissionNumber === r.admissionNumber);
      return {
        name: r.name,
        admissionNumber: r.admissionNumber,
        branch: user ? user.branch || "-" : "-",
        sem: user ? user.sem || "-" : "-",
        count: r.count,
        lastDate: r.lastDate,
      };
    });

    // ✅ Step 6️⃣: Sort by latest
    const sortedReport = report.sort(
      (a, b) => new Date(b.lastDate) - new Date(a.lastDate)
    );

    res.status(200).json({
      success: true,
      count: sortedReport.length,
      data: sortedReport,
    });
  } catch (error) {
    console.error("❌ Error generating messcut report:", error);
    res.status(500).json({
      success: false,
      message: "Server error while generating report",
    });
  }
};

/**
 * 🎓 Get all ACCEPTED messcut details for a specific student
 */
exports.getMesscutDetailsByStudent = async (req, res) => {
  try {
    const { admissionNo } = req.query;

    if (!admissionNo) {
      return res.status(400).json({
        success: false,
        message: "Admission number is required.",
      });
    }

    // ✅ Fetch only ACCEPTED records for that student
    const records = await Messcut.find({
      admissionNo,
      status: "ACCEPT",
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!records.length) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No accepted messcut records found for this student.",
      });
    }

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error("❌ Error fetching student messcut details:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching messcut details.",
    });
  }
};
exports.getAllMesscutDetails = async (req, res) => {
  try {
    // 🟢 Step 1: Fetch all messcut records
    const messcuts = await Messcut.find({})
      .sort({ createdAt: -1 }) // latest first
      .lean();

    if (!messcuts.length) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No messcut records found.",
      });
    }

    // 🟢 Step 2: Fetch all users (only needed fields)
    const users = await User.find({}, "admissionNumber branch sem").lean();

    // 🟢 Step 3: Merge user details into messcut record
    const fullData = messcuts.map((m) => {
      const student = users.find(
        (u) => u.admissionNumber === m.admissionNo
      );

      return {
        name: m.name,
        admissionNumber: m.admissionNo,
        branch: student?.branch || "-",
        sem: student?.sem || "-",
        leavingDate: m.leavingDate,
        returningDate: m.returningDate,
        reason: m.reason,
        status: m.status,
        createdAt: m.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      count: fullData.length,
      data: fullData,
    });

  } catch (error) {
    console.error("❌ Error fetching all messcut records:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching messcut data.",
    });
  }
};
/**
 * 🟢 Get messcut list for a specific date
 */
exports.getMesscutByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: "Date is required" });

    const selected = new Date(date);

    const messcuts = await Messcut.find({ status: "ACCEPT" }).lean();

    const valid = messcuts.filter(m => {
      const leave = new Date(m.leavingDate);
      const ret = new Date(m.returningDate);

      return selected > leave && selected < ret;   // EXCLUDE leave + return
    });

    const formatted = valid.map(m => ({
      admissionNumber: m.admissionNo,  // ✔ FIXED KEY NAME
      name: m.name,
      roomNo: m.roomNo,
      messcut: true,
    }));

    res.json({ success: true, data: formatted });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};



exports.getDateWiseMesscutReport = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date)
      return res.status(400).json({ success: false, message: "Date is required" });

    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);

    // 🟢 1. Load all users (students)
    const students = await User.find({}, "name admissionNumber branch sem roomNo").lean();

    // 🟢 2. Load accepted messcuts
    const messcuts = await Messcut.find({ status: "ACCEPT" }).lean();

    const messcutMap = {};

    messcuts.forEach((m) => {
      const leave = new Date(m.leavingDate);
      const ret = new Date(m.returningDate);

      leave.setHours(0, 0, 0, 0);
      ret.setHours(0, 0, 0, 0);

      const sel = selected.toDateString();
      const lv = leave.toDateString();
      const rt = ret.toDateString();

      let dayType = null;

      if (sel === lv) dayType = "LEAVE_START";
      else if (selected > leave && selected < ret) dayType = "LEAVE_MIDDLE";
      else if (sel === rt) dayType = "LEAVE_END";

      if (!dayType) return;

      // Save meal logic
      let meals = { B: true, L: true, T: true, D: true };

      if (dayType === "LEAVE_START")
        meals = { B: true, L: true, T: true, D: false };

      if (dayType === "LEAVE_MIDDLE")
        meals = { B: false, L: false, T: false, D: false };

      if (dayType === "LEAVE_END")
        meals = { B: true, L: true, T: true, D: true };

      messcutMap[m.admissionNo] = { dayType, meals };
    });

    // 🟢 3. Final result (all users)
    const final = students.map((s) => {
      const entry = messcutMap[s.admissionNumber];

      if (!entry) {
        // ⭐ User has NO messcut – ALL TICK ✔️
        return {
          name: s.name,
          admissionNumber: s.admissionNumber,
          branch: s.branch,
          sem: s.sem,
          roomNo: s.roomNo,
          dayType: "PRESENT",
          meals: { B: true, L: true, T: true, D: true }
        };
      }

      // ⭐ User has messcut → use messcut rules
      return {
        name: s.name,
        admissionNumber: s.admissionNumber,
        branch: s.branch,
        sem: s.sem,
        roomNo: s.roomNo,
        dayType: entry.dayType,
        meals: entry.meals
      };
    });

    res.status(200).json({
      success: true,
      count: final.length,
      data: final,
    });
  } catch (err) {
    console.error("❌ error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getNameWiseMonthReport = async (req, res) => {
  try {
    const { admissionNumber, month } = req.query;

    if (!admissionNumber)
      return res.status(400).json({ success: false, message: "Admission number required" });

    if (!month)
      return res.status(400).json({ success: false, message: "Month required (YYYY-MM)" });

    // ⭐ 1. Local date parser (no timezone issue)
    function parseLocalDate(dateStr) {
      const [y, m, d] = dateStr.split("-");
      return new Date(y, m - 1, d); // India-safe date
    }

    // ⭐ 2. Local date formatter (NO UTC SHIFT)
    function formatDateLocal(dt) {
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const d = String(dt.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }

    // ⭐ 3. Month range
    const [year, mon] = month.split("-");
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 0);

    // ⭐ 4. Fetch student details
    const student = await User.findOne(
      { admissionNumber },
      "name admissionNumber sem branch roomNo"
    ).lean();

    if (!student)
      return res.status(404).json({ success: false, message: "Student not found" });

    // ⭐ 5. Fetch messcut entries
    const messcuts = await Messcut.find({
      admissionNo: admissionNumber,
      status: "ACCEPT",
    }).lean();

    const output = [];

    // ⭐ 6. Loop all month days
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {

      const current = new Date(d);   
      current.setHours(0, 0, 0, 0);

      let meals = { B: true, L: true, T: true, D: true };
      let dayType = "PRESENT";

      for (const m of messcuts) {
        const leave = parseLocalDate(m.leavingDate);
        const ret = parseLocalDate(m.returningDate);

        leave.setHours(0, 0, 0, 0);
        ret.setHours(0, 0, 0, 0);

        const cur = current.getTime();
        const lv = leave.getTime();
        const rt = ret.getTime();

        // ⭐ LEAVE START → Only Dinner cancelled
        if (cur === lv) {
          dayType = "LEAVE_START";
          meals = { B: true, L: true, T: true, D: false };
        }

        // ⭐ MIDDLE LEAVE DAYS → All meals cancelled
        else if (cur > lv && cur < rt) {
          dayType = "LEAVE_MIDDLE";
          meals = { B: false, L: false, T: false, D: false };
        }

        // ⭐ RETURN DAY → All meals available
        else if (cur === rt) {
          dayType = "LEAVE_END";
          meals = { B: true, L: true, T: true, D: true };
        }
      }

      // ⭐ final push with CORRECT INDIA DATE
      output.push({
        date: formatDateLocal(current),   // <<< FIXED
        dayType,
        breakfast: meals.B,
        lunch: meals.L,
        tea: meals.T,
        dinner: meals.D,
      });
    }

    // ⭐ 7. Final response
    res.status(200).json({
      success: true,
      student: {
        name: student.name,
        admissionNumber: student.admissionNumber,
        sem: student.sem,
        branch: student.branch,
        roomNo: student.roomNo,
      },
      month,
      count: output.length,
      data: output,
    });

  } catch (err) {
    console.error("❌ Month Report Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


