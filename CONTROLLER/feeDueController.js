const FeeDue = require("../MODEL/FeeDue");

/* -------------------------------------------------------
   BULK ADD FEE DUE (MANUAL totalDue)
   POST /fees/bulk
------------------------------------------------------- */
exports.addBulkFeeDue = async (req, res) => {
  try {
    const feeList = req.body;

    if (!Array.isArray(feeList) || feeList.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a non-empty array",
      });
    }

    const inserted = [];
    const skipped = [];

    for (const student of feeList) {
      const {
        admissionNumber,
        name,
        branch,
        semester,
        phoneNumber,
        totalPaid = 0,
        totalDue,
      } = student;

      // ✅ REQUIRED VALIDATION
      if (!admissionNumber || !name || totalDue === undefined) {
        skipped.push({
          admissionNumber: admissionNumber || "UNKNOWN",
          reason: "Missing required fields (admissionNumber, name, totalDue)",
        });
        continue;
      }

      if (totalPaid < 0 || totalDue < 0) {
        skipped.push({
          admissionNumber,
          reason: "totalPaid / totalDue cannot be negative",
        });
        continue;
      }

      // 🔁 DUPLICATE CHECK
      const exists = await FeeDue.findOne({ admissionNumber });
      if (exists) {
        skipped.push({
          admissionNumber,
          reason: "Admission number already exists",
        });
        continue;
      }

      // ✅ CREATE DOCUMENT (NO AUTO CALC)
      const feeDoc = new FeeDue({
        admissionNumber,
        name,
        branch,
        semester,
        phoneNumber,
        totalPaid,
        totalDue,
      });

      await feeDoc.save();
      inserted.push(admissionNumber);
    }

    return res.status(201).json({
      success: true,
      message: "Bulk fee upload completed",
      insertedCount: inserted.length,
      skippedCount: skipped.length,
      inserted,
      skipped,
    });
  } catch (error) {
    console.error("❌ Bulk fee insert error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while inserting bulk fee data",
    });
  }
};

/* -------------------------------------------------------
   GET FEE DETAILS BY ADMISSION NUMBER
   GET /fees/get/:admissionNumber
------------------------------------------------------- */
exports.getFeeByAdmissionNumber = async (req, res) => {
  try {
    const { admissionNumber } = req.params;

    if (!admissionNumber) {
      return res.status(400).json({
        success: false,
        message: "Admission number is required",
      });
    }

    const feeData = await FeeDue.findOne({ admissionNumber });

    if (!feeData) {
      return res.status(404).json({
        success: false,
        message: "Fee details not found for this admission number",
      });
    }

    return res.status(200).json({
      success: true,
      data: feeData,
    });
  } catch (error) {
    console.error("❌ Error fetching fee by admission number:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching fee details",
    });
  }
};

/* -------------------------------------------------------
   GET ALL FEE DETAILS
   GET /fees/get
------------------------------------------------------- */
exports.getAllFeeDetails = async (req, res) => {
  try {
    const feeList = await FeeDue.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: feeList.length,
      data: feeList,
    });
  } catch (error) {
    console.error("❌ Error fetching all fee details:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching fee list",
    });
  }
};

/* -------------------------------------------------------
   BULK DELETE FEE DETAILS
   DELETE /fees/bulk-delete
------------------------------------------------------- */
exports.deleteBulkFeeDue = async (req, res) => {
  try {
    const { admissionNumbers } = req.body;

    if (!Array.isArray(admissionNumbers) || admissionNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "admissionNumbers must be a non-empty array",
      });
    }

    const deleted = [];
    const notFound = [];

    for (const admissionNumber of admissionNumbers) {
      const record = await FeeDue.findOne({ admissionNumber });

      if (!record) {
        notFound.push(admissionNumber);
        continue;
      }

      await FeeDue.deleteOne({ admissionNumber });
      deleted.push(admissionNumber);
    }

    return res.status(200).json({
      success: true,
      message: "Bulk delete completed",
      deletedCount: deleted.length,
      notFoundCount: notFound.length,
      deleted,
      notFound,
    });
  } catch (error) {
    console.error("❌ Bulk delete error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting fee records",
    });
  }
};
