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
  transferBalance,
  getOrder,
  retryOrder,
  refundOrder,
  listDeadLetters,
  bulkUpdateServices,
} = require("../controllers/adminController");
const { getFinanceDashboard } = require("../controllers/financeController");
const {
  addBalance,
  deductBalance,
  listTransfers,
  listWalletLedger,
} = require("../controllers/walletAdminController");
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const {
  getProvider,
  deleteProvider,
  testConnection,
  syncBalance,
  syncServices,
  getLogs,
  listProvidersDashboard,
} = require("../controllers/providerController");

const staff = authorize("owner", "admin", "moderator", "staff");
const adminOnly = authorize("owner", "admin");

router.use(protect, staff);

router.get("/overview", getOverview);
router.get("/health", getHealth);
router.get("/users", listUsers);
router.patch("/users/:id", updateUser);
router.get("/orders", listOrders);
router.get("/orders/:id", getOrder);
router.patch("/orders/:id", updateOrder);
router.post("/orders/:id/retry", retryOrder);
router.post("/orders/:id/refund", refundOrder);
router.get("/services", listServices);
router.post("/services", createService);
router.post("/services/bulk", adminOnly, bulkUpdateServices);
router.patch("/services/:id", updateService);
router.delete("/services/:id", adminOnly, deleteService);
router.get("/categories", listCategories);
router.post("/categories", adminOnly, createCategory);
router.patch("/categories/:id", adminOnly, updateCategory);
router.delete("/categories/:id", adminOnly, deleteCategory);
router.get("/finance", adminOnly, getFinanceDashboard);
router.post("/wallet/add", adminOnly, addBalance);
router.post("/wallet/deduct", adminOnly, deductBalance);
router.get("/wallet/transfers", adminOnly, listTransfers);
router.get("/wallet/ledger", adminOnly, listWalletLedger);
router.get("/notifications", listNotifications);
router.post("/notifications/broadcast", adminOnly, broadcastNotification);
router.get("/wallet", getWalletOverview);
router.get("/transactions", listTransactions);
router.post("/wallet/transfer", adminOnly, transferBalance);
router.get("/dead-letters", adminOnly, listDeadLetters);
router.get("/tickets", listTickets);
router.post("/tickets/:id/reply", replyTicket);
router.get("/announcements", listAnnouncements);
router.post("/announcements", createAnnouncement);
router.get("/coupons", listCoupons);
router.post("/coupons", adminOnly, createCoupon);
router.patch("/coupons/:id", adminOnly, updateCoupon);
router.get("/providers", adminOnly, listProvidersDashboard);
router.get("/providers/:id", adminOnly, getProvider);
router.post("/providers", adminOnly, createProvider);
router.patch("/providers/:id", adminOnly, updateProvider);
router.delete("/providers/:id", adminOnly, deleteProvider);
router.post("/providers/:id/test", adminOnly, testConnection);
router.post("/providers/:id/sync-balance", adminOnly, syncBalance);
router.post("/providers/:id/sync-services", adminOnly, syncServices);
router.get("/providers/:id/logs", adminOnly, getLogs);
router.get("/audit", getAuditLogs);
router.get("/export/users", exportUsers);
router.get("/export/orders", exportOrders);

router.get("/settings", adminOnly, getSettings);
router.patch("/settings", adminOnly, updateSettings);

module.exports = router;
