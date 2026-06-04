const Order = require("../models/Order");
const Transaction = require("../models/Transaction");
const BalanceTransfer = require("../models/BalanceTransfer");
const User = require("../models/User");

exports.getFinanceDashboard = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(startOfDay.getFullYear(), startOfDay.getMonth(), 1);

    const [
      revenueAll,
      revenueToday,
      revenueMonth,
      providerCostsAll,
      providerCostsMonth,
      refundsAll,
      depositsAll,
      transfersAll,
      walletBalances,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $in: ["Completed", "Partial"] } } },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$totalCharge" },
            providerCost: { $sum: "$providerCost" },
            profit: { $sum: "$profit" },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay },
            status: { $in: ["Completed", "Partial", "Processing", "Queued", "Sent", "Running", "Pending"] },
          },
        },
        { $group: { _id: null, revenue: { $sum: "$totalCharge" }, profit: { $sum: "$profit" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth },
            status: { $in: ["Completed", "Partial"] },
          },
        },
        { $group: { _id: null, revenue: { $sum: "$totalCharge" }, profit: { $sum: "$profit" } } },
      ]),
      Order.aggregate([
        { $group: { _id: null, cost: { $sum: "$providerCost" } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, cost: { $sum: "$providerCost" } } },
      ]),
      Transaction.aggregate([
        { $match: { type: "refund" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        { $match: { type: "deposit" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      BalanceTransfer.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $group: { _id: null, totalBalance: { $sum: "$balance" } } },
      ]),
    ]);

    const revenue = revenueAll[0]?.revenue ?? 0;
    const providerCosts = providerCostsAll[0]?.cost ?? 0;
    const grossProfit = revenueAll[0]?.profit ?? revenue - providerCosts;
    const refunds = refundsAll[0]?.total ?? 0;
    const deposits = depositsAll[0]?.total ?? 0;
    const transfers = transfersAll[0]?.total ?? 0;

    res.json({
      success: true,
      finance: {
        revenue,
        revenueToday: revenueToday[0]?.revenue ?? 0,
        revenueMonth: revenueMonth[0]?.revenue ?? 0,
        providerCosts,
        providerCostsMonth: providerCostsMonth[0]?.cost ?? 0,
        grossProfit,
        netProfit: Number((grossProfit - refunds).toFixed(2)),
        profitToday: revenueToday[0]?.profit ?? 0,
        profitMonth: revenueMonth[0]?.profit ?? 0,
        refunds,
        deposits,
        walletTransfers: transfers,
        transferCount: transfersAll[0]?.count ?? 0,
        totalWalletBalance: walletBalances[0]?.totalBalance ?? 0,
        currency: "EGP",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
