const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getOverview,
  listUsers,
  updateUser,
  listOrders,
  updateOrder,
  listServices,
  updateService,
  createService,
  deleteService,
  listNotifications,
  getWalletOverview,
  getSettings,
  updateSettings,
  getAuditLogs,
  getHealth,
  listProviders,
  createProvider,
  updateProvider,
  listCoupons,
  createCoupon,
  updateCoupon,
  listAnnouncements,
  createAnnouncement,
  broadcastNotification,
  listTickets,
  replyTicket,
  exportUsers,
  exportOrders,
  listTransactions,
} = require("../controllers/adminController");

const staff = authorize("admin", "moderator", "staff");
const adminOnly = authorize("admin");

router.use(protect, staff);

router.get("/overview", getOverview);
router.get("/health", getHealth);
router.get("/users", listUsers);
router.patch("/users/:id", updateUser);
router.get("/orders", listOrders);
router.patch("/orders/:id", updateOrder);
router.get("/services", listServices);
router.post("/services", createService);
router.patch("/services/:id", updateService);
router.delete("/services/:id", adminOnly, deleteService);
router.get("/notifications", listNotifications);
router.post("/notifications/broadcast", adminOnly, broadcastNotification);
router.get("/wallet", getWalletOverview);
router.get("/transactions", listTransactions);
router.get("/tickets", listTickets);
router.post("/tickets/:id/reply", replyTicket);
router.get("/announcements", listAnnouncements);
router.post("/announcements", createAnnouncement);
router.get("/coupons", listCoupons);
router.post("/coupons", adminOnly, createCoupon);
router.patch("/coupons/:id", adminOnly, updateCoupon);
router.get("/providers", adminOnly, listProviders);
router.post("/providers", adminOnly, createProvider);
router.patch("/providers/:id", adminOnly, updateProvider);
router.get("/audit", getAuditLogs);
router.get("/export/users", exportUsers);
router.get("/export/orders", exportOrders);

router.get("/settings", adminOnly, getSettings);
router.patch("/settings", adminOnly, updateSettings);

module.exports = router;
