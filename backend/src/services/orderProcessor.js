const Order = require("../models/Order");
const Service = require("../models/Service");
const Provider = require("../models/Provider");
const DeadLetterJob = require("../models/DeadLetterJob");
const User = require("../models/User");
const { appendTimeline } = require("../utils/orderTimeline");
const { canTransition } = require("../utils/orderStateMachine");
const {
  providerRequest,
  mapProviderStatus,
} = require("./providerClient");
const {
  loadProvider,
  recordProviderResult,
} = require("./providerService");
const { recordTransaction } = require("../utils/walletLedger");

let processing = false;

async function submitToProvider(order, provider) {
  await appendTimeline(order, "Sent", `Sent to provider ${provider.name}`);
  order.status = "Sent";
  order.provider = provider._id;
  order.queueStatus = "processing";

  const payload = {
    service: order.providerServiceId,
    link: order.link,
    quantity: order.quantity,
  };

  const { data, durationMs } = await providerRequest(
    provider,
    "add",
    payload,
    { logAction: "order", orderId: order._id }
  );

  order.providerResponses.push({
    request: payload,
    response: data,
    success: true,
  });

  const providerOrderId = String(data.order ?? data.order_id ?? "");
  if (!providerOrderId) {
    throw new Error("Provider did not return order id");
  }

  order.providerOrderId = providerOrderId;
  order.status = "Processing";
  await appendTimeline(order, "Processing", `Provider order ${providerOrderId}`);
  await recordProviderResult(provider, true, durationMs);
  await order.save();
}

async function syncOrderStatus(order) {
  if (!order.providerOrderId || !order.provider) return;

  const provider = await loadProvider(order.provider);
  const { data, durationMs } = await providerRequest(
    provider,
    "status",
    { order: order.providerOrderId },
    { logAction: "status", orderId: order._id }
  );

  order.providerResponses.push({
    request: { order: order.providerOrderId },
    response: data,
    success: true,
  });

  const mapped = mapProviderStatus(data.status);
  if (data.start_count != null) order.startCount = Number(data.start_count);
  if (data.remains != null) order.remains = Number(data.remains);
  if (data.charge != null) order.providerCost = Number(data.charge);

  if (canTransition(order.status, mapped)) {
    const prev = order.status;
    order.status = mapped;
    await appendTimeline(order, mapped, `Provider status: ${data.status}`);

    if (mapped === "Completed" || mapped === "Partial") {
      order.progress = mapped === "Completed" ? 100 : order.progress;
      order.completedAt = new Date();
      order.profit = Number((order.totalCharge - (order.providerCost || 0)).toFixed(2));
      order.queueStatus = "idle";

      if (prev !== "Completed") {
        const user = await User.findById(order.user);
        if (user) {
          user.completedOrders = (user.completedOrders ?? 0) + 1;
          user.pendingOrders = Math.max(0, (user.pendingOrders ?? 0) - 1);
          await user.save();
        }

        const service = await Service.findOne({ serviceId: order.serviceId });
        if (service) {
          service.orderCount = (service.orderCount ?? 0) + 1;
          service.revenue = Number(((service.revenue ?? 0) + order.totalCharge).toFixed(2));
          service.profit = Number(((service.profit ?? 0) + order.profit).toFixed(2));
          await service.save();
        }
      }
    }
  }

  await recordProviderResult(provider, true, durationMs);
  await order.save();
}

async function processQueuedOrders() {
  const orders = await Order.find({
    queueStatus: "queued",
    status: { $in: ["Queued", "Pending"] },
  })
    .sort({ createdAt: 1 })
    .limit(10);

  for (const order of orders) {
    try {
      const service = await Service.findOne({ serviceId: order.serviceId });
      let provider = null;

      if (service?.provider) {
        provider = await loadProvider(service.provider).catch(() => null);
      }

      if (!provider && service?.backupProvider) {
        provider = await loadProvider(service.backupProvider).catch(() => null);
        if (provider) {
          await appendTimeline(order, "Failover", "Routed to backup provider");
        }
      }

      if (!provider) {
        order.status = "Processing";
        order.queueStatus = "idle";
        await appendTimeline(
          order,
          "Processing",
          "No provider linked — manual fulfillment"
        );
        await order.save();
        continue;
      }

      order.providerServiceId =
        order.providerServiceId || service.providerServiceId;
      await submitToProvider(order, provider);
    } catch (err) {
      order.retryCount = (order.retryCount || 0) + 1;
      order.lastError = err.message;
      await appendTimeline(order, "Error", err.message);

      if (order.retryCount >= (order.maxRetries || 3)) {
        order.status = "Failed";
        order.queueStatus = "dead";
        await DeadLetterJob.create({
          jobType: "order_submit",
          order: order._id,
          provider: order.provider,
          payload: { serviceId: order.serviceId, link: order.link },
          reason: err.message,
          retries: order.retryCount,
        });
      } else {
        order.queueStatus = "queued";
        order.status = "Queued";
      }
      await order.save();
    }
  }
}

async function processActiveOrders() {
  const orders = await Order.find({
    status: { $in: ["Processing", "Sent", "Running"] },
    providerOrderId: { $ne: "" },
  })
    .sort({ updatedAt: 1 })
    .limit(20);

  for (const order of orders) {
    try {
      await syncOrderStatus(order);
    } catch (err) {
      order.lastError = err.message;
      await order.save();
    }
  }
}

async function tick() {
  if (processing) return;
  processing = true;
  try {
    await processQueuedOrders();
    await processActiveOrders();
  } finally {
    processing = false;
  }
}

exports.refundOrder = async (order, adminId, reason = "Admin refund") => {
  if (order.status === "Refunded") return order;

  const user = await User.findById(order.user);
  if (!user) throw new Error("User not found");

  const balanceBefore = user.balance ?? 0;
  user.balance = Number((balanceBefore + order.totalCharge).toFixed(2));
  await user.save();

  await recordTransaction({
    userId: user._id,
    type: "refund",
    amount: order.totalCharge,
    balanceBefore,
    balanceAfter: user.balance,
    description: reason,
    referenceId: String(order._id),
    metadata: { adminId },
  });

  order.status = "Refunded";
  order.refundedAt = new Date();
  order.queueStatus = "idle";
  await appendTimeline(order, "Refunded", reason);
  await order.save();
  return order;
};

exports.retryOrder = async (order) => {
  order.status = "Queued";
  order.queueStatus = "queued";
  order.retryCount = 0;
  order.lastError = "";
  await appendTimeline(order, "Retry", "Queued for retry");
  await order.save();
  return order;
};

exports.tick = tick;
exports.submitToProvider = submitToProvider;
