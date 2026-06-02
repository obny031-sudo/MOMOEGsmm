const Notification = require("../models/Notification");

function formatTime(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      notifications: notifications.map((item, index) => ({
        id: index + 1,
        type: item.type,
        title: item.title,
        text: item.text,
        time: formatTime(item.createdAt),
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Notifications error" });
  }
};
