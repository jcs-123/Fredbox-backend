const ApologyRequest = require('../MODEL/ApologyRequest');

/* 🟢 Add new apology request */
exports. addApologyRequest = async (req, res) => {
  try {
    const { roomNo, studentName, admissionNo, reason, submittedBy } = req.body;

    if (!roomNo || !studentName || !admissionNo || !reason || !submittedBy) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newRequest = new ApologyRequest({
      roomNo,
      studentName,
      admissionNo,
      reason,
      submittedBy,
    });

    await newRequest.save();

    res.status(201).json({
      success: true,
      message: "Apology Request submitted successfully",
      data: newRequest,
    });
  } catch (error) {
    console.error("❌ Error adding apology request:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* 🟡 Get all apology requests */
exports.getAllApologyRequests = async (req, res) => {
  try {
    const requests = await ApologyRequest.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("❌ Error fetching apology requests:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* 🟣 Get apology requests by student (for student dashboard) */
exports. getApologyByStudent = async (req, res) => {
  try {
    const { admissionNo } = req.query;
    if (!admissionNo) {
      return res.status(400).json({ success: false, message: "Admission number required" });
    }

    const data = await ApologyRequest.find({ admissionNo }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("❌ Error fetching student apology:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* 🔵 Update request status (for admin approval/rejection) */
exports. updateApologyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const updated = await ApologyRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ success: false, message: "Request not found" });

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    console.error("❌ Error updating status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.getPendingApologyCount = async (req, res) => {
  try {
    const pending = await ApologyRequest.countDocuments({ status: "Pending" });

    return res.status(200).json({
      success: true,
      pending,
    });

  } catch (err) {
    console.error("❌ Apology Pending Count Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
exports.getApologyByAdmissionNo = async (req, res) => {
  try {
    const { admissionNo } = req.query;

    if (!admissionNo) {
      return res.status(400).json({
        success: false,
        message: "Admission number required",
      });
    }

    const data = await ApologyRequest.find({ admissionNo })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("❌ Error fetching apology by admission:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
