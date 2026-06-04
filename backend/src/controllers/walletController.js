const User = require("../models/User");
const Transaction = require("../models/Transaction");

exports.getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "balance bonus spent coupons walletFrozen"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const balance = user.balance ?? 0;

    const ledger = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(25)
      .select("type amount description balanceAfter createdAt referenceId")
      .lean();

    res.status(200).json({
      success: true,
      wallet: {
        balance,
        bonus: user.bonus ?? 0,
        spent: user.spent ?? 0,
        coupons: user.coupons ?? 0,
        frozen: Boolean(user.walletFrozen),
        currency: "EGP",
        transactions: ledger.map((tx) => ({
          id: String(tx._id),
          type: tx.type,
          amount: tx.amount,
          description: tx.description || "",
          balanceAfter: tx.balanceAfter ?? 0,
          referenceId: tx.referenceId || "",
          createdAt: tx.createdAt,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Wallet error" });
  }
};
