const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getMyTickets,
  createTicket,
  replyTicket,
} = require("../controllers/ticketController");

router.use(protect);
router.get("/", getMyTickets);
router.post("/", createTicket);
router.post("/:id/reply", replyTicket);

module.exports = router;
