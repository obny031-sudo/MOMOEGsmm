const User = require("../models/User");
const BalanceTransfer = require("../models/BalanceTransfer");
const Transaction = require("../models/Transaction");
const { recordTransaction } = require("../utils/walletLedger");
const { logAudit } = require("../utils/audit");

async function adjustBalance(req, userId, amount, type, description) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const balanceBefore = user.balance ?? 0;
  const balanceAfter = Number(Math.max(0, balanceBefore + amount).toFixed(2));

  if (amount < 0 && balanceBefore + amount < 0) {
    throw new Error("Insufficient balance to deduct");
  }

  user.balance = balanceAfter;
  await user.save();

  await recordTransaction({
    userId: user._id,
    type,
    amount,
    balanceBefore,
    balanceAfter,
    description,
    referenceId: String(req.user._id),
    metadata: { adminId: req.user._id, adminUsername: req.user.username },
  });

  await logAudit(req, {
    action: type === "deposit" ? "wallet.credit" : "wallet.debit",
    resource: "user",
    resourceId: user._id,
    metadata: { amount, balanceAfter, description },
  });

  return user;
}

exports.addBalance = async (req, res) => {
  try {
    const { userId, amount, reason = "Admin credit" } = req.body;
    const credit = Number(amount);
    if (!userId || !credit || credit <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }
    const user = await adjustBalance(req, userId, credit, "deposit", reason);
    res.json({ success: true, user: { _id: user._id, balance: user.balance } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deductBalance = async (req, res) => {
  try {
    const { userId, amount, reason = "Admin debit" } = req.body;
    const debit = Number(amount);
    if (!userId || !debit || debit <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }
    const user = await adjustBalance(req, userId, -debit, "adjustment", reason);
    res.json({ success: true, user: { _id: user._id, balance: user.balance } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.listTransfers = async (req, res) => {
  try {
    const transfers = await BalanceTransfer.find()
      .populate("fromUser", "username email")
      .populate("toUser", "username email")
      .populate("admin", "username")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, transfers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.listWalletLedger = async (req, res) => {
  try {
    const { type, userId, limit = 100 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (userId) query.user = userId;

    const transactions = await Transaction.find(query)
      .populate("user", "username email")
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
