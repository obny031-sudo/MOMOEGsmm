const mongoose = require("mongoose");
const User = require("../models/User");
const Order = require("../models/Order");
const Service = require("../models/Service");
const Notification = require("../models/Notification");
const AuditLog = require("../models/AuditLog");
const Coupon = require("../models/Coupon");
const Announcement = require("../models/Announcement");
const Ticket = require("../models/Ticket");
const Provider = require("../models/Provider");
const Transaction = require("../models/Transaction");
const BalanceTransfer = require("../models/BalanceTransfer");
const DeadLetterJob = require("../models/DeadLetterJob");
const { getSettingsMap, setSetting } = require("../services/settingsService");
const { logAudit } = require("../utils/audit");
const { canManageRoles } = require("../middleware/rbac");
const { recordTransaction } = require("../utils/walletLedger");
const orderProcessor = require("../services/orderProcessor");
const { appendTimeline } = require("../utils/orderTimeline");
const { canTransition } = require("../utils/orderStateMachine");

const STAFF_ROLES = ["user", "vip", "moderator", "staff", "reseller", "admin", "owner"];
exports.getOverview = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(startOfDay.getFullYear(), startOfDay.getMonth(), 1);

    const [
      totalUsers,
      activeUsers,
      admins,
      vipUsers,
      totalOrders,
      pendingOrders,
      completedOrders,
      failedOrders,
      ordersToday,
      activeServices,
      revenueAgg,
      walletAgg,
      revenueTodayAgg,
      revenueMonthAgg,
      profitTodayAgg,
      newUsersToday,
      providersOnline,
      providersTotal,
      avgServiceHealth,
      systemHealthScore,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: "active" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "vip" }),
      Order.countDocuments(),
      Order.countDocuments({
        status: { $in: ["Pending", "Queued", "Processing", "Sent", "Running"] },
      }),
      Order.countDocuments({ status: "Completed" }),
      Order.countDocuments({ status: "Failed" }),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      Service.countDocuments({ active: true }),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: "$totalCharge" }, profit: { $sum: "$profit" } } },
      ]),
      User.aggregate([
        { $group: { _id: null, totalBalance: { $sum: "$balance" } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: "$totalCharge" }, profit: { $sum: "$profit" } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$totalCharge" }, profit: { $sum: "$profit" } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfDay } } },
        { $group: { _id: null, profit: { $sum: "$profit" } } },
      ]),
      User.countDocuments({ createdAt: { $gte: startOfDay } }),
      Provider.countDocuments({ deletedAt: null, onlineStatus: "online", active: true }),
      Provider.countDocuments({ deletedAt: null, active: true }),
      Service.aggregate([
        { $match: { active: true } },
        { $group: { _id: null, avg: { $avg: "$healthScore" } } },
      ]),
      Promise.resolve([{ score: 100 }]),
    ]);

    const totalRevenue = revenueAgg[0]?.total ?? 0;
    const totalProfit = revenueAgg[0]?.profit ?? 0;
    const walletTotals = walletAgg[0] || { totalBalance: 0 };

    const [recentUsers, recentOrders] = await Promise.all([
      User.find()
        .select("username email role balance status createdAt")
        .sort({ createdAt: -1 })
        .limit(8),
      Order.find()
        .populate("user", "username email")
        .sort({ createdAt: -1 })
        .limit(8),
    ]);

    res.status(200).json({
      success: true,
      overview: {
        totalUsers,
        activeUsers,
        admins,
        vipUsers,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        totalProfit,
        revenueToday: revenueTodayAgg[0]?.total ?? 0,
        revenueMonth: revenueMonthAgg[0]?.total ?? 0,
        profitToday: profitTodayAgg[0]?.profit ?? revenueTodayAgg[0]?.profit ?? 0,
        profitMonth: revenueMonthAgg[0]?.profit ?? 0,
        failedOrders,
        ordersToday,
        newUsersToday,
        providersOnline,
        providersTotal,
        serviceHealth: Math.round(avgServiceHealth[0]?.avg ?? 100),
        systemHealth: systemHealthScore[0]?.score ?? 100,
        activeUsers,
        activeServices,
        totalWalletBalance: walletTotals.totalBalance ?? 0,
        systemStatus: "online",
      },
      recentUsers,
      recentOrders: recentOrders.map((o) => ({
        _id: o._id,
        id: `#${String(o._id).slice(-6).toUpperCase()}`,
        service: o.serviceName,
        status: o.status,
        totalCharge: o.totalCharge,
        quantity: o.quantity,
        user: o.user
          ? { username: o.user.username, email: o.user.email }
          : null,
        createdAt: o.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Admin overview error",
    });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const { search = "", role = "", status = "", page = 1, limit = 50 } =
      req.query;
    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const pageLimit = Math.min(200, Number(limit) || 50);
    const skip = (Math.max(1, Number(page)) - 1) * pageLimit;
    const [users, total] = await Promise.all([
      User.find(query)
        .select(
          "username email role balance status verified ordersCount createdAt"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit),
      User.countDocuments(query),
    ]);

    res.status(200).json({ success: true, users, total, page: Number(page) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load users" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { role, status, balance } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (role && STAFF_ROLES.includes(role)) {
      if (!canManageRoles(req.user, role)) {
        return res.status(403).json({
          success: false,
          message: "You cannot assign this role",
        });
      }
      if (["admin", "owner"].includes(user.role) && req.user.role !== "owner") {
        return res.status(403).json({
          success: false,
          message: "Cannot modify privileged accounts",
        });
      }
      user.role = role;
    }
    if (status && ["active", "suspended", "banned"].includes(status)) {
      user.status = status;
    }
    if (balance !== undefined && ["admin", "owner"].includes(req.user.role)) {
      const newBalance = Math.max(0, Number(balance));
      const diff = Number((newBalance - (user.balance ?? 0)).toFixed(2));
      if (diff !== 0) {
        const balanceBefore = user.balance ?? 0;
        user.balance = newBalance;
        await recordTransaction({
          userId: user._id,
          type: "adjustment",
          amount: diff,
          balanceBefore,
          balanceAfter: newBalance,
          description: req.body.balanceReason || "Admin balance adjustment",
          referenceId: String(req.user._id),
          metadata: { adminId: req.user._id },
        });
      }
    }

    if (req.body.walletFrozen !== undefined && req.user.role === "admin") {
      user.walletFrozen = Boolean(req.body.walletFrozen);
    }

    await user.save();
    await logAudit(req, {
      action: "user.update",
      resource: "user",
      resourceId: user._id,
      metadata: { role: user.role, status: user.status },
    });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update user" });
  }
};

function mapAdminOrder(o) {
  return {
    _id: o._id,
    id: `#${String(o._id).slice(-6).toUpperCase()}`,
    service: o.serviceName,
    category: o.category,
    link: o.link,
    quantity: o.quantity,
    status: o.status,
    totalCharge: o.totalCharge,
    providerCost: o.providerCost,
    profit: o.profit,
    progress: o.progress,
    priority: o.priority,
    providerOrderId: o.providerOrderId,
    startCount: o.startCount,
    currentCount: o.currentCount,
    remains: o.remains,
    retryCount: o.retryCount,
    healthScore: o.healthScore,
    timeline: o.timeline,
    providerResponses: o.providerResponses,
    user: o.user
      ? { _id: o.user._id, username: o.user.username, email: o.user.email }
      : null,
    provider: o.provider
      ? { _id: o.provider._id, name: o.provider.name }
      : null,
    createdAt: o.createdAt,
    completedAt: o.completedAt,
  };
}

exports.listOrders = async (req, res) => {
  try {
    const { status = "", search = "", limit = 200 } = req.query;
    const query = {};
    if (status && status !== "All") query.status = status;
    if (search) {
      const re = { $regex: search, $options: "i" };
      query.$or = [
        { serviceName: re },
        { link: re },
        { providerOrderId: re },
      ];
    }

    const orders = await Order.find(query)
      .populate("user", "username email")
      .populate("provider", "name slug onlineStatus")
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          revenue: { $sum: "$totalCharge" },
          profit: { $sum: "$profit" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      orders: orders.map(mapAdminOrder),
      stats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load orders" });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "username email balance")
      .populate("provider", "name slug");
    if (!order) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.json({ success: true, order: mapAdminOrder(order) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load order" });
  }
};

exports.retryOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    await orderProcessor.retryOrder(order);
    await logAudit(req, {
      action: "order.retry",
      resource: "order",
      resourceId: order._id,
    });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.refundOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    await orderProcessor.refundOrder(
      order,
      req.user._id,
      req.body.reason || "Admin refund"
    );
    await logAudit(req, {
      action: "order.refund",
      resource: "order",
      resourceId: order._id,
    });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { status, progress } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const prevStatus = order.status;

    if (status) {
      const allowed = Order.schema.path("status").enumValues;
      if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
      }
      if (!canTransition(order.status, status) && order.status !== status) {
        await appendTimeline(order, "Admin Override", `Status forced to ${status}`);
      }
      order.status = status;
      if (status === "Completed") {
        order.progress = 100;
        order.completedAt = new Date();
      }
      if (status === "Processing" && order.progress < 10) order.progress = 10;
    }

    if (progress !== undefined) {
      order.progress = Math.min(100, Math.max(0, Number(progress)));
    }

    await order.save();
    await logAudit(req, {
      action: "order.update",
      resource: "order",
      resourceId: order._id,
      metadata: { status: order.status, progress: order.progress },
    });

    if (prevStatus !== "Completed" && order.status === "Completed") {
      const user = await User.findById(order.user);
      if (user) {
        user.completedOrders = (user.completedOrders ?? 0) + 1;
        user.pendingOrders = Math.max(0, (user.pendingOrders ?? 0) - 1);
        await user.save();
      }
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update order" });
  }
};

exports.listServices = async (req, res) => {
  try {
    const services = await Service.find()
      .populate("provider", "name slug onlineStatus healthScore")
      .populate("backupProvider", "name slug")
      .sort({ category: 1, serviceId: 1 });
    res.status(200).json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load services" });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    const fields = [
      "title",
      "category",
      "subcategory",
      "description",
      "price",
      "costPrice",
      "sellingPrice",
      "profitMargin",
      "min",
      "max",
      "speed",
      "active",
      "featured",
      "provider",
      "backupProvider",
      "providerServiceId",
      "syncStatus",
    ];
    fields.forEach((key) => {
      if (req.body[key] !== undefined) service[key] = req.body[key];
    });

    await service.save();
    await logAudit(req, {
      action: "service.update",
      resource: "service",
      resourceId: service._id,
      metadata: req.body,
    });
    res.status(200).json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update service" });
  }
};

exports.createService = async (req, res) => {
  try {
    const last = await Service.findOne().sort({ serviceId: -1 });
    const nextId = (last?.serviceId ?? 0) + 1;

    const costPrice = Number(req.body.costPrice) || 0;
    const margin = Number(req.body.profitPercent) || 20;
    const selling =
      Number(req.body.sellingPrice) ||
      Number(req.body.price) ||
      (costPrice > 0 ? Number((costPrice * (1 + margin / 100)).toFixed(4)) : 10);

    const service = await Service.create({
      serviceId: nextId,
      title: req.body.title,
      category: req.body.category,
      subcategory: req.body.subcategory || "",
      description: req.body.description || "",
      price: selling,
      costPrice,
      sellingPrice: selling,
      min: req.body.min ?? 100,
      max: req.body.max ?? 10000,
      speed: req.body.speed ?? "Fast",
      active: req.body.active !== false,
      featured: Boolean(req.body.featured),
      provider: req.body.provider || null,
      backupProvider: req.body.backupProvider || null,
      providerServiceId: req.body.providerServiceId || "",
    });

    await logAudit(req, {
      action: "service.create",
      resource: "service",
      resourceId: service._id,
    });
    res.status(201).json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create service" });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    await logAudit(req, {
      action: "service.delete",
      resource: "service",
      resourceId: req.params.id,
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

exports.listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate("user", "username email")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load notifications",
    });
  }
};

