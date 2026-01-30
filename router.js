// router.js
const express = require('express');
const router = express.Router();

const usercontroller = require('./CONTROLLER/usercontroller');
const otpcontroller = require('./CONTROLLER/forgotPasswordController');
const messcutcontroller = require('./CONTROLLER/messcutController');
const complaintController  = require('./CONTROLLER/complaintController');
const apologycontroller  = require('./CONTROLLER/apologyController');
const holidayController = require("./CONTROLLER/holidayController");
const messcutreport = require("./CONTROLLER/messcutreport");
const attendancereportcontroller = require("./CONTROLLER/attendancereportcontroller");
const parentlogin = require("./CONTROLLER/parentAuthController");
const feeDueController = require("./CONTROLLER/feeDueController");
const uploadProfile = require("./middleware/profileUpload");
const outingController = require("./CONTROLLER/outingController");
const outingstudentController = require("./CONTROLLER/outingstudentController");
// login
router.post("/register", usercontroller.addUser);
router.post("/login", usercontroller.loginUser);
router.get("/user", usercontroller.getUserByAdmission);
router.put('/update-password', usercontroller.updatePassword);
router.post("/send-otp", otpcontroller.sendOtp);
router.post("/verify-otp", otpcontroller.verifyOtp);
router.post("/reset-password", otpcontroller.resetPassword);
router.get("/sem-list",usercontroller. getSemesterList);
router.get("/by-sem", usercontroller.getStudentsBySem);
router.get("/all",usercontroller. getAllStudents);
router.get("/count", usercontroller.getStudentAndRoomCount);
router.get("/users/map", usercontroller.getAllStudentsMap);

// for apology
router.get("/rooms", usercontroller.getAllRooms);
router.get("/studentsByRoom", usercontroller.getStudentsByRoom);


// messcutform
router.post("/adddetail", messcutcontroller.createMesscutRequest);                // student submit
router.get("/messcut/student", messcutcontroller.getMesscutRequestsByStudent);   // get own requests
router.get("/messcut/all",messcutcontroller. getAllMesscutRequests);             // admin view all
router.put("/messcut/status/:id", messcutcontroller.updateMesscutStatus); 
router.get("/messcut/count", messcutcontroller.getMesscutCount);
router.get("/messcut/clear/count", messcutcontroller.getMesscutCounts);
router.put("/parent-status/:id",messcutcontroller. updateParentStatus);

// complainnt form
router.post("/add", complaintController.createComplaint); // Student submits complaint
router.get("/api/complaints/student", complaintController.getComplaintsByStudent); // Student view own
router.get("/allcomplaint/all", complaintController.getAllComplaints); // Admin view all
router.put("/api/complaint/update/:id", complaintController.updateComplaint); // Admin updates
router.get("/allcomplaint/count", complaintController.getComplaintPendingCount);


// apologyrequest
router.post("/apology/add", apologycontroller.addApologyRequest);
router.get("/api/apology/all", apologycontroller.getAllApologyRequests);
router.get("/by-student",apologycontroller. getApologyByStudent);
router.put("/api/apology/update/:id", apologycontroller.updateApologyStatus);
router.get("/count/pending", apologycontroller.getPendingApologyCount);
router.get(
  "/by-student/apologyadmison",
  apologycontroller.getApologyByAdmissionNo
);

// Holiday select
router.post("/api/holiday/add", holidayController.addHoliday);
router.get("/api/holiday/all", holidayController.getAllHolidays);
router.delete("/api/holiday/delete/:id", holidayController.deleteHoliday);
router.put("/api/holiday/update/:id", holidayController.updateHoliday);
// messcutreport

router.get("/api/messcut/report", messcutreport.getMesscutReport);
router.get("/api/messcut/student", messcutreport.getMesscutDetailsByStudent)
router.get("/api/messcut/all-details", messcutreport.getAllMesscutDetails)
router.get("/api/messcut/by-date", messcutreport.getMesscutByDate);
router.get("/api/messcut/by-date", messcutreport.getMesscutByDate);
router.get(
  "/api/messcut/by-datereport",
  messcutreport.getDateWiseMesscutReport
);
router.get("/api/messcut/month-wise", messcutreport.getNameWiseMonthReport);

//attendancereportmodel
router.post("/attendance/save", attendancereportcontroller.saveAttendance);
router.get("/attendance", attendancereportcontroller.getAttendanceByDate);
router.get("/attendance/absentees", attendancereportcontroller.getAbsenteesByDate);
router.post("/attendance/publish", attendancereportcontroller.publishAttendance);
router.get(
  "/attendance/parent/history",
  attendancereportcontroller.getAbsentHistoryForParent
);

// routes/attendanceRoutes.js
router.get("/attendance/parent/today", attendancereportcontroller.getTodayAttendanceForParent);

// ✅ MONTHLY FULL REPORT
router.get("/attendance/monthly", attendancereportcontroller.getMonthlyAttendance);

// parent login
router.post("/api/parent/login",parentlogin. loginParent);
router.post("/api/parent/change-password", parentlogin.changeParentPassword);



// fee duee
router.get("/fees/get", feeDueController.getAllFeeDetails);
router.get("/fees/get/:admissionNumber", feeDueController.getFeeByAdmissionNumber);
router.post("/fees/bulk", feeDueController.addBulkFeeDue);
router.delete("/fees/bulk-delete", feeDueController.deleteBulkFeeDue);

/* ================= PROFILE PHOTO ================= */
// PROFILE PHOTO
router.put(
  "/studentprofile/api/profile-photo/:id",
  uploadProfile.single("photo"),
  usercontroller.updateProfilePhoto
);

// GET ALL STUDENTS
router.get("/studentprofile/api", usercontroller.getStudents);

// GET SINGLE STUDENT
router.get("/studentprofile/api/:id", usercontroller.getStudentById);

// ADD STUDENT
router.post("/studentprofile/api", usercontroller.addStudent);

// UPDATE STUDENT
router.put("/studentprofile/api/:id", usercontroller.updateStudent);

// DELETE STUDENT
router.delete("/studentprofile/api/:id", usercontroller.deleteStudent);


// ================= BULK SEMESTER MANAGEMENT =================
router.get(
  "/students/bulk-sem",
  usercontroller.getAllStudentsForBulk
);

router.post(
  "/students/bulk-sem-update",
  usercontroller.bulkChangeSemester
);

//outgoingcontrolelr
router.post("/admin/eligibility", outingController.setEligibilityBulk);
router.get(
  "/student/eligibility/:admissionNumber",
  outingController.checkEligibility
);
router.get("/admin/outing/eligible", outingController.getEligibleStudents);





// outingstudent
router.post("/outing/request", outingstudentController.requestOuting);
router.get("/outing/student/:admissionNumber", outingstudentController.getStudentOutings);
router.get("/outing/count", outingstudentController.getMonthlyOutingCount);
router.put("/outing/parent/:id", outingstudentController.parentDecision);
router.put("/outing/admin/:id", outingstudentController.adminDecision);

router.put("/outing/parent/:id", outingstudentController.parentDecision);
router.get("/outing/admin/all", outingstudentController.getAllOutingRequests);
router.put("/outing/admin/:id", outingstudentController.adminDecision);
router.get("/outing/admin/report", outingstudentController.getMonthlyReport);
router.get("/outing/admin/stats", outingstudentController.getOutingStats);
router.get("/outing/admin/eligible", outingstudentController.getEligibleStudents);


module.exports = router;

