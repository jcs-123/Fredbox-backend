const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* ===============================
   UPLOAD DIRECTORY
================================ */
const uploadDir = path.join(
  __dirname,
  "..",
  "uploads",
  "students",
  "profile"
);

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ===============================
   STORAGE CONFIG
================================ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    // Prefer studentId → fallback to timestamp
    const studentId =
      req.params.studentId ||
      req.params.id ||
      req.body.studentId ||
      "student";

    cb(
      null,
      `student_${studentId}_${Date.now()}${ext}`
    );
  },
});

/* ===============================
   FILE FILTER
================================ */
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPG, JPEG, PNG allowed"),
      false
    );
  }
};

/* ===============================
   MULTER INSTANCE
================================ */
const uploadStudentProfile = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

module.exports = uploadStudentProfile;
