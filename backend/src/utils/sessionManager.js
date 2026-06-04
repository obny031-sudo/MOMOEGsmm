const crypto = require("crypto");
const Session = require("../models/Session");

function parseUserAgent(ua = "") {
  const s = String(ua);
  let browser = "Browser";
  if (s.includes("Chrome")) browser = "Chrome";
  else if (s.includes("Firefox")) browser = "Firefox";
  else if (s.includes("Safari")) browser = "Safari";
  else if (s.includes("Edge")) browser = "Edge";

  let device = "Desktop";
  if (/mobile|android|iphone/i.test(s)) device = "Mobile";
  else if (/tablet|ipad/i.test(s)) device = "Tablet";

  return { browser, device: `${device} · ${browser}` };
}

async function createSession(userId, req, tokenId) {
  const ua = req.headers["user-agent"] || "";
  const { browser, device } = parseUserAgent(ua);
  const ip = req.ip || req.headers["x-forwarded-for"] || "";

  await Session.updateMany({ user: userId }, { current: false });

  return Session.create({
    user: userId,
    tokenId,
    device,
    browser,
    ip: String(ip).split(",")[0].trim(),
    lastActivity: new Date(),
    current: true,
  });
}

async function touchSession(tokenId) {
  if (!tokenId) return;
  await Session.findOneAndUpdate(
    { tokenId },
    { lastActivity: new Date() }
  );
}

function tokenIdFromJwt(token) {
  return crypto.createHash("sha256").update(token).digest("hex").slice(0, 32);
}

module.exports = {
  createSession,
  touchSession,
  tokenIdFromJwt,
  parseUserAgent,
};
