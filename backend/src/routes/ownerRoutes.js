const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getOwnerDashboard,
  setPanicMode,
  updateAdminRole,
  forceLogoutStaff,
} = require("../controllers/ownerController");
const { getFinanceDashboard } = require("../controllers/financeController");

const ownerOnly = authorize("owner");

router.use(protect, ownerOnly);

router.get("/dashboard", getOwnerDashboard);
router.get("/finance", getFinanceDashboard);
router.post("/panic", setPanicMode);
router.post("/force-logout-staff", forceLogoutStaff);
router.patch("/admins/:id", updateAdminRole);

module.exports = router;
