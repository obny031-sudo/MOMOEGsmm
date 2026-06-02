const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  dailyCheckIn,
  checkInStatus,
} = require("../controllers/engagementController");

router.get("/check-in/status", protect, checkInStatus);
router.post("/check-in", protect, dailyCheckIn);

module.exports = router;
