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
const { getSettingsMap, setSetting } = require("../services/settingsService");
const { logAudit } = require("../utils/audit");
const { canManageRoles } = require("../middleware/rbac");

const STAFF_ROLES = ["user", "vip", "moderator", "staff", "reseller", "admin"];
exports.getOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      admins,
      vipUsers,
      totalOrders,
      pendingOrders,
      completedOrders,
      activeServices,
      revenueAgg,
      walletAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: "active" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "vip" }),
      Order.countDocuments(),
      Order.countDocuments({ status: "Pending" }),
      Order.countDocuments({ status: "Completed" }),
      Service.countDocuments({ active: true }),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: "$totalCharge" } } },
      ]),
      User.aggregate([
        { $group: { _id: null, totalBalance: { $sum: "$balance" } } },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.total ?? 0;
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
    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query)
        .select(
          "username email role balance status verified ordersCount createdAt"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
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
      if (user.role === "admin" && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Cannot modify admin accounts",
        });
      }
      user.role = role;
    }
    if (status && ["active", "suspended", "banned"].includes(status)) {
      user.status = status;
    }
    if (balance !== undefined && req.user.role === "admin") {
      user.balance = Math.max(0, Number(balance));
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

exports.listOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "username email")
      .sort({ createdAt: -1 })
      .limit(200);

    res.status(200).json({
      success: true,
      orders: orders.map((o) => ({
        _id: o._id,
        id: `#${String(o._id).slice(-6).toUpperCase()}`,
        service: o.serviceName,
        link: o.link,
        quantity: o.quantity,
        status: o.status,
        totalCharge: o.totalCharge,
        progress: o.progress,
        priority: o.priority,
        user: o.user
          ? { username: o.user.username, email: o.user.email }
          : null,
        createdAt: o.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load orders" });
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

    if (
      status &&
      ["Pending", "Running", "Completed", "Cancelled"].includes(status)
    ) {
      order.status = status;
      if (status === "Completed") order.progress = 100;
      if (status === "Running" && order.progress < 10) order.progress = 10;
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
    const services = await Service.find().sort({ category: 1, serviceId: 1 });
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
      "price",
      "min",
      "max",
      "speed",
      "active",
      "featured",
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

    const service = await Service.create({
      serviceId: nextId,
      title: req.body.title,
      category: req.body.category,
      price: req.body.price ?? 10,
      min: req.body.min ?? 100,
      max: req.body.max ?? 10000,
      speed: req.body.speed ?? "Fast",
      active: req.body.active !== false,
      featured: Boolean(req.body.featured),
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
    "defaultNewUserBalance",
    "dailyLoginReward",
    "dailyLoginEnabled",
    "maintenanceMode",
    "maintenanceMessage",
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
  const logs = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ success: true, logs });
};

exports.getHealth = async (req, res) => {
  const dbState = mongoose.connection.readyState;
  res.json({
    success: true,
    health: {
      api: "online",
      database: dbState === 1 ? "connected" : "disconnected",
      uptime: process.uptime(),
      memory: process.memoryUsage().rss,
      timestamp: new Date().toISOString(),
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
  const provider = await Provider.create(req.body);
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
  const txs = await Transaction.find()
    .populate("user", "username email")
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ success: true, transactions: txs });
};
