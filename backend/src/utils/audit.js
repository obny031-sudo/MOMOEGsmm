const AuditLog = require("../models/AuditLog");

async function logAudit(req, { action, resource, resourceId = "", metadata = {} }) {
  try {
    await AuditLog.create({
      actor: req.user._id,
      actorUsername: req.user.username,
      actorRole: req.user.role,
      action,
      resource,
      resourceId: String(resourceId),
      metadata,
      ip: req.ip || req.headers["x-forwarded-for"] || "",
    });
  } catch (error) {
    console.error("Audit log error:", error.message);
  }
}

module.exports = { logAudit };
