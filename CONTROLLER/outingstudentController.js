const OutingRequest = require("../MODEL/OutingRequeststudent");

/* =====================================================
   CREATE ONE DAY OUTING REQUEST
===================================================== */
exports.requestOuting = async (req, res) => {
  try {
    const {
      admissionNumber,
      studentName,
      date,
      leavingTime,
      returningTime,
      reason,
    } = req.body;

    if (
      !admissionNumber ||
      !studentName ||
      !date ||
      !leavingTime ||
      !returningTime ||
      !reason
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const outingDate = new Date(date);
    const month = outingDate.getMonth(); // 0–11
    const year = outingDate.getFullYear();

    /* 🔒 CHECK MONTHLY LIMIT (1 PER MONTH) */
    const alreadyTaken = await OutingRequest.findOne({
      admissionNumber,
      month,
      year,
    });

    if (alreadyTaken) {
      return res.status(400).json({
        success: false,
        message: "Monthly outing limit reached (1 per month)",
      });
    }

    const outing = await OutingRequest.create({
      admissionNumber,
      studentName,
      date: outingDate,
      leavingTime,
      returningTime,
      reason,
      month,
      year,
      outingCount: 1,
      parentStatus: "PENDING",
      adminStatus: "PENDING",
    });

    return res.status(201).json({
      success: true,
      message: "Outing request submitted",
      data: outing,
    });
  } catch (err) {
    console.error("❌ Outing Request Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =====================================================
   GET ALL OUTING REQUESTS (ADMIN)
===================================================== */
exports.getAllOutingRequests = async (req, res) => {
  try {
    const outings = await OutingRequest.find()
      .sort({ createdAt: -1 }); // latest first

    return res.json({
      success: true,
      data: outings,
    });
  } catch (err) {
    console.error("❌ Get All Outing Requests Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =====================================================
   GET STUDENT OUTINGS (ADMISSION NUMBER WISE) ✅
===================================================== */
exports.getStudentOutings = async (req, res) => {
  try {
    const { admissionNumber } = req.params;

    if (!admissionNumber) {
      return res.status(400).json({
        success: false,
        message: "Admission number is required",
      });
    }

    const outings = await OutingRequest.find({ admissionNumber })
      .sort({ date: -1 }); // latest first

    return res.json({
      success: true,
      data: outings,
    });
  } catch (err) {
    console.error("❌ Get Student Outings Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =====================================================
   GET STUDENT OUTING COUNT (MONTH)
===================================================== */
exports.getMonthlyOutingCount = async (req, res) => {
  try {
    const { admissionNumber, month, year } = req.query;

    const outing = await OutingRequest.findOne({
      admissionNumber,
      month,
      year,
    });

    return res.json({
      success: true,
      outingCount: outing ? 1 : 0,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =====================================================
   GET MONTHLY OUTING REPORT
===================================================== */
exports.getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let matchCriteria = {};
    
    if (month !== undefined && month !== "") {
      matchCriteria.month = parseInt(month);
    }
    
    if (year !== undefined && year !== "") {
      matchCriteria.year = parseInt(year);
    }

    const report = await OutingRequest.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: "$admissionNumber",
          studentName: { $first: "$studentName" },
          totalOutings: { $sum: "$outingCount" },
        },
      },
      { $sort: { studentName: 1 } },
    ]);

    return res.json({
      success: true,
      data: report,
    });
  } catch (err) {
    console.error("❌ Monthly Report Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =====================================================
   PARENT DECISION
===================================================== */
exports.parentDecision = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid status" 
      });
    }

    const updated = await OutingRequest.findByIdAndUpdate(
      id,
      { 
        parentStatus: status,
        parentDecisionAt: new Date()
      },
      { new: true }
    );

    res.json({ 
      success: true, 
      message: `Parent ${status.toLowerCase()} the request`,
      data: updated 
    });
  } catch (err) {
    console.error("❌ Parent Decision Error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

/* =====================================================
   ADMIN DECISION
===================================================== */
exports.adminDecision = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid status. Must be APPROVED or REJECTED" 
      });
    }

    const updateData = { 
      adminStatus: status,
      adminDecisionAt: new Date()
    };

    if (adminComment) {
      updateData.adminComment = adminComment;
    }

    const updated = await OutingRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Outing request not found"
      });
    }

    res.json({ 
      success: true, 
      message: `Request ${status.toLowerCase()} successfully`,
      data: updated 
    });
  } catch (err) {
    console.error("❌ Admin Decision Error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

/* =====================================================
   GET ELIGIBLE STUDENTS (for frontend integration)
===================================================== */
exports.getEligibleStudents = async (req, res) => {
  try {
    // This is a mock function - you should integrate with your actual eligibility system
    const eligibleStudents = await OutingRequest.aggregate([
      {
        $match: {
          adminStatus: "APPROVED",
          parentStatus: "APPROVED"
        }
      },
      {
        $group: {
          _id: "$admissionNumber",
          studentName: { $first: "$studentName" },
          lastOutingDate: { $max: "$date" }
        }
      },
      {
        $project: {
          admissionNumber: "$_id",
          studentName: 1,
          lastOutingDate: 1,
          _id: 0
        }
      }
    ]);

    return res.json({
      success: true,
      data: eligibleStudents,
    });
  } catch (err) {
    console.error("❌ Get Eligible Students Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =====================================================
   GET OUTING BY ID
===================================================== */
exports.getOutingById = async (req, res) => {
  try {
    const { id } = req.params;

    const outing = await OutingRequest.findById(id);

    if (!outing) {
      return res.status(404).json({
        success: false,
        message: "Outing request not found"
      });
    }

    return res.json({
      success: true,
      data: outing,
    });
  } catch (err) {
    console.error("❌ Get Outing By ID Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =====================================================
   GET OUTING STATISTICS
===================================================== */
exports.getOutingStats = async (req, res) => {
  try {
    const totalOutings = await OutingRequest.countDocuments();
    const approvedOutings = await OutingRequest.countDocuments({ adminStatus: "APPROVED" });
    const rejectedOutings = await OutingRequest.countDocuments({ adminStatus: "REJECTED" });
    const pendingOutings = await OutingRequest.countDocuments({ adminStatus: "PENDING" });

    // Monthly statistics
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyOutings = await OutingRequest.countDocuments({
      month: currentMonth,
      year: currentYear
    });

    return res.json({
      success: true,
      data: {
        total: totalOutings,
        approved: approvedOutings,
        rejected: rejectedOutings,
        pending: pendingOutings,
        monthly: monthlyOutings
      }
    });
  } catch (err) {
    console.error("❌ Get Outing Stats Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};