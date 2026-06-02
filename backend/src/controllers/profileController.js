const User = require("../models/User");
const { formatUser } = require("../utils/userResponse");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "username email phone avatar role verified balance bonus spent coupons ordersCount completedOrders pendingOrders status createdAt twoFactorEnabled"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const formatted = formatUser(user);

    res.status(200).json({
      success: true,
      profile: {
        name: formatted.username,
        username: `@${formatted.username}`,
        email: formatted.email,
        phone: formatted.phone || "+20 100 000 0000",
        bio: "Elite platform member.",
        role:
          formatted.role === "admin"
            ? "Administrator"
            : formatted.role === "vip"
              ? "VIP Member"
              : "Premium Client",
        verified: formatted.verified,
        stats: {
          orders: formatted.ordersCount,
          wallet: formatted.balance,
          activity: 92,
          trust: formatted.verified ? 98 : 80,
        },
        security: {
          password: true,
          twoFactor: Boolean(user.twoFactorEnabled),
          deviceVerified: true,
        },
        joined: user.createdAt
          ? new Date(user.createdAt).getFullYear().toString()
          : "2025",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Profile error" });
  }
};
