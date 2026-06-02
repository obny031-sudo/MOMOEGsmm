const Notification = require("../models/Notification");

/** Welcome notifications for new accounts */
exports.seedWelcomeNotifications = async (userId) => {
  const count = await Notification.countDocuments({ user: userId });
  if (count > 0) return;

  await Notification.insertMany([
    {
      user: userId,
      type: "wallet",
      title: "Welcome to MOMOEG",
      text: "Your wallet is ready",
    },
    {
      user: userId,
      type: "system",
      title: "Security Verified",
      text: "Account created successfully",
    },
  ]);
};
