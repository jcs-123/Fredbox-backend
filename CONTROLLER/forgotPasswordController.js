// CONTROLLER/forgotPasswordController.js
const User = require("../MODEL/usermodel");
const OTP = require("../MODEL/otpModel");
const nodemailer = require("nodemailer");

/* ======================================================
   🟢 1. Send OTP to Email
====================================================== */
exports.sendOtp = async (req, res) => {
  try {
    const { gmail } = req.body;

    if (!gmail) {
      return res
        .status(400)
        .json({ success: false, message: "⚠️ Gmail is required." });
    }

    const user = await User.findOne({ gmail: gmail.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "❌ No user found with this email address.",
      });
    }

    // 🔢 Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 🧹 Remove old OTPs for this Gmail
    await OTP.deleteMany({ gmail });

    // 💾 Save new OTP
    const otp = new OTP({ gmail, otp: otpCode });
    await otp.save();

    /* ------------------------------------------------------
       📧 Nodemailer Transporter Setup (Direct credentials)
       👉 Use this version if .env not working
    ------------------------------------------------------ */
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "jcs@jecc.ac.in", // 🔹 Replace with your Gmail
        pass: "jtdy hwqg rtae ngiv",   // 🔹 Replace with your App Password
      },
    });

    // ✅ Optional: verify connection
    transporter.verify((error, success) => {
      if (error) {
        console.error("❌ SMTP Error:", error);
      } else {
        console.log("✅ SMTP server ready to send emails");
      }
    });

    /* ------------------------------------------------------
       💌 Email Content
    ------------------------------------------------------ */
const mailOptions = {
  from: `"Santhome Information Management System" <yourgmail@gmail.com>`,
  to: gmail,
  subject: "🔐 OTP Verification – Santhome Information Management System (SIM)",
  html: `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 25px; background: #f5f8fb; border-radius: 10px; border: 1px solid #e0e0e0;">
      <div style="text-align: center; padding-bottom: 10px;">
        <h1 style="color: #1565C0; margin: 0;">Santhome Information Management System</h1>
        <p style="color: #555; margin: 5px 0;">Jyothi Engineering College, Cheruthuruthy</p>
        <hr style="border: none; border-top: 2px solid #1976d2; width: 80px; margin: 15px auto;">
      </div>

      <p style="font-size: 16px; color: #333;">
        Dear <b>${user.name}</b>,
      </p>

      <p style="font-size: 15px; color: #444;">
        We received a request to reset your password for your <b>Santhome Information Management (SIM)</b> account.
      </p>

      <p style="font-size: 15px; color: #444; margin-bottom: 5px;">
        Please use the One-Time Password (OTP) below to verify your identity:
      </p>

      <div style="background: #1976d2; color: #fff; text-align: center; border-radius: 8px; font-size: 32px; font-weight: bold; padding: 15px 0; letter-spacing: 4px; margin: 15px 0;">
        ${otpCode}
      </div>

      <p style="font-size: 14px; color: #444;">
        🔸 This OTP is valid for <b>5 minutes</b> only.<br>
        🔸 Do not share this code with anyone for your account security.
      </p>

      <p style="font-size: 14px; color: #666;">
        If you didn’t request this change, you can safely ignore this message.
      </p>

      <br>
      <p style="font-size: 14px; color: #333;">
        Regards,<br>
        <b>Santhome Information Management System</b><br>
        Jcs – Jyothi Engineering College<br>
        <a href="https://jecc.ac.in" style="color:#1565C0; text-decoration:none;">jecc.ac.in</a>
      </p>
    </div>
  `,
};


    // 📤 Send Email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "✅ OTP sent successfully to your email.",
    });
  } catch (error) {
    console.error("❌ Error in sendOtp:", error);
    return res.status(500).json({
      success: false,
      message: "❌ Server error while sending OTP.",
      error: error.message,
    });
  }
};

/* ======================================================
   🟢 2. Verify OTP
====================================================== */
exports.verifyOtp = async (req, res) => {
  try {
    const { gmail, otp } = req.body;

    if (!gmail || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "⚠️ Gmail and OTP are required." });
    }

    const otpRecord = await OTP.findOne({ gmail, otp });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "❌ Invalid or expired OTP. Please try again.",
      });
    }

    // ✅ OTP verified → delete from DB
    await OTP.deleteMany({ gmail });

    return res.status(200).json({
      success: true,
      message: "✅ OTP verified successfully.",
    });
  } catch (error) {
    console.error("❌ Error in verifyOtp:", error);
    return res.status(500).json({
      success: false,
      message: "❌ Server error during OTP verification.",
      error: error.message,
    });
  }
};

/* ======================================================
   🟢 3. Reset Password
====================================================== */
exports.resetPassword = async (req, res) => {
  try {
    const { gmail, newPassword, confirmPassword } = req.body;

    if (!gmail || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "⚠️ Gmail, new password, and confirm password are required.",
      });
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      return res.status(400).json({
        success: false,
        message: "❌ Passwords do not match.",
      });
    }

    if (newPassword.trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: "❌ Password must be at least 6 characters long.",
      });
    }

    const user = await User.findOne({ gmail: gmail.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "❌ User not found with this Gmail.",
      });
    }

    user.password = newPassword.trim();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "✅ Password reset successfully.",
    });
  } catch (error) {
    console.error("❌ Error in resetPassword:", error);
    return res.status(500).json({
      success: false,
      message: "❌ Server error during password reset.",
      error: error.message,
    });
  }
};
