const Holiday = require("../MODEL/Holiday");

/* 🟢 Add new holiday */
exports.addHoliday = async (req, res) => {
  try {
    const { date, reason, holidayType } = req.body;

    if (!date || !reason || !holidayType) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const holiday = new Holiday({ date, reason, holidayType });
    await holiday.save();

    res.status(201).json({
      success: true,
      message: "Holiday event added successfully",
      data: holiday,
    });
  } catch (error) {
    console.error("❌ Error adding holiday:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* 🟣 Get all holidays */
exports.getAllHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: holidays });
  } catch (error) {
    console.error("❌ Error fetching holidays:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* 🔵 Delete a holiday */
exports.deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Holiday.findByIdAndDelete(id);

    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Holiday not found" });

    res.json({ success: true, message: "Holiday deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting holiday:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* 🟡 Update a holiday (optional) */
exports.updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, reason, holidayType } = req.body;

    const updated = await Holiday.findByIdAndUpdate(
      id,
      { date, reason, holidayType },
      { new: true }
    );

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Holiday not found" });

    res.json({ success: true, message: "Holiday updated successfully", data: updated });
  } catch (error) {
    console.error("❌ Error updating holiday:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
