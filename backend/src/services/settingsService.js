const Setting = require("../models/Setting");

const DEFAULTS = {
  defaultNewUserBalance: 0,
  dailyLoginReward: 0.00001,
  dailyLoginEnabled: true,
  maintenanceMode: false,
  maintenanceMessage: "MOMOEG is undergoing maintenance. Please check back soon.",
  featureCoupons: true,
  featureReferrals: true,
  featureDailyReward: true,
};

async function ensureDefaults() {
  for (const [key, value] of Object.entries(DEFAULTS)) {
    await Setting.findOneAndUpdate(
      { key },
      { $setOnInsert: { key, value, group: "system" } },
      { upsert: true }
    );
  }
}

async function getSetting(key, fallback = null) {
  const doc = await Setting.findOne({ key });
  if (!doc) return fallback ?? DEFAULTS[key] ?? null;
  return doc.value;
}

async function getSettingsMap() {
  await ensureDefaults();
  const docs = await Setting.find();
  const map = { ...DEFAULTS };
  docs.forEach((d) => {
    map[d.key] = d.value;
  });
  return map;
}

async function setSetting(key, value, meta = {}) {
  return Setting.findOneAndUpdate(
    { key },
    {
      key,
      value,
      group: meta.group || "system",
      description: meta.description || "",
    },
    { upsert: true, new: true }
  );
}

async function getDefaultNewUserBalance() {
  const val = await getSetting("defaultNewUserBalance", 0);
  return Math.max(0, Number(val) || 0);
}

module.exports = {
  DEFAULTS,
  ensureDefaults,
  getSetting,
  getSettingsMap,
  setSetting,
  getDefaultNewUserBalance,
};