exports.getWalletOverview = async (req, res) => {
  try {
    const users = await User.find()
      .select("username email balance spent bonus walletFrozen")
      .sort({ balance: -1 })
      .limit(50);

    const totals = await User.aggregate([
      {
        $group: {
          _id: null,
          totalBalance: { $sum: "$balance" },
          totalSpent: { $sum: "$spent" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      totals: totals[0] || { totalBalance: 0, totalSpent: 0 },
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Wallet overview error" });
  }
};

exports.getSettings = async (req, res) => {
  const settings = await getSettingsMap();
  res.json({ success: true, settings });
};

exports.updateSettings = async (req, res) => {
  const allowed = [
    "siteName",
    "currency",
    "defaultNewUserBalance",
    "dailyLoginReward",
    "dailyLoginEnabled",
    "maintenanceMode",
    "maintenanceMessage",
    "registrationEnabled",
    "depositsEnabled",
    "withdrawalsEnabled",
    "minDeposit",
    "minOrder",
    "referralPercent",
    "telegram",
    "whatsapp",
    "supportEmail",
    "featureCoupons",
    "featureReferrals",
    "featureDailyReward",
  ];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      await setSetting(key, req.body[key]);
    }
  }
  await logAudit(req, {
    action: "settings.update",
    resource: "settings",
    metadata: req.body,
  });
  res.json({ success: true, settings: await getSettingsMap() });
};

exports.getAuditLogs = async (req, res) => {
  try {
    const { action = "", resource = "", search = "", limit = 150 } = req.query;
    const query = {};
    if (action) query.action = { $regex: action, $options: "i" };
    if (resource) query.resource = resource;
    if (search) {
      query.$or = [
        { actorUsername: { $regex: search, $options: "i" } },
        { action: { $regex: search, $options: "i" } },
        { resourceId: { $regex: search, $options: "i" } },
      ];
    }
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkUpdateServices = async (req, res) => {
  try {
    const { ids, updates } = req.body;
    if (!Array.isArray(ids) || !ids.length || !updates) {
      return res.status(400).json({ success: false, message: "Invalid bulk payload" });
    }

    const allowed = [
      "active",
      "price",
      "sellingPrice",
      "costPrice",
      "category",
      "subcategory",
      "provider",
      "providerServiceId",
    ];
    const patch = {};
    allowed.forEach((k) => {
      if (updates[k] !== undefined) patch[k] = updates[k];
    });

    if (updates.pricePercent !== undefined) {
      const services = await Service.find({ _id: { $in: ids } });
      for (const s of services) {
        const pct = Number(updates.pricePercent);
        s.price = Number((s.price * (1 + pct / 100)).toFixed(4));
        s.sellingPrice = s.price;
        await s.save();
      }
      await logAudit(req, {
        action: "service.bulk_price",
        resource: "service",
        metadata: { count: ids.length, pricePercent: updates.pricePercent },
      });
      return res.json({ success: true, updated: ids.length });
    }

    const result = await Service.updateMany({ _id: { $in: ids } }, { $set: patch });
    await logAudit(req, {
      action: "service.bulk_update",
      resource: "service",
      metadata: { count: ids.length, patch },
    });
    res.json({ success: true, updated: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHealth = async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const settings = await getSettingsMap();
  const providers = await Provider.find({ deletedAt: null, active: true });
  const deadLetters = await DeadLetterJob.countDocuments({ resolved: false });

  const checks = [
    {
      name: "MongoDB",
      status: dbState === 1 ? "healthy" : "critical",
      detail: dbState === 1 ? "connected" : "disconnected",
    },
    {
      name: "API",
      status: "healthy",
      detail: "online",
    },
    {
      name: "Queue",
      status: deadLetters > 5 ? "warning" : "healthy",
      detail: `${deadLetters} dead-letter jobs`,
    },
    {
      name: "Providers",
      status:
        providers.length === 0
          ? "warning"
          : providers.some((p) => p.onlineStatus === "online")
            ? "healthy"
            : "warning",
      detail: `${providers.filter((p) => p.onlineStatus === "online").length}/${providers.length} online`,
    },
    {
      name: "Maintenance",
      status: settings.maintenanceMode ? "warning" : "healthy",
      detail: settings.maintenanceMode ? "enabled" : "off",
    },
  ];

  res.json({
    success: true,
    health: {
      api: "online",
      database: dbState === 1 ? "connected" : "disconnected",
      uptime: process.uptime(),
      memory: process.memoryUsage().rss,
      timestamp: new Date().toISOString(),
      checks,
      launchStatus: checks.some((c) => c.status === "critical")
        ? "critical"
        : checks.some((c) => c.status === "warning")
          ? "warning"
          : "healthy",
    },
  });
};

exports.listProviders = async (req, res) => {
  const providers = await Provider.find({ deletedAt: null }).select(
    "-apiKey"
  );
  res.json({ success: true, providers });
};

exports.createProvider = async (req, res) => {
  const slug =
    req.body.slug ||
    String(req.body.name || "provider")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  const provider = await Provider.create({ ...req.body, slug });
  await logAudit(req, {
    action: "provider.create",
    resource: "provider",
    resourceId: provider._id,
  });
  res.status(201).json({ success: true, provider });
};

exports.updateProvider = async (req, res) => {
  const provider = await Provider.findById(req.params.id).select("+apiKey");
  if (!provider) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  Object.assign(provider, req.body);
  await provider.save();
  await logAudit(req, {
    action: "provider.update",
    resource: "provider",
    resourceId: provider._id,
  });
  res.json({ success: true, provider });
};

exports.listCoupons = async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, coupons });
};

exports.createCoupon = async (req, res) => {
  const coupon = await Coupon.create(req.body);
  await logAudit(req, {
    action: "coupon.create",
    resource: "coupon",
    resourceId: coupon._id,
  });
  res.status(201).json({ success: true, coupon });
};

exports.updateCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json({ success: true, coupon });
};

exports.listAnnouncements = async (req, res) => {
  const announcements = await Announcement.find().sort({ createdAt: -1 });
  res.json({ success: true, announcements });
};

exports.createAnnouncement = async (req, res) => {
  const item = await Announcement.create({
    ...req.body,
    createdBy: req.user._id,
  });
  await logAudit(req, {
    action: "announcement.create",
    resource: "announcement",
    resourceId: item._id,
  });
  res.status(201).json({ success: true, announcement: item });
};

exports.broadcastNotification = async (req, res) => {
  const { title, text, type = "system" } = req.body;
  const users = await User.find({ status: "active" }).select("_id");
  const docs = users.map((u) => ({
    user: u._id,
    type,
    title,
    text,
  }));
  await Notification.insertMany(docs.slice(0, 500));
  await logAudit(req, {
    action: "notification.broadcast",
    resource: "notification",
    metadata: { count: docs.length, title },
  });
  res.json({ success: true, sent: docs.length });
};

exports.listTickets = async (req, res) => {
  const tickets = await Ticket.find()
    .populate("user", "username email")
    .sort({ updatedAt: -1 })
    .limit(100);
  res.json({ success: true, tickets });
};

exports.replyTicket = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  ticket.messages.push({
    sender: "admin",
    message: req.body.message,
  });
  ticket.status = req.body.status || "Pending";
  await ticket.save();
  await logAudit(req, {
    action: "ticket.reply",
    resource: "ticket",
    resourceId: ticket._id,
  });
  res.json({ success: true, ticket });
};

exports.exportUsers = async (req, res) => {
  const users = await User.find()
    .select("username email role balance status createdAt")
    .lean();
  res.json({ success: true, export: users });
};

exports.exportOrders = async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).limit(1000).lean();
  res.json({ success: true, export: orders });
};

exports.listTransactions = async (req, res) => {
  try {
    const { type = "", userId = "", limit = 100 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (userId) query.user = userId;

    const txs = await Transaction.find(query)
      .populate("user", "username email")
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    res.json({ success: true, transactions: txs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.transferBalance = async (req, res) => {
  try {
    const { fromUserId, toUserId, amount, note = "" } = req.body;
    const transferAmount = Number(amount);
    if (!fromUserId || !toUserId || !transferAmount || transferAmount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid transfer" });
    }

    const [fromUser, toUser] = await Promise.all([
      User.findById(fromUserId),
      User.findById(toUserId),
    ]);

    if (!fromUser || !toUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if ((fromUser.balance ?? 0) < transferAmount) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    const fromBefore = fromUser.balance ?? 0;
    const toBefore = toUser.balance ?? 0;

    fromUser.balance = Number((fromBefore - transferAmount).toFixed(2));
    toUser.balance = Number((toBefore + transferAmount).toFixed(2));

    await fromUser.save();
    await toUser.save();

    await recordTransaction({
      userId: fromUser._id,
      type: "adjustment",
      amount: -transferAmount,
      balanceBefore: fromBefore,
      balanceAfter: fromUser.balance,
      description: `Transfer to ${toUser.username}`,
      referenceId: String(toUser._id),
      metadata: { transfer: true },
    });

    await recordTransaction({
      userId: toUser._id,
      type: "adjustment",
      amount: transferAmount,
      balanceBefore: toBefore,
      balanceAfter: toUser.balance,
      description: `Transfer from ${fromUser.username}`,
      referenceId: String(fromUser._id),
      metadata: { transfer: true },
    });

    const transfer = await BalanceTransfer.create({
      fromUser: fromUser._id,
      toUser: toUser._id,
      amount: transferAmount,
      admin: req.user._id,
      note,
    });

    await logAudit(req, {
      action: "wallet.transfer",
      resource: "user",
      resourceId: toUser._id,
      metadata: { fromUserId, amount: transferAmount },
    });

    res.json({ success: true, transfer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.listDeadLetters = async (req, res) => {
  try {
    const jobs = await DeadLetterJob.find({ resolved: false })
      .populate("order")
      .populate("provider", "name")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
