const User = require("../models/User");

exports.getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "balance bonus spent coupons"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const balance = user.balance ?? 0;

    res.status(200).json({
      success: true,
      wallet: {
        balance,
        bonus: user.bonus ?? 0,
        spent: user.spent ?? 0,
        coupons: user.coupons ?? 0,
        transactions: [
          {
            id: 1,
            type: "Balance",
            amount: `$${balance.toFixed(2)}`,
          },
          {
            id: 2,
            type: "Bonus",
            amount: `+$${(user.bonus ?? 0).toFixed(2)}`,
          },
        ],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Wallet error" });
  }
};
