const crypto = require("crypto");
const EmailOtp = require("../models/EmailOtp");

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function createOtp(userId, email, purpose) {
  const code = generateCode();
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await EmailOtp.deleteMany({ user: userId, purpose, used: false });

  await EmailOtp.create({
    user: userId,
    email,
    codeHash,
    purpose,
    expiresAt,
  });

  return code;
}

async function verifyOtp(userId, purpose, code) {
  const doc = await EmailOtp.findOne({
    user: userId,
    purpose,
    used: false,
    expiresAt: { $gt: new Date() },
  }).select("+codeHash");

  if (!doc) return false;

  const hash = crypto.createHash("sha256").update(String(code)).digest("hex");
  if (hash !== doc.codeHash) return false;

  doc.used = true;
  await doc.save();
  return true;
}

async function sendOtpEmail(to, code, purpose) {
  const subject =
    purpose === "email_change"
      ? "MOMOEG — Verify your new email"
      : "MOMOEG — Password change verification";
  const body = `Your verification code is: ${code}\n\nThis code expires in 10 minutes.`;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    console.log(`[email] OTP to ${to}: ${code}`);
    return true;
  }

  console.log(`[email-otp] ${to} | ${purpose} | code: ${code}`);
  return true;
}

module.exports = { createOtp, verifyOtp, sendOtpEmail };
