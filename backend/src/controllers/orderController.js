const Order = require("../models/Order");
const Service = require("../models/Service");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { recordTransaction } = require("../utils/walletLedger");

function formatOrder(order) {
  return {
    id: `#${String(order._id).slice(-6).toUpperCase()}`,
    _id: String(order._id),
    service: order.serviceName,
    serviceId: order.serviceId,
    link: order.link,
    quantity: order.quantity,
    status: order.status,
    amount: String(order.quantity),
    totalCharge: order.totalCharge,
    progress: order.progress,
    priority: order.priority,
    createdAt: order.createdAt,
  };
}

function priorityFromCharge(total) {
  if (total >= 100) return "High";
  if (total >= 25) return "Medium";
  return "Low";
}

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      orders: orders.map(formatOrder),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Orders error" });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { serviceId, link, quantity } = req.body;

    if (!serviceId || !link || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Service, link, and quantity are required",
      });
    }

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity",
      });
    }

    const service = await Service.findOne({
      serviceId: Number(serviceId),
      active: true,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    if (qty < service.min || qty > service.max) {
      return res.status(400).json({
        success: false,
        message: `Quantity must be between ${service.min} and ${service.max}`,
      });
    }

    const trimmedLink = String(link).trim();
    if (trimmedLink.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Valid link is required",
      });
    }

    const totalCharge = Number(((qty / 1000) * service.price).toFixed(2));

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.walletFrozen) {
      return res.status(403).json({
        success: false,
        message: "Wallet is frozen",
      });
    }

    if ((user.balance ?? 0) < totalCharge) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }

    const balanceBefore = user.balance ?? 0;
    user.balance = Number((balanceBefore - totalCharge).toFixed(2));
    user.spent = Number(((user.spent ?? 0) + totalCharge).toFixed(2));
    user.ordersCount = (user.ordersCount ?? 0) + 1;
    user.pendingOrders = (user.pendingOrders ?? 0) + 1;
    await user.save();

    await recordTransaction({
      userId: user._id,
      type: "purchase",
      amount: -totalCharge,
      balanceBefore,
      balanceAfter: user.balance,
      description: `Order: ${service.title}`,
      referenceId: String(service.serviceId),
    });

    const order = await Order.create({
      user: user._id,
      serviceId: service.serviceId,
      serviceName: service.title,
      link: trimmedLink,
      quantity: qty,
      pricePerThousand: service.price,
      totalCharge,
      amount: qty,
      status: "Pending",
      progress: 0,
      priority: priorityFromCharge(totalCharge),
    });

    await Notification.create({
      user: user._id,
      type: "order",
      title: "Order Placed",
      text: `${service.title} · ${qty} units · $${totalCharge}`,
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: formatOrder(order),
      balance: user.balance,
    });
  } catch (error) {
    console.error("Create order error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

exports.reorder = async (req, res) => {
  try {
    const original = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!original) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    req.body = {
      serviceId: original.serviceId,
      link: original.link,
      quantity: original.quantity,
    };

    return exports.createOrder(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: "Reorder failed" });
  }
};
