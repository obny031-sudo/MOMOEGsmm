const User = require("../models/User");
const { getSetting } = require("../services/settingsService");
const { recordTransaction } = require("../utils/walletLedger");
const Notification = require("../models/Notification");

function isSameUtcDay(a, b) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

exports.dailyCheckIn = async (req, res) => {
  try {
    const enabled = await getSetting("dailyLoginEnabled", true);
    if (!enabled) {
      return res.status(400).json({
        success: false,
        message: "Daily reward is disabled",
      });
    }

    const reward = Number(await getSetting("dailyLoginReward", 0.00001));
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const now = new Date();
    if (user.lastCheckIn && isSameUtcDay(new Date(user.lastCheckIn), now)) {
      return res.status(400).json({
        success: false,
        message: "Already claimed today",
        claimedToday: true,
      });
    }

    const balanceBefore = user.balance ?? 0;
    user.balance = Number((balanceBefore + reward).toFixed(5));
    user.lastCheckIn = now;
    await user.save();

    await recordTransaction({
      userId: user._id,
      type: "reward",
      amount: reward,
      balanceBefore,
      balanceAfter: user.balance,
      description: "Daily check-in reward",
      referenceId: "daily-checkin",
    });

    await Notification.create({
      user: user._id,
      type: "wallet",
      title: "Daily Reward",
      text: `+$${reward} added to your wallet`,
    });

    res.status(200).json({
      success: true,
      reward,
      balance: user.balance,
      claimedToday: true,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Check-in failed" });
  }
};

exports.checkInStatus = async (req, res) => {
  const user = await User.findById(req.user._id).select("lastCheckIn balance");
  const enabled = await getSetting("dailyLoginEnabled", true);
  const reward = Number(await getSetting("dailyLoginReward", 0.00001));
  const claimedToday =
    user?.lastCheckIn &&
    isSameUtcDay(new Date(user.lastCheckIn), new Date());

  res.json({
    success: true,
    enabled,
    reward,
    claimedToday: Boolean(claimedToday),
    balance: user?.balance ?? 0,
  });
};
