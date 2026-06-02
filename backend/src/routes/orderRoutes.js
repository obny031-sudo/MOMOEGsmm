const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getOrders,
  createOrder,
  reorder,
} = require("../controllers/orderController");

router.get("/", protect, getOrders);
router.post("/", protect, createOrder);
router.post("/:id/reorder", protect, reorder);

module.exports = router;
