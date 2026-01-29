const OutingRequest = require("../MODEL/OutingRequest");

/* =====================================================
   ADMIN – SET ELIGIBILITY (BULK)
   Uses ONLY:
   - admissionNumber
   - studentName
   - isEligible (YES / NO)
===================================================== */
exports.setEligibilityBulk = async (req, res) => {
  try {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No students received",
      });
    }

    const ops = students.map((s) => ({
      updateOne: {
        filter: { admissionNumber: s.admissionNumber },
        update: {
          $set: {
            studentName: s.studentName,
            isEligible: s.isEligible === "YES" ? "YES" : "NO",
          },
        },
        upsert: true, // create if not exists
      },
    }));

    await OutingRequest.bulkWrite(ops);

    res.json({
      success: true,
      message: "Eligibility updated successfully",
    });
  } catch (err) {
    console.error("Eligibility error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =====================================================
   STUDENT – CHECK ELIGIBILITY
===================================================== */
exports.checkEligibility = async (req, res) => {
  try {
    const { admissionNumber } = req.params;

    const record = await OutingRequest.findOne({ admissionNumber });

    if (!record || record.isEligible !== "YES") {
      return res.status(403).json({
        success: false,
        eligible: false,
        message: "Student is not eligible",
      });
    }

    res.json({
      success: true,
      eligible: true,
      data: {
        admissionNumber: record.admissionNumber,
        studentName: record.studentName,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =====================================================
   GET ONLY ELIGIBLE STUDENTS
===================================================== */
exports.getEligibleStudents = async (req, res) => {
  try {
    const eligible = await OutingRequest.find(
      { isEligible: "YES" },
      { admissionNumber: 1, studentName: 1, _id: 0 }
    );

    res.json({
      success: true,
      data: eligible,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};