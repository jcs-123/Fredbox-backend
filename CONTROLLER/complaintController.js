const Complaint = require('../MODEL/Complaint');
/* 🟢 Student submits complaint */
exports.createComplaint = async (req, res) => {
  try {
    const { name, admissionNo, roomNo, complaint } = req.body;

    if (!name || !admissionNo || !roomNo || !complaint) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const newComplaint = new Complaint({
      name,
      admissionNo,
      roomNo,
      complaint,
    });

    await newComplaint.save();
    res
      .status(201)
      .json({ success: true, message: "Complaint submitted successfully" });
  } catch (error) {
    console.error("❌ Error saving complaint:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* 🟡 Get complaints by student */
exports. getComplaintsByStudent = async (req, res) => {
  try {
    const { admissionNo } = req.query;

    if (!admissionNo)
      return res
        .status(400)
        .json({ success: false, message: "Admission number required" });

    const complaints = await Complaint.find({ admissionNo }).sort({
      createdAt: -1,
    });

    res.json({ success: true, data: complaints });
  } catch (error) {
    console.error("❌ Error fetching complaints:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* 🔵 Admin fetches all complaints */
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json({ success: true, data: complaints });
  } catch (error) {
    console.error("❌ Error fetching all complaints:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* 🟠 Update complaint status and add remark */


// 🟢 Update Complaint Status or Remark
exports.updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remark } = req.body;

    console.log("📥 Received update request:", { id, status, remark });

    const updateData = {};

    // Allow updating status if sent
    if (status) updateData.status = status;

    // Allow updating remark even if it's empty string
    if (remark !== undefined) {
      updateData.remark = remark;
      updateData.remarkAddedAt = new Date();
    }

    // ❗️ Stop empty requests
    if (Object.keys(updateData).length === 0) {
      console.log("⚠️ Empty update data received");
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
        received: req.body,
      });
    }

    // 🧠 Perform update
    const updatedComplaint = await Complaint.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedComplaint) {
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });
    }

    console.log("✅ Complaint updated:", updatedComplaint);
    res.json({
      success: true,
      message: "Complaint updated successfully",
      data: updatedComplaint,
    });
  } catch (err) {
    console.error("❌ Update error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};
// controllers/complaintController.js

exports.getComplaintPendingCount = async (req, res) => {
  try {
    const pending = await Complaint.countDocuments({ status: "Pending" });

    return res.status(200).json({
      success: true,
      pending
    });

  } catch (err) {
    console.error("❌ Complaint Pending Count Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

