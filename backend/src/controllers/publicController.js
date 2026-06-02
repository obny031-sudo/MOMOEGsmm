const { getSettingsMap } = require("../services/settingsService");
const Announcement = require("../models/Announcement");

exports.getPublicSettings = async (req, res) => {
  const settings = await getSettingsMap();
  res.json({
    success: true,
    maintenanceMode: Boolean(settings.maintenanceMode),
    maintenanceMessage: settings.maintenanceMessage,
    featureDailyReward: Boolean(settings.featureDailyReward),
  });
};

exports.getAnnouncements = async (req, res) => {
  const items = await Announcement.find({ active: true })
    .sort({ createdAt: -1 })
    .limit(10);
  res.json({ success: true, announcements: items });
};
