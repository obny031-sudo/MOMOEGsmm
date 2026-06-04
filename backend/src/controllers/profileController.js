const User = require("../models/User");
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");
const { formatUser } = require("../utils/userResponse");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "username email phone avatar role verified balance bonus spent coupons ordersCount completedOrders pendingOrders status createdAt twoFactorEnabled referralCode referralEarnings preferences walletFrozen"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const formatted = formatUser(user);
    const recentOrders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("serviceName status totalCharge createdAt");

    res.status(200).json({
      success: true,
      profile: {
        name: formatted.username,
        username: `@${formatted.username}`,
        email: formatted.email,
        phone: formatted.phone || "",
        avatar: formatted.avatar || "",
        role: formatted.role,
        verified: formatted.verified,
        walletFrozen: Boolean(user.walletFrozen),
        stats: {
          orders: formatted.ordersCount,
          completed: formatted.completedOrders,
          pending: formatted.pendingOrders,
          wallet: formatted.balance,
          spent: formatted.spent,
          bonus: formatted.bonus ?? 0,
          coupons: formatted.coupons ?? 0,
        },
        referral: {
          code: user.referralCode || formatted.username,
          earnings: user.referralEarnings ?? 0,
        },
        preferences: user.preferences || { language: "en", theme: "dark" },
        security: {
          password: true,
          twoFactor: Boolean(user.twoFactorEnabled),
        },
        joined: user.createdAt,
        recentOrders,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Profile error" });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { language, theme } = req.body;
    if (!user.preferences) user.preferences = {};
    if (language && ["en", "ar"].includes(language)) {
      user.preferences.language = language;
    }
    if (theme && ["dark", "light", "system"].includes(theme)) {
      user.preferences.theme = theme;
    }

    await user.save();
    res.json({ success: true, preferences: user.preferences });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
