const orderProcessor = require("../services/orderProcessor");

const QUEUE_INTERVAL_MS = 8000;
const RECONCILE_INTERVAL_MS = 5 * 60 * 1000;

let queueTimer = null;
let reconcileTimer = null;

function startWorkers() {
  if (queueTimer) return;

  console.log("[workers] Order queue processor started");

  queueTimer = setInterval(() => {
    orderProcessor.tick().catch((err) => {
      console.error("[workers] Queue tick error:", err.message);
    });
  }, QUEUE_INTERVAL_MS);

  reconcileTimer = setInterval(() => {
    const Order = require("../models/Order");
    Order.countDocuments({
      status: { $in: ["Processing", "Sent"] },
      updatedAt: { $lt: new Date(Date.now() - 60 * 60 * 1000) },
    })
      .then((stale) => {
        if (stale > 0) {
          console.log(`[workers] ${stale} stale processing orders detected`);
        }
      })
      .catch(() => {});
  }, RECONCILE_INTERVAL_MS);
}

function stopWorkers() {
  if (queueTimer) clearInterval(queueTimer);
  if (reconcileTimer) clearInterval(reconcileTimer);
  queueTimer = null;
  reconcileTimer = null;
}

module.exports = { startWorkers, stopWorkers };
