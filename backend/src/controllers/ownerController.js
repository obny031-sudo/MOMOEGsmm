const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const { getSettingsMap, setSetting } = require("../services/settingsService");
const { logAudit } = require("../utils/audit");
const Session = require("../models/Session");

exports.getOwnerDashboard = async (req, res) => {
  const settings = await getSettingsMap();
  const [admins, recentAudit, failedOrders] = await Promise.all([
    User.find({ role: { $in: ["admin", "owner"] } }).select(
      "username email role status createdAt"
    ),
    AuditLog.find().sort({ createdAt: -1 }).limit(20),
    require("../models/Order").countDocuments({ status: "Failed" }),
  ]);

  res.json({
    success: true,
    panicMode: Boolean(settings.panicMode),
    admins,
    recentAudit,
    failedOrders,
  });
};

exports.setPanicMode = async (req, res) => {
  const enabled = Boolean(req.body.enabled);
  await setSetting("panicMode", enabled);
  await setSetting("maintenanceMode", enabled);
  if (enabled) {
    await setSetting("depositsEnabled", false);
    await setSetting("registrationEnabled", false);
  }

  if (enabled) {
    await Session.deleteMany({
      user: { $in: await User.find({ role: { $in: ["admin", "moderator", "staff"] } }).distinct("_id") },
    });
  }

  await logAudit(req, {
    action: "owner.panic",
    resource: "platform",
    metadata: { enabled },
  });

  res.json({ success: true, panicMode: enabled });
};

exports.updateAdminRole = async (req, res) => {
  const { role } = req.body;
  const allowed = ["admin", "moderator", "staff", "user"];
  if (!allowed.includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  if (user.role === "owner") {
    return res.status(403).json({ success: false, message: "Cannot modify owner" });
  }

  user.role = role;
  await user.save();

  await logAudit(req, {
    action: "owner.role_change",
    resource: "user",
    resourceId: user._id,
    metadata: { role },
  });

  res.json({ success: true, user });
};

exports.forceLogoutStaff = async (req, res) => {
  const staffIds = await User.find({
    role: { $in: ["admin", "moderator", "staff"] },
  }).distinct("_id");
  await Session.deleteMany({ user: { $in: staffIds } });
  await logAudit(req, { action: "owner.force_logout_staff", resource: "session" });
  res.json({ success: true });
};
