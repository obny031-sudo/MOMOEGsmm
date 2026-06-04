const ROLE_PERMISSIONS = {
  owner: ["*"],
  admin: ["*"],
  moderator: [
    "users.read",
    "users.moderate",
    "orders.read",
    "orders.update",
    "tickets.*",
    "announcements.read",
    "audit.read",
  ],
  staff: ["orders.read", "orders.update", "tickets.*", "users.read"],
  reseller: ["orders.read", "orders.create"],
  vip: [],
  user: [],
};

function hasPermission(role, permission) {
  const perms = ROLE_PERMISSIONS[role] || [];
  if (perms.includes("*")) return true;
  if (perms.includes(permission)) return true;
  const [group] = permission.split(".");
  return perms.includes(`${group}.*`);
}

exports.requirePermission = (permission) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  if (hasPermission(req.user.role, permission)) {
    return next();
  }
  return res.status(403).json({ success: false, message: "Permission denied" });
};

exports.canManageRoles = (actor, targetRole) => {
  if (actor.role === "owner") return targetRole !== "owner";
  if (actor.role === "admin") return !["admin", "owner"].includes(targetRole);
  if (actor.role === "moderator") {
    return !["admin", "moderator", "staff", "owner"].includes(targetRole);
  }
  return false;
};

exports.isStaffRole = (role) =>
  ["owner", "admin", "moderator", "staff"].includes(role);
