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
