const User = require("../models/User");
const Notification = require("../models/Notification");
const Order = require("../models/Order");

function rankFromRole(role, vipTier) {
  if (role === "admin") return "Admin";
  if (role === "vip") return `VIP ${vipTier || ""}`.trim();
  return "Standard";
}

exports.getDashboard = async (req, res) => {
  try {
    const user =
      (await User.findById(req.user._id).select(
        "username email avatar balance bonus spent pendingOrders verified role vipTier status createdAt"
      )) || req.user;

    const balance = user.balance ?? 0;
    const spent = user.spent ?? 0;
    const pending = user.pendingOrders ?? 0;
    const bonus = user.bonus ?? 0;

    const [notificationCount, recentOrders] = await Promise.all([
      Notification.countDocuments({ user: user._id, read: false }),
      Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(6),
    ]);

    const orderFeed =
      recentOrders.length > 0
        ? recentOrders.map(
            (o) => `${o.serviceName} • ${o.status}`
          )
        : [
            "No orders yet • Place your first order",
            "Services are live • Browse catalog",
          ];

    res.status(200).json({
      success: true,
      dashboard: {
        username: user.username || "Elite User",
        email: user.email || "",
        avatar: user.avatar || null,
        balance,
        spent,
        pending,
        bonus,
        health: user.status === "active" ? 99 : 72,
        notifications: notificationCount,
        verified: Boolean(user.verified),
        stats: {
          orders: user.ordersCount ?? recentOrders.length,
          growth: 12,
          completed: user.completedOrders ?? 0,
          active: pending,
        },
        ticker: [
          "System Stable",
          "Payments Running",
          "Platform Online",
          "Security Verified",
          "API Healthy",
        ],
        platforms: [
          "Telegram",
          "TikTok",
          "Instagram",
          "YouTube",
          "Facebook",
          "WhatsApp",
        ],
        alerts: [
          { title: "Security Verified", type: "success" },
          { title: "Wallet Active", type: "info" },
          { title: "Premium Route Enabled", type: "reward" },
        ],
        profile: {
          rank: rankFromRole(user.role, user.vipTier),
          joined: user.createdAt
            ? new Date(user.createdAt).getFullYear().toString()
            : "2025",
          status:
            user.status === "active"
              ? "Premium"
              : String(user.status || "Active"),
        },
        orderFeed,
        depositFeed: [
          `+$${Math.max(balance, 0)} Wallet Balance`,
          "+$50 Deposit",
          "+$120 Added",
        ],
        processingFeed: [
          "Queued",
          "Running",
          "Delivered",
          "Protected",
        ],
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error.message);
    res.status(500).json({
      success: false,
      message: "Dashboard error",
    });
  }
};
