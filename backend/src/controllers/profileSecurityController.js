const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Session = require("../models/Session");
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");
const { createOtp, verifyOtp, sendOtpEmail } = require("../utils/emailOtp");
const { tokenIdFromJwt } = require("../utils/sessionManager");

exports.getSessions = async (req, res) => {
  const sessions = await Session.find({ user: req.user._id })
    .sort({ lastActivity: -1 })
    .limit(20);
  const tokenId = tokenIdFromJwt(
    req.headers.authorization?.split(" ")[1] || ""
  );
  res.json({
    success: true,
    sessions: sessions.map((s) => ({
      _id: s._id,
      device: s.device,
      browser: s.browser,
      ip: s.ip,
      lastActivity: s.lastActivity,
      current: s.tokenId === tokenId,
      createdAt: s.createdAt,
    })),
  });
};

exports.getLoginHistory = async (req, res) => {
  const user = await User.findById(req.user._id).select("loginHistory devices");
  res.json({
    success: true,
    loginHistory: (user?.loginHistory || []).slice(-30).reverse(),
    devices: (user?.devices || []).slice(-20).reverse(),
  });
};

exports.requestPasswordOtp = async (req, res) => {
  const { currentPassword } = req.body;
  if (!currentPassword) {
    return res.status(400).json({ success: false, message: "Current password required" });
  }

  const user = await User.findById(req.user._id).select("+password");
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return res.status(400).json({ success: false, message: "Incorrect password" });
  }

  const code = await createOtp(user._id, user.email, "password_change");
  await sendOtpEmail(user.email, code, "password_change");

  res.json({ success: true, message: "Verification code sent to your email" });
};

exports.confirmPasswordChange = async (req, res) => {
  const { code, newPassword } = req.body;
  if (!code || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  const ok = await verifyOtp(req.user._id, "password_change", code);
  if (!ok) {
    return res.status(400).json({ success: false, message: "Invalid or expired code" });
  }

  const user = await User.findById(req.user._id).select("+password");
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ success: true, message: "Password updated" });
};

exports.requestEmailOtp = async (req, res) => {
  const { newEmail, currentPassword } = req.body;
  const email = String(newEmail || "").trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ success: false, message: "Email required" });
  }

  const user = await User.findById(req.user._id).select("+password");
  if (currentPassword) {
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ success: false, message: "Incorrect password" });
    }
  }

  const exists = await User.findOne({ email, _id: { $ne: user._id } });
  if (exists) {
    return res.status(400).json({ success: false, message: "Email already in use" });
  }

  const code = await createOtp(user._id, email, "email_change");
  await sendOtpEmail(email, code, "email_change");

  res.json({ success: true, message: "Verification code sent" });
};

exports.confirmEmailChange = async (req, res) => {
  const { code, newEmail } = req.body;
  const email = String(newEmail || "").trim().toLowerCase();
  const ok = await verifyOtp(req.user._id, "email_change", code);
  if (!ok) {
    return res.status(400).json({ success: false, message: "Invalid or expired code" });
  }

  const user = await User.findById(req.user._id);
  user.email = email;
  user.verified = false;
  await user.save();

  res.json({ success: true, message: "Email updated", email });
};

exports.revokeSession = async (req, res) => {
  await Session.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ success: true });
};

exports.revokeOtherSessions = async (req, res) => {
  const tokenId = tokenIdFromJwt(
    req.headers.authorization?.split(" ")[1] || ""
  );
  await Session.deleteMany({
    user: req.user._id,
    tokenId: { $ne: tokenId },
  });
  res.json({ success: true, message: "Other sessions logged out" });
};

exports.getActivity = async (req, res) => {
  const [orders, transactions] = await Promise.all([
    Order.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(15).lean(),
    Transaction.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(15).lean(),
  ]);

  const timeline = [
    ...orders.map((o) => ({
      type: "order",
      title: o.serviceName,
      detail: `${o.status} · ${o.totalCharge} EGP`,
      at: o.createdAt,
    })),
    ...transactions.map((t) => ({
      type: "wallet",
      title: t.type,
      detail: `${t.amount >= 0 ? "+" : ""}${t.amount} EGP`,
      at: t.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 25);

  res.json({ success: true, timeline, orders, transactions });
};
